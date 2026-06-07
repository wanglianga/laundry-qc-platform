import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompensationService } from './compensation.service';
import { CompensationController } from './compensation.controller';
import { Compensation } from '../../entities';
import { ClothingModule } from '../clothing/clothing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compensation]),
    ClothingModule,
  ],
  controllers: [CompensationController],
  providers: [CompensationService],
  exports: [CompensationService],
})
export class CompensationModule {}
