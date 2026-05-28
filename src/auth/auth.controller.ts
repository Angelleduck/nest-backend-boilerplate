import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginUserDto, registerUserDto } from 'src/dtos/auth.dto';
import type { Request, Response } from 'express';
import { RefreshGuard } from './guards/auth/refresh.guard';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from './guards/auth/auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import type { AuthenticatedRequest, RefreshRequest } from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  Login(@Body() body: loginUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(body, res);
  }

  @Public()
  @Post('register')
  register(@Body() body: registerUserDto) {
    return this.authService.signUp(body);
  }

  @UseGuards(RefreshGuard)
  @Public()
  @Post('refresh')
  refreshToken(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  signOut(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    return this.authService.signOut(userId, res);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleSignIn() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallBack(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    await this.authService.logGoogleUser(userId, res);
    res.redirect('http://localhost:3000/users');
  }
}
