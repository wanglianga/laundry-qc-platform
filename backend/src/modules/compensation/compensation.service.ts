import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compensation, CompensationBasis, CompensationStatus } from '../../entities/compensation.entity';
import { ClothingService } from '../clothing/clothing.service';

const basisMap: Record<CompensationBasis, string> = {
  pre_existing_defect: '预存瑕疵',
  new_damage: '洗后新增损伤',
  overdue: '顾客逾期取衣',
  wrong_item: '错件',
  color_fading: '掉色',
  shrinkage: '缩水',
  breakage: '破损',
};

@Injectable()
export class CompensationService {
  constructor(
    @InjectRepository(Compensation)
    private compensationRepository: Repository<Compensation>,
    private clothingService: ClothingService,
  ) {}

  async create(data: any): Promise<Compensation> {
    const comp = this.compensationRepository.create({
      ...data,
      basisName: basisMap[data.basis] || data.basis,
      status: 'pending',
    });
    const saved = await this.compensationRepository.save(comp) as any as Compensation;
    
    await this.clothingService.updateStatus(
      data.clothingId,
      'complaint',
      data.handledBy,
      'service',
    );
    
    await this.clothingService.addFlowNode(
      data.clothingId,
      'complaint',
      '发起投诉',
      data.handledBy,
      'service',
      `投诉类型: ${data.complaintType || basisMap[data.basis]}, 描述: ${data.description || ''}`,
      false,
      data.description,
    );
    
    return saved;
  }

  async findAll(query?: any): Promise<Compensation[]> {
    const qb = this.compensationRepository.createQueryBuilder('c')
      .leftJoinAndSelect('c.clothing', 'clothing')
      .orderBy('c.createdAt', 'DESC');
    
    if (query?.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }
    
    return qb.getMany();
  }

  async findOne(id: string): Promise<Compensation> {
    const comp = await this.compensationRepository.findOne({
      where: { id },
      relations: ['clothing'],
    });
    if (!comp) {
      throw new NotFoundException('赔付记录不存在');
    }
    return comp;
  }

  async findByClothingId(clothingId: string): Promise<Compensation[]> {
    return this.compensationRepository.find({
      where: { clothingId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Compensation>): Promise<Compensation> {
    await this.compensationRepository.update(id, data);
    return this.findOne(id);
  }

  async handle(id: string, data: any): Promise<Compensation> {
    const comp = await this.findOne(id);
    comp.status = data.status;
    comp.compensationType = data.compensationType;
    comp.amount = data.amount;
    comp.plan = data.plan;
    comp.customerFeedback = data.customerFeedback;
    comp.handledBy = data.handledBy;
    comp.handledAt = new Date();
    
    const saved = await this.compensationRepository.save(comp);
    
    if (data.status === 'completed' || data.status === 'accepted') {
      await this.clothingService.updateStatus(
        comp.clothingId,
        'completed',
        data.handledBy,
        'service',
      );
    }
    
    await this.clothingService.addFlowNode(
      comp.clothingId,
      'compensation',
      '赔付处理',
      data.handledBy,
      'service',
      `方案: ${data.plan || ''}, 金额: ${data.amount || 0}元, 客户反馈: ${data.customerFeedback || ''}`,
    );
    
    return saved;
  }
}
