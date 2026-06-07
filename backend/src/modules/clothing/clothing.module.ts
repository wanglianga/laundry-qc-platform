import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothingService } from './clothing.service';
import { ClothingController } from './clothing.controller';
import { Clothing, FlowNode } from '../../entities';
import { PhotoEvidenceModule } from '../photo-evidence/photo-evidence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clothing, FlowNode]),
    PhotoEvidenceModule,
  ],
  controllers: [ClothingController],
  providers: [ClothingService],
  exports: [ClothingService],
})
export class ClothingModule {}
