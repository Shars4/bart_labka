import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StatsDto } from './stats.dto.js';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Counts per status, computed in the database with GROUP BY. */
  async getStats(): Promise<StatsDto> {
    const [animalGroups, requestGroups] = await this.prisma.$transaction([
      this.prisma.animal.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
      this.prisma.adoptionRequest.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const animals = countsByStatus(animalGroups);
    const requests = countsByStatus(requestGroups);

    return {
      animals: {
        total: sum(animals),
        available: animals.AVAILABLE ?? 0,
        reserved: animals.RESERVED ?? 0,
        adopted: animals.ADOPTED ?? 0,
      },
      adoptionRequests: {
        total: sum(requests),
        pending: requests.PENDING ?? 0,
        approved: requests.APPROVED ?? 0,
        rejected: requests.REJECTED ?? 0,
      },
    };
  }
}

function countsByStatus(
  groups: { status: string; _count?: { _all?: number } | true }[],
): Record<string, number> {
  return Object.fromEntries(
    groups.map((group) => [
      group.status,
      typeof group._count === 'object' ? (group._count._all ?? 0) : 0,
    ]),
  );
}

function sum(counts: Record<string, number>): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}
