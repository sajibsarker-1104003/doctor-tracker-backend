import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: '674d1f0e8b1c2a3d4e5f6a7b' })
  id!: string;

  @ApiProperty({ example: 'Admin' })
  name!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;
}

export class TokensResponseDto {
  @ApiProperty({ description: 'Short-lived JWT (default 15m)' })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived JWT (default 7d)' })
  refreshToken!: string;
}

export class LoginResponseDto extends TokensResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}