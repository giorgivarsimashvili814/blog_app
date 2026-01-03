import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [SessionModule],
  providers: [CleanupService],
})
export class CleanupModule {}
