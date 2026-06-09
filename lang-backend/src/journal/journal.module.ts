import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { EncryptionService } from '../common/encryption.service';
@Module({ providers: [JournalService, EncryptionService], controllers: [JournalController] })
export class JournalModule {}
