import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clothing, ClothingStatus, InspectionStatus, ValueType } from '../../entities/clothing.entity';
import { FlowNode, NodeType } from '../../entities/flow-node.entity';

@Injectable()
export class ClothingService {
  constructor(
    @InjectRepository(Clothing)
    private clothingRepository: Repository<Clothing>,
    @InjectRepository(FlowNode)
    private flowNodeRepository: Repository<FlowNode>,
  ) {}

  async create(data: Partial<Clothing>): Promise<Clothing> {
    const orderNo = 'ORD' + Date.now().toString().slice(-8);
    const clothing = this.clothingRepository.create({
      ...data,
      orderNo,
      status: 'received',
    });
    const saved = await this.clothingRepository.save(clothing);
    await this.addFlowNode(saved.id, 'receive', '门店收衣', data.storeName || '门店', 'store', '收衣完成，已登记衣物信息');
    return this.findOne(saved.id);
  }

  async findAll(query?: any): Promise<Clothing[]> {
    const qb = this.clothingRepository.createQueryBuilder('c')
      .leftJoinAndSelect('c.flowNodes', 'fn')
      .leftJoinAndSelect('c.photos', 'p')
      .leftJoinAndSelect('c.compensations', 'cmp')
      .orderBy('c.createdAt', 'DESC');
    
    if (query?.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }
    if (query?.storeId) {
      qb.andWhere('c.storeId = :storeId', { storeId: query.storeId });
    }
    if (query?.keyword) {
      qb.andWhere('(c.orderNo LIKE :kw OR c.customerName LIKE :kw OR c.customerPhone LIKE :kw)', { kw: `%${query.keyword}%` });
    }
    
    return qb.getMany();
  }

  async findOne(id: string): Promise<Clothing> {
    const clothing = await this.clothingRepository.findOne({
      where: { id },
      relations: ['flowNodes', 'photos', 'compensations'],
    });
    if (!clothing) {
      throw new NotFoundException('衣物记录不存在');
    }
    return clothing;
  }

  async update(id: string, data: Partial<Clothing>): Promise<Clothing> {
    await this.clothingRepository.update(id, data);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ClothingStatus, operator?: string, operatorRole?: string): Promise<Clothing> {
    const clothing = await this.findOne(id);
    clothing.status = status;
    await this.clothingRepository.save(clothing);
    
    const nodeMap: Record<ClothingStatus, { type: NodeType; name: string }> = {
      received: { type: 'receive', name: '门店收衣' },
      in_factory: { type: 'factory_in', name: '工厂入库' },
      washing: { type: 'washing', name: '清洗中' },
      drying: { type: 'drying', name: '烘干中' },
      ironing: { type: 'ironing', name: '整烫中' },
      returning: { type: 'factory_out', name: '返店运输' },
      ready: { type: 'return_store', name: '门店签收' },
      picked_up: { type: 'pickup', name: '顾客取衣' },
      complaint: { type: 'complaint', name: '投诉处理' },
      completed: { type: 'pickup', name: '订单完成' },
    };
    
    const nodeInfo = nodeMap[status];
    if (nodeInfo) {
      await this.addFlowNode(id, nodeInfo.type, nodeInfo.name, operator, operatorRole, `状态更新为: ${status}`);
    }
    
    return this.findOne(id);
  }

  async addFlowNode(
    clothingId: string,
    nodeType: NodeType,
    nodeName: string,
    operator?: string,
    operatorRole?: string,
    remark?: string,
    isNormal: boolean = true,
    abnormalReason?: string,
  ): Promise<FlowNode> {
    const node = this.flowNodeRepository.create({
      clothingId,
      nodeType,
      nodeName,
      operator,
      operatorRole,
      remark,
      isNormal,
      abnormalReason,
    });
    return this.flowNodeRepository.save(node);
  }

  async factoryProcess(id: string, data: any): Promise<Clothing> {
    const clothing = await this.findOne(id);
    
    if (clothing.valueType === 'high') {
      const canWash = await this.canProceedToWash(id);
      if (!canWash) {
        throw new BadRequestException('高价值衣物需完成双重质检并通过复核后才能进入清洗');
      }
    }
    
    clothing.washingProcess = data.washingProcess;
    clothing.stainRemovalAttempt = data.stainRemovalAttempt;
    clothing.dryingMethod = data.dryingMethod;
    clothing.ironingResult = data.ironingResult;
    clothing.batchNo = data.batchNo;
    if (data.newDamage) {
      clothing.newDamage = data.newDamage;
    }
    clothing.status = 'returning';
    await this.clothingRepository.save(clothing);
    
    await this.addFlowNode(id, 'washing', '清洗完成', data.operator, 'factory', `工艺: ${data.washingProcess || '标准洗'}`);
    await this.addFlowNode(id, 'drying', '烘干完成', data.operator, 'factory', `方式: ${data.dryingMethod || '标准烘干'}`);
    await this.addFlowNode(id, 'ironing', '整烫完成', data.operator, 'factory', data.ironingResult || '整烫合格');
    await this.addFlowNode(id, 'factory_out', '工厂出库', data.operator, 'factory', `批次: ${data.batchNo || '默认批次'}`);
    
    return this.findOne(id);
  }

