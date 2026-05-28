import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { Profile } from './google.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(profile);
    const user = await this.auth.validateGoogleUser({
      email: profile._json.email,
      name: profile._json.name,
      password: '',
    });

    return user;
  }
}
