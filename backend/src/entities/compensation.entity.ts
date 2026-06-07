import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Clothing } from './clothing.entity';

export type CompensationBasis = 'pre_existing_defect' | 'new_damage' | 'overdue' | 'wrong_item' | 'color_fading' | 'shrinkage' | 'breakage';
export type CompensationStatus = 'pending' | 'processing' | 'accepted' | 'rejected' | 'completed';
export type CompensationType = 'refund' | 're_wash' | 'discount' | 'cash';

@Entity()
export class Compensation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  basis: CompensationBasis;

  @Column()
  basisName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  complaintType: string;

  @Column({ default: 'pending' })
  status: CompensationStatus;

  @Column({ nullable: true })
  compensationType: CompensationType;

  @Column({ default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ type: 'text', nullable: true })
  customerFeedback: string;

  @Column({ nullable: true })
  handledBy: string;

  @Column({ type: 'datetime', nullable: true })
  handledAt: Date;

  @ManyToOne(() => Clothing, clothing => clothing.compensations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothingId' })
  clothing: Clothing;

  @Column()
  clothingId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
