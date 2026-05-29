import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

class loginUserDto {
  @IsEmail()
  @ApiProperty({ description: "user's email", example: 'xena@yahoo.fr' })
  email!: string;

  @IsString()
  @MinLength(5, {
    message: 'provide valid password',
  })
  @ApiProperty({ description: "user's password" })
  password!: string;
}

class registerUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'password is too short' })
  password!: string;
}

export { loginUserDto, registerUserDto };
