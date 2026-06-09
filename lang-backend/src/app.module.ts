import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule }       from './prisma/prisma.module';
import { AuthModule }         from './auth/auth.module';
import { MoodModule }         from './mood/mood.module';
import { JournalModule }      from './journal/journal.module';
import { AssessmentModule }   from './assessment/assessment.module';
import { KnowledgeModule }    from './knowledge/knowledge.module';
import { BooksModule }        from './books/books.module';
import { FacilitiesModule }   from './facilities/facilities.module';
import { CommunityModule }    from './community/community.module';
import { CrisisModule }       from './crisis/crisis.module';

import { JwtAuthGuard }            from './common/guards/jwt-auth.guard';
import { GlobalExceptionFilter }   from './common/filters/http-exception.filter';
import { AppController }           from './app.controller';
import { AppService }              from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Giới hạn tần suất: tối đa 60 request / phút / IP (chống spam community, crisis log...)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    MoodModule,
    JournalModule,
    AssessmentModule,
    KnowledgeModule,
    BooksModule,
    FacilitiesModule,
    CommunityModule,
    CrisisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD,  useClass: ThrottlerGuard },  // rate limit chạy trước
    { provide: APP_GUARD,  useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
