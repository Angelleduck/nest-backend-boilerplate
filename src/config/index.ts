import { ConfigModule } from '@nestjs/config';

export const configEnv = ConfigModule.forRoot({ isGlobal: true });
