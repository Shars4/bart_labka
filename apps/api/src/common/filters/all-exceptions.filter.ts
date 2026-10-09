import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client.js';
import type {
  ErrorDetailDto,
  ErrorResponseDto,
} from '../dto/error-response.dto.js';
import {
  defaultMessageForStatus,
  errorCodeForStatus,
} from '../errors/error-codes.js';

interface ResolvedError {
  status: number;
  code: string;
  message: string;
  details?: ErrorDetailDto[];
}

/** Payload our own code may pass to an HttpException constructor. */
interface ExceptionPayload {
  code?: string;
  message?: unknown;
  details?: ErrorDetailDto[];
}

/**
 * Messages Nest generates by itself are English and often technical
 * ("Cannot GET /api/x", "Forbidden resource"). They are replaced with a
 * Slovak message: the given replacement, or the default for the status.
 * Messages written in our own code pass through unchanged.
 */
const FRAMEWORK_MESSAGES: { pattern: RegExp; replacement?: string }[] = [
  // Unknown route.
  { pattern: /^Cannot [A-Z]+ \// },
  // A guard returned false.
  { pattern: /^Forbidden resource$/ },
  { pattern: /^ThrottlerException/ },
  // The Express adapter turns body-parser's SyntaxError into
  // `new BadRequestException(error.message)`, e.g. "Unexpected token ...
  // in JSON at position 1"; the original error type is lost on the way.
  {
    pattern: /\bJSON\b/,
    replacement: 'Telo požiadavky nie je platný JSON.',
  },
  // Malformed percent-encoding in the path, e.g. "/%FF" (URIError, or the
  // Express 5 router's "Failed to decode param '%FF'").
  {
    pattern: /^URI malformed$|^Failed to decode param/,
    replacement: 'Adresa požiadavky nie je platná.',
  },
];

/**
 * Database errors that are the client's fault. Services may still check
 * these cases explicitly to return a more specific message; this mapping is
 * the safety net. Any other Prisma error is a 500.
 */
const PRISMA_ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Niektorá z hodnôt je príliš dlhá.',
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Záznam s rovnakou hodnotou už existuje.',
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'Operácia by porušila väzbu na iný záznam.',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Požadovaný záznam neexistuje.',
  },
  // CHECK constraint violation (Postgres 23514) via @prisma/adapter-pg.
  P2039: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Údaje nespĺňajú pravidlá databázy.',
  },
};

/**
 * Single place that turns every error into the documented ErrorResponseDto
 * shape. Unknown errors become a generic 500 and are logged with their
 * stack; the stack is never sent to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request: unknown = ctx.getRequest();
    const url = String(httpAdapter.getRequestUrl(request));
    const method = String(httpAdapter.getRequestMethod(request));

    const { status, code, message, details } = this.resolve(exception);

    if (status >= 500) {
      if (exception instanceof HttpException) {
        // Thrown on purpose (e.g. 503 from the health check); the cause was
        // already logged where it happened, so the stack would only be noise.
        this.logger.warn(`${method} ${url} -> ${status}: ${message}`);
      } else {
        this.logger.error(
          `${method} ${url} -> ${status}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
    }

    const body: ErrorResponseDto = {
      statusCode: status,
      error: code,
      message,
      ...(details?.length ? { details } : {}),
      path: url.split('?')[0],
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.fromPrismaError(exception);
      if (prismaError) {
        return prismaError;
      }
    }

    const bodyParserError = this.fromBodyParserError(exception);
    if (bodyParserError) {
      return bodyParserError;
    }

    return this.withDefaults(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private fromHttpException(exception: HttpException): ResolvedError {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const payload: ExceptionPayload =
      typeof response === 'string' ? { message: response } : response;

    return {
      status,
      code: payload.code ?? errorCodeForStatus(status),
      message: userFacingMessage(payload.message, status),
      details: payload.details,
    };
  }

  private fromPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ResolvedError | null {
    const mapped = PRISMA_ERRORS[exception.code];
    if (!mapped) {
      return null;
    }

    // Too-long values and CHECK violations should have been caught by DTO
    // validation; reaching the database means a validation rule is missing.
    if (mapped.status === HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        `Database rejected data that passed validation (${exception.code}): ${exception.message}`,
      );
    }

    return {
      status: mapped.status,
      code: errorCodeForStatus(mapped.status),
      message: mapped.message,
    };
  }

  /**
   * Express' body parser errors other than invalid JSON (e.g. a body over
   * the size limit) reach the filter as-is; they carry `type` and `status`.
   */
  private fromBodyParserError(exception: unknown): ResolvedError | null {
    if (
      typeof exception !== 'object' ||
      exception === null ||
      !('type' in exception) ||
      typeof exception.type !== 'string' ||
      !exception.type.startsWith('entity.')
    ) {
      return null;
    }

    const status =
      'status' in exception && typeof exception.status === 'number'
        ? exception.status
        : HttpStatus.BAD_REQUEST;
    return this.withDefaults(status);
  }

  private withDefaults(status: number): ResolvedError {
    return {
      status,
      code: errorCodeForStatus(status),
      message: defaultMessageForStatus(status),
    };
  }
}

function userFacingMessage(message: unknown, status: number): string {
  // Exceptions created without a message default to the reason phrase,
  // e.g. `new NotFoundException()` -> "Not Found".
  if (
    typeof message !== 'string' ||
    message.trim() === '' ||
    message === reasonPhrase(status)
  ) {
    return defaultMessageForStatus(status);
  }

  const frameworkMessage = FRAMEWORK_MESSAGES.find(({ pattern }) =>
    pattern.test(message),
  );
  if (frameworkMessage) {
    return frameworkMessage.replacement ?? defaultMessageForStatus(status);
  }

  return message;
}

function reasonPhrase(status: number): string {
  return errorCodeForStatus(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
