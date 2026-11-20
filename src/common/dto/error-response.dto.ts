import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['email must be an email'],
  })
  message!: string | string[];

  @ApiProperty({ example: '/api/v1/auth/login' })
  path!: string;

  @ApiProperty({ example: '2026-11-20T10:30:00.000Z' })
  timestamp!: string;
}