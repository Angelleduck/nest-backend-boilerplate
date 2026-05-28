import { IsEmail, IsString, MinLength } from 'class-validator';

export class createUserDto {
  @IsString()
  @MinLength(4, { message: 'name is too short' })
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'password is too short' })
  password!: string;
}
