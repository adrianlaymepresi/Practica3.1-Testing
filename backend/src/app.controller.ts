import { Controller, Get } from '@nestjs/common';
import { Publico } from './common/decorators/publico.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Publico()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
