import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { CrisisDetectorService } from '../common/crisis-detector.service';
@Module({ providers: [AssessmentService, CrisisDetectorService], controllers: [AssessmentController] })
export class AssessmentModule {}
