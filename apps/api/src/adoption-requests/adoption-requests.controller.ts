import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../app.setup.js';
import type { AuthUser } from '../auth/auth-user.js';
import {
  Authenticated,
  CurrentUser,
  OptionalUser,
  Public,
} from '../auth/decorators.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { RateLimited } from '../common/throttling/rate-limit.js';
import { AdoptionRequestsService } from './adoption-requests.service.js';
import {
  AdoptionRequestDto,
  PaginatedAdoptionRequestsDto,
} from './dto/adoption-request.dto.js';
import { AdoptionRequestQueryDto } from './dto/adoption-request-query.dto.js';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto.js';
import { UpdateAdoptionRequestDto } from './dto/update-adoption-request.dto.js';

/** Public submission, nested under the animal it is about. */
@ApiTags('adoption-requests')
@Controller('animals/:animalId/adoption-requests')
export class AnimalAdoptionRequestsController {
  constructor(private readonly service: AdoptionRequestsService) {}

  @Post()
  @Public()
  @RateLimited()
  @ApiOperation({
    summary: 'Odoslanie žiadosti o adopciu',
    description:
      'Verejný endpoint, prihlásenie je nepovinné. Ak je priložený platný token používateľa, žiadosť sa priradí k jeho účtu a použije sa email z účtu. Zviera musí byť v stave AVAILABLE a z jedného emailu môže k zvieraťu existovať iba jedna čakajúca žiadosť. Počet žiadostí z jednej IP adresy je obmedzený.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
    HttpStatus.TOO_MANY_REQUESTS,
  )
  async create(
    @Param('animalId', ParseIdPipe) animalId: number,
    @Body() dto: CreateAdoptionRequestDto,
    @OptionalUser() user: AuthUser | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdoptionRequestDto> {
    const request = await this.service.create(animalId, dto, user);
    response.location(`/${API_PREFIX}/adoption-requests/${request.id}`);
    return request;
  }
}

/** The signed-in user's own requests. */
@ApiTags('adoption-requests')
@ApiBearerAuth()
@Authenticated()
@Controller('me/adoption-requests')
export class MyAdoptionRequestsController {
  constructor(private readonly service: AdoptionRequestsService) {}

  @Get()
  @ApiOperation({
    summary: 'Moje žiadosti o adopciu',
    description:
      'Žiadosti odoslané z účtu prihláseného používateľa aj staršie anonymné žiadosti z rovnakého (overeného) emailu. Najnovšie sú prvé.',
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedAdoptionRequestsDto> {
    return this.service.findMine(user, query);
  }
}

/** Administration of submitted requests. */
@ApiTags('adoption-requests')
@ApiBearerAuth()
@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly service: AdoptionRequestsService) {}

  @Get()
  @ApiOperation({
    summary: 'Zoznam žiadostí o adopciu',
    description: 'Najnovšie žiadosti sú prvé.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
  )
  findMany(
    @Query() query: AdoptionRequestQueryDto,
  ): Promise<PaginatedAdoptionRequestsDto> {
    return this.service.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail žiadosti o adopciu' })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
  )
  findOne(@Param('id', ParseIdPipe) id: number): Promise<AdoptionRequestDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Schválenie alebo zamietnutie žiadosti',
    description:
      'Meniť sa dá iba čakajúca žiadosť. Schválenie označí zviera ako adoptované a ostatné čakajúce žiadosti o neho zamietne.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
  )
  resolve(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateAdoptionRequestDto,
  ): Promise<AdoptionRequestDto> {
    return this.service.resolve(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Odstránenie žiadosti o adopciu' })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
  )
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
