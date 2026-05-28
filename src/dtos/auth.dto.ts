import { IsEmail, IsString, MinLength } from 'class-validator';

class loginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(5, {
    message: 'provide valid password',
  })
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
