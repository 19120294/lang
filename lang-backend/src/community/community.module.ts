import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CrisisDetectorService } from '../common/crisis-detector.service';
@Module({ providers: [CommunityService, CrisisDetectorService], controllers: [CommunityController] })
export class CommunityModule {}
