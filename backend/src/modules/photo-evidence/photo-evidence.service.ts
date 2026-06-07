import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoEvidence } from '../../entities/photo-evidence.entity';

@Injectable()
export class PhotoEvidenceService {
  constructor(
    @InjectRepository(PhotoEvidence)
    private photoRepository: Repository<PhotoEvidence>,
  ) {}

  async create(data: Partial<PhotoEvidence>): Promise<PhotoEvidence> {
    const photo = this.photoRepository.create(data);
    return this.photoRepository.save(photo);
  }

  async findByClothingId(clothingId: string): Promise<PhotoEvidence[]> {
    return this.photoRepository.find({
      where: { clothingId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.photoRepository.delete(id);
  }
}
