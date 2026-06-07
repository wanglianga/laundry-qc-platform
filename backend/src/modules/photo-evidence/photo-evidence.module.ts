import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoEvidenceService } from './photo-evidence.service';
import { PhotoEvidence } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoEvidence])],
  providers: [PhotoEvidenceService],
  exports: [PhotoEvidenceService],
})
export class PhotoEvidenceModule {}
