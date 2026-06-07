import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { CompensationService } from './compensation.service';

@Controller('api/compensations')
export class CompensationController {
  constructor(private readonly compensationService: CompensationService) {}

  @Post()
  create(@Body() data: any) {
    return this.compensationService.create(data);
  }

  @Get()
  findAll(@Body() query?: any) {
    return this.compensationService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compensationService.findOne(id);
  }

  @Get('clothing/:clothingId')
  findByClothingId(@Param('clothingId') clothingId: string) {
    return this.compensationService.findByClothingId(clothingId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.compensationService.update(id, data);
  }

  @Put(':id/handle')
  handle(@Param('id') id: string, @Body() data: any) {
    return this.compensationService.handle(id, data);
  }
}
