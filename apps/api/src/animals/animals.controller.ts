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
import { CurrentUser, Public } from '../auth/decorators.js';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { AnimalsService } from './animals.service.js';
import { AnimalDto, PaginatedAnimalsDto } from './dto/animal.dto.js';
import { AnimalQueryDto } from './dto/animal-query.dto.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';

@ApiTags('animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Zoznam zvierat',
    description: 'Stránkovaný zoznam s filtrami, vyhľadávaním a zoradením.',
  })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST)
  findMany(@Query() query: AnimalQueryDto): Promise<PaginatedAnimalsDto> {
    return this.animalsService.findMany(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Detail zvieraťa' })
  @ApiErrorResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  findOne(@Param('id', ParseIdPipe) id: number): Promise<AnimalDto> {
    return this.animalsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pridanie zvieraťa',
    description: 'Hlavička `Location` obsahuje adresu nového zvieraťa.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
  )
  async create(
    @Body() dto: CreateAnimalDto,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AnimalDto> {
    const animal = await this.animalsService.create(dto, user.id);
    response.location(`/${API_PREFIX}/animals/${animal.id}`);
    return animal;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Úprava zvieraťa',
    description:
      'Zmení iba poslané polia. `null` vymaže voliteľné polia (plemeno, dátum narodenia, obrázok).',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
  )
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateAnimalDto,
  ): Promise<AnimalDto> {
    return this.animalsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Odstránenie zvieraťa',
    description: 'Odstráni aj všetky žiadosti o adopciu tohto zvieraťa.',
  })
  @ApiErrorResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
  )
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.animalsService.remove(id);
  }
}
