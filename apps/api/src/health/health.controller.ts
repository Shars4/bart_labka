import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators.js';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator.js';
import { ErrorCode } from '../common/errors/error-codes.js';
import { PrismaService } from '../prisma/prisma.service.js';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok'] })
  status: 'ok';

  @ApiProperty({ example: 'up', enum: ['up'] })
  database: 'up';
}

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Stav služby',
    description:
      'Overí aj spojenie s databázou. Používa ho Docker healthcheck, web sa spúšťa až keď vráti 200.',
  })
  @ApiErrorResponses(HttpStatus.SERVICE_UNAVAILABLE)
  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new ServiceUnavailableException({
        code: ErrorCode.ServiceUnavailable,
        message: 'Databáza je dočasne nedostupná.',
      });
    }
    return { status: 'ok', database: 'up' };
  }
}
