import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_key } from 'src/auth/decorators/public.decorator';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_key, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req: Request = context.switchToHttp().getRequest();
    const access_token = req.cookies?.access_token as string | undefined;
    if (!access_token) {
      throw new HttpException('Token is missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const user = await this.jwtService.verifyAsync<JwtPayload>(access_token, {
        secret: this.config.get('JWT_SECRET'),
      });

      req.user = { id: user.sub };
      return true;
    } catch {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
