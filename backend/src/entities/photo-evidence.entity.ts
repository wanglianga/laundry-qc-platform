import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Clothing } from './clothing.entity';

export type PhotoType = 'pre_defect' | 'washing_before' | 'washing_after' | 'damage' | 'pickup' | 'compensation';

@Entity()
export class PhotoEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photoType: PhotoType;

  @Column()
  photoTypeName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  uploadedBy: string;

  @ManyToOne(() => Clothing, clothing => clothing.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothingId' })
  clothing: Clothing;

  @Column()
  clothingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
