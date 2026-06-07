import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ClothingModule } from './modules/clothing/clothing.module';
import { PhotoEvidenceModule } from './modules/photo-evidence/photo-evidence.module';
import { CompensationModule } from './modules/compensation/compensation.module';
import * as entities from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: join(process.cwd(), 'data', 'laundry.db'),
      entities: Object.values(entities),
      synchronize: true,
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ClothingModule,
    PhotoEvidenceModule,
    CompensationModule,
  ],
})
export class AppModule {}
