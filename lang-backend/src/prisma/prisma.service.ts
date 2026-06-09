import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // Prisma 7 đọc DATABASE_URL từ process.env tự động
  // dotenv/config được load ở main.ts trước NestFactory.create()
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected ✓');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
