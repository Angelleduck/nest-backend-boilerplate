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
import type { Response } from 'express';
import { RefreshGuard } from './guards/auth/refresh.guard';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from './guards/auth/auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import type { AuthenticatedRequest, RefreshRequest } from 'src/types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Sign user' })
  @ApiResponse({ status: 200, description: 'user logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  Login(@Body() body: loginUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(body, res);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'user created' })
  @Post('register')
  register(@Body() body: registerUserDto) {
    return this.authService.signUp(body);
  }

  @UseGuards(RefreshGuard)
  @Public()
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiResponse({ status: 200, description: 'access token refreshed' })
  @Post('refresh')
  refreshToken(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Login user out, need valid token' })
  @ApiResponse({ status: 200, description: 'user logged out' })
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
  @ApiOperation({ summary: 'Login user with google' })
  @Get('google/login')
  googleSignIn() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirecting authenticated user' })
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
