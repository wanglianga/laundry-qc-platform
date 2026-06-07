import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Clothing } from './clothing.entity';

export type NodeType = 'receive' | 'factory_in' | 'washing' | 'drying' | 'ironing' | 'factory_out' | 'return_store' | 'pickup' | 'complaint' | 'compensation' | 'inspection' | 'review';

@Entity()
export class FlowNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nodeType: NodeType;

  @Column()
  nodeName: string;

  @Column({ nullable: true })
  operator: string;

  @Column({ nullable: true })
  operatorRole: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ default: true })
  isNormal: boolean;

  @Column({ type: 'text', nullable: true })
  abnormalReason: string;

  @ManyToOne(() => Clothing, clothing => clothing.flowNodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothingId' })
  clothing: Clothing;

  @Column()
  clothingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
