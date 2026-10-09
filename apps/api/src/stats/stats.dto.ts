export class AnimalStatsDto {
  /** @example 12 */
  total: number;

  /** @example 8 */
  available: number;

  /** @example 2 */
  reserved: number;

  /** @example 2 */
  adopted: number;
}

export class AdoptionRequestStatsDto {
  /** @example 6 */
  total: number;

  /** @example 3 */
  pending: number;

  /** @example 2 */
  approved: number;

  /** @example 1 */
  rejected: number;
}

export class StatsDto {
  animals: AnimalStatsDto;

  adoptionRequests: AdoptionRequestStatsDto;
}
