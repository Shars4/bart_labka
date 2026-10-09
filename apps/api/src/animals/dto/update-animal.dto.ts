import { PartialType } from '@nestjs/swagger';
import { CreateAnimalDto } from './create-animal.dto.js';

/**
 * Every field is optional, but `null` is only accepted for nullable fields
 * (breed, birthDate, imageUrl). `skipNullProperties: false` keeps
 * `{ "name": null }` from passing validation and failing in the database.
 */
export class UpdateAnimalDto extends PartialType(CreateAnimalDto, {
  skipNullProperties: false,
}) {}
