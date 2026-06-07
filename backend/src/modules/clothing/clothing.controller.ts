import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ClothingService } from './clothing.service';
import { Clothing } from '../../entities/clothing.entity';
import { PhotoEvidenceService } from '../photo-evidence/photo-evidence.service';

@Controller('api/clothing')
export class ClothingController {
  constructor(
    private readonly clothingService: ClothingService,
    private readonly photoService: PhotoEvidenceService,
  ) {}

  @Post()
  create(@Body() data: Partial<Clothing>) {
    return this.clothingService.create(data);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.clothingService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clothingService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Clothing>) {
    return this.clothingService.update(id, data);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: any; operator?: string; operatorRole?: string }) {
    return this.clothingService.updateStatus(id, body.status, body.operator, body.operatorRole);
  }

  @Post(':id/factory-process')
  factoryProcess(@Param('id') id: string, @Body() data: any) {
    return this.clothingService.factoryProcess(id, data);
  }

  @Post(':id/store-receive')
  storeReceive(@Param('id') id: string, @Body() body: { operator?: string }) {
    return this.clothingService.storeReceive(id, body.operator);
  }

  @Post(':id/pickup')
  customerPickup(@Param('id') id: string, @Body() data: any) {
    return this.clothingService.customerPickup(id, data);
  }

  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { photoType: string; photoTypeName: string; description?: string; uploadedBy?: string },
  ) {
    try {
      const results = [];
      for (const file of files) {
        const photo = await this.photoService.create({
          clothingId: id,
          photoType: body.photoType as any,
          photoTypeName: body.photoTypeName,
          filePath: `/uploads/${file.filename}`,
          fileName: file.originalname,
          description: body.description,
          uploadedBy: body.uploadedBy,
        });
        results.push(photo);
      }
      return results;
    } catch (error) {
      throw new HttpException('上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clothingService.remove(id);
  }
}
