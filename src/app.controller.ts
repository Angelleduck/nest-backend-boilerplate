import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
    return this.appService.getData();
  }
}
