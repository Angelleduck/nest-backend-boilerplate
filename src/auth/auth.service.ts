import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { DatabaseService } from 'src/database/database.service';
import { loginUserDto, registerUserDto } from 'src/dtos/auth.dto';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { createUserDto } from 'src/dtos/create-user.dto';
import { RefreshRequest } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private accessCookieOptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 30,
  };

  private refreshCookieOptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  };

  async signIn(data: loginUserDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.password, data.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokensAndSetCookies(user.id, res);
  }

  async signUp(data: registerUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return { user };
  }

  async refreshToken(req: RefreshRequest, res: Response) {
    const userId = req.user.id;
    const refresh_token = req.cookies.refresh_token;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshValid = await argon2.verify(
      user.hashedRefreshToken,
      refresh_token,
    );

    if (!refreshValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokensAndSetCookies(user.id, res);
  }

  async signOut(userId: number, res: Response) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { success: true };
  }

  private async issueTokensAndSetCookies(userId: number, res: Response) {
    const { access_token, refresh_token } = await this.generateToken(userId);

    await this.storeHashedRefreshToken(userId, refresh_token);

    res.cookie('access_token', access_token, this.accessCookieOptions);
    res.cookie('refresh_token', refresh_token, this.refreshCookieOptions);

    return { access_token, refresh_token };
  }

  private async storeHashedRefreshToken(userId: number, token: string) {
    const hashedToken = await argon2.hash(token);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedToken },
    });
  }

  private async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRE_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('REFRESH_JWT_SECRET'),
        expiresIn: this.config.get('REFRESH_JWT_EXPIRE_IN'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  async validateGoogleUser(googleUser: createUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (user) return user;

    return await this.prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        password: googleUser.password,
      },
    });
  }

  async logGoogleUser(userId: number, res: Response) {
    return await this.issueTokensAndSetCookies(userId, res);
  }
}