  async storeReceive(id: string, operator?: string): Promise<Clothing> {
    const clothing = await this.findOne(id);
    clothing.status = 'ready';
    await this.clothingRepository.save(clothing);
    await this.addFlowNode(id, 'return_store', '门店签收', operator, 'store', '衣物已返店，待顾客取衣');
    return this.findOne(id);
  }

  async customerPickup(id: string, data: any): Promise<Clothing> {
    const clothing = await this.findOne(id);
    clothing.status = 'completed';
    clothing.actualPickupDate = new Date();
    clothing.customerEvaluation = data.evaluation;
    clothing.rating = data.rating;
    await this.clothingRepository.save(clothing);
    await this.addFlowNode(id, 'pickup', '顾客取衣', data.customerName, 'customer', `评价: ${data.rating || 5}星, ${data.evaluation || '满意'}`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.clothingRepository.delete(id);
  }

  async storeInspection(id: string, data: { note?: string; hasDiscrepancy?: boolean; operator?: string }): Promise<Clothing> {
    const clothing = await this.findOne(id);
    
    if (clothing.valueType !== 'high') {
      throw new BadRequestException('仅高价值衣物需要双重质检');
    }
    
    clothing.storeInspectionNote = data.note || '';
    clothing.inspectionStatus = 'store_done';
    
    if (data.hasDiscrepancy) {
      clothing.needsReview = true;
      clothing.inspectionStatus = 'reviewing';
      await this.addFlowNode(id, 'inspection', '门店质检', data.operator, 'store', '门店质检发现瑕疵差异，进入复核', false, '瑕疵差异');
    } else {
      await this.addFlowNode(id, 'inspection', '门店质检', data.operator, 'store', '门店质检完成，无异常');
    }
    
    await this.clothingRepository.save(clothing);
    return this.findOne(id);
  }

  async factoryInspection(id: string, data: { note?: string; hasDiscrepancy?: boolean; operator?: string }): Promise<Clothing> {
    const clothing = await this.findOne(id);
    
    if (clothing.valueType !== 'high') {
      throw new BadRequestException('仅高价值衣物需要双重质检');
    }
    
    clothing.factoryInspectionNote = data.note || '';
    
    if (data.hasDiscrepancy) {
      clothing.needsReview = true;
      clothing.inspectionStatus = 'reviewing';
      await this.addFlowNode(id, 'inspection', '工厂质检', data.operator, 'factory', '工厂质检发现瑕疵差异，进入复核', false, '瑕疵差异');
    } else {
      if (clothing.inspectionStatus === 'store_done' && !clothing.needsReview) {
        clothing.inspectionStatus = 'completed';
        await this.addFlowNode(id, 'inspection', '工厂质检', data.operator, 'factory', '双重质检完成，可进入清洗');
      } else if (clothing.inspectionStatus === 'reviewing') {
        clothing.inspectionStatus = 'reviewing';
        await this.addFlowNode(id, 'inspection', '工厂质检', data.operator, 'factory', '工厂质检完成，等待复核');
      } else {
        clothing.inspectionStatus = 'factory_done';
        await this.addFlowNode(id, 'inspection', '工厂质检', data.operator, 'factory', '工厂质检完成，等待门店确认');
      }
    }
    
    await this.clothingRepository.save(clothing);
    return this.findOne(id);
  }

  async handleReview(id: string, data: { result: 'confirmed' | 'rejected'; note?: string; operator?: string }): Promise<Clothing> {
    const clothing = await this.findOne(id);
    
    if (!clothing.needsReview || clothing.inspectionStatus !== 'reviewing') {
      throw new BadRequestException('该衣物无需复核或已完成复核');
    }
    
    clothing.reviewResult = data.result;
    clothing.reviewNote = data.note || '';
    clothing.reviewedBy = data.operator || '';
    clothing.reviewCompletedAt = new Date();
    clothing.needsReview = false;
    
    if (data.result === 'confirmed') {
      clothing.inspectionStatus = 'completed';
      await this.addFlowNode(id, 'review', '复核完成', data.operator, 'admin', '复核通过，可进入清洗');
    } else {
      clothing.inspectionStatus = 'completed';
      await this.addFlowNode(id, 'review', '复核完成', data.operator, 'admin', `复核未通过: ${data.note || '原因未记录'}`, false, '复核未通过');
    }
    
    await this.clothingRepository.save(clothing);
    return this.findOne(id);
  }

  async canProceedToWash(id: string): Promise<boolean> {
    const clothing = await this.findOne(id);
    
    if (clothing.valueType !== 'high') {
      return true;
    }
    
    if (clothing.needsReview) {
      return false;
    }
    
    return clothing.inspectionStatus === 'completed';
  }
}
