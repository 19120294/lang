import { Module } from '@nestjs/common';
import { CrisisController } from './crisis.controller';
@Module({ controllers: [CrisisController] })
export class CrisisModule {}
