import { Module } from '@nestjs/common';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';
import { EncryptionService } from '../common/encryption.service';

@Module({ providers: [MoodService, EncryptionService], controllers: [MoodController] })
export class MoodModule {}
