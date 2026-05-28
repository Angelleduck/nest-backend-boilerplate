import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const refresh_token = req.cookies?.refresh_token as string | undefined;
    if (!refresh_token) {
      throw new HttpException('Refresh is missing', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.jwtService.verifyAsync<JwtPayload>(
        refresh_token,
        {
          secret: this.config.get('REFRESH_JWT_SECRET'),
        },
      );

      req.user = { id: user.sub };

      return true;
    } catch {
      throw new HttpException('Invalid Refresh token', HttpStatus.BAD_REQUEST);
    }
  }
}
