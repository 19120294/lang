import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Health check công khai — cho Render/monitoring + đánh thức server free */
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'lang-api', time: new Date().toISOString() };
  }
}
