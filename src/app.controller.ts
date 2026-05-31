import { Controller, Get, HttpCode, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@ApiCookieAuth('access_token')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Say hello' })
  @ApiResponse({ status: 200, description: 'Greet' })
  getHello() {
    return this.appService.getHello();
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'returns list of users' })
  @Get('/users')
  getAll() {
    console.log('Inside controller');
    return this.appService.getData();
  }
}
