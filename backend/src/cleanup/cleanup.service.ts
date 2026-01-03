/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class CleanupService {
  constructor(private readonly sessionService: SessionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.sessionService.deleteExpired();
  }
}
