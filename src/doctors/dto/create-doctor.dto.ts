import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ToLowerCase, Trim } from '../../common/decorators/transform.decorators.js';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Rahim Uddin' })
  @IsString() @IsNotEmpty() @MaxLength(100) @Trim()
  name!: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString() @IsNotEmpty() @MaxLength(100) @Trim()
  specialization!: string;

  @ApiProperty({ example: 'Square Hospital' })
  @IsString() @IsNotEmpty() @MaxLength(150) @Trim()
  hospital!: string;

  @ApiProperty({ example: '+8801712345678' })
  @IsString() @Matches(/^\+?[0-9\s-]{7,15}$/, { message: 'phone must be a valid phone number' }) @Trim()
  phone!: string;

  @ApiProperty({ example: 'rahim@example.com' })
  @IsEmail() @ToLowerCase()
  email!: string;
}