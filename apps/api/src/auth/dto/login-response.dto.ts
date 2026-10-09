import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto.js';

export class LoginResponseDto {
  /** JWT for the `Authorization: Bearer <token>` header. */
  accessToken: string;

  @ApiProperty({ enum: ['Bearer'], example: 'Bearer' })
  tokenType: 'Bearer';

  /**
   * Token lifetime in seconds.
   * @example 28800
   */
  expiresIn: number;

  user: UserDto;
}
