import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';
import type { User } from '../../generated/prisma/client.js';

export class UserDto {
  /** @example 1 */
  id: number;

  /** @example admin@utulok.local */
  email: string;

  /** @example Správca útulku */
  name: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;
}

/** Maps the DB row explicitly, so fields like passwordHash never leak. */
export function toUserDto(user: User): UserDto {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
