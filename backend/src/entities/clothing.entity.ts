import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FlowNode } from './flow-node.entity';
import { PhotoEvidence } from './photo-evidence.entity';
import { Compensation } from './compensation.entity';

export type ClothingStatus = 'received' | 'in_factory' | 'washing' | 'drying' | 'ironing' | 'returning' | 'ready' | 'picked_up' | 'complaint' | 'completed';
export type ValueType = 'normal' | 'high';
export type InspectionStatus = 'pending' | 'store_done' | 'factory_done' | 'reviewing' | 'reviewed' | 'completed';
export type ReviewResult = 'pending' | 'confirmed' | 'rejected';

@Entity()
export class Clothing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNo: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  category: string;

  @Column()
  brand: string;

  @Column()
  color: string;

  @Column()
  material: string;

  @Column({ default: false })
  pocketChecked: boolean;

  @Column({ type: 'text', nullable: true })
  preExistingDefects: string;

  @Column({ type: 'text', nullable: true })
  customerRequirements: string;

  @Column({ default: 'received' })
  status: ClothingStatus;

  @Column({ default: 'normal' })
  valueType: ValueType;

  @Column({ default: 'pending' })
  inspectionStatus: InspectionStatus;

  @Column({ default: false })
  needsReview: boolean;

  @Column({ default: 'pending' })
  reviewResult: ReviewResult;

  @Column({ type: 'text', nullable: true })
  storeInspectionNote: string;

  @Column({ type: 'text', nullable: true })
  factoryInspectionNote: string;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'datetime', nullable: true })
  reviewCompletedAt: Date;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  storeName: string;

  @Column({ nullable: true })
  batchNo: string;

  @Column({ type: 'text', nullable: true })
  washingProcess: string;

  @Column({ type: 'text', nullable: true })
  stainRemovalAttempt: string;

  @Column({ nullable: true })
  dryingMethod: string;

  @Column({ type: 'text', nullable: true })
  ironingResult: string;

  @Column({ type: 'text', nullable: true })
  newDamage: string;

  @Column({ default: 0 })
  estimatedPrice: number;

  @Column({ type: 'datetime', nullable: true })
  expectedPickupDate: Date;

  @Column({ type: 'datetime', nullable: true })
  actualPickupDate: Date;

  @Column({ default: false })
  isOverdue: boolean;

  @Column({ default: false })
  isWrongItem: boolean;

  @Column({ type: 'text', nullable: true })
  customerEvaluation: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @OneToMany(() => FlowNode, node => node.clothing, { cascade: true })
  flowNodes: FlowNode[];

  @OneToMany(() => PhotoEvidence, photo => photo.clothing, { cascade: true })
  photos: PhotoEvidence[];

  @OneToMany(() => Compensation, comp => comp.clothing, { cascade: true })
  compensations: Compensation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
