import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import type { createUserDto } from './dtos/create-user.dto';
import argon2 from 'argon2';

@Injectable()
export class AppService {
  constructor(private databaseService: DatabaseService) {}
  getHello() {
    return { message: 'Hello World!' };
  }

  async getData() {
    const data = await this.databaseService.user.findMany();
    return { data };
  }

  async createData(data: createUserDto) {
    const exist = await this.databaseService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (exist) {
      throw new HttpException('User already exist', HttpStatus.CONFLICT);
    }

    const hashedPassowrd = await argon2.hash(data.password);
    const user = await this.databaseService.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassowrd,
      },
    });

    return { user };
  }
}
