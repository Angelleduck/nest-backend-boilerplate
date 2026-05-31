import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AppService {
  constructor(
    private databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async getHello() {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 2000);
    });
    return { message: 'Hello World!' };
  }

  async getData() {
    // const data = await this.databaseService.user.findMany();
    // return { data };

    console.log('inside service');
    const users = await this.getUsers();
    return { users };
  }

  private async getUsers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = [
          { name: 'Pierre' },
          { name: 'Jean' },
          { name: 'Bernard' },
        ];
        resolve(users);
      }, 2000);
    });
  }
}
