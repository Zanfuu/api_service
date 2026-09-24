import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Business } from '../../businesses/entities/business.entity.js';

export enum BusinessClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum VerificationMethod {
  DOCUMENT = 'DOCUMENT',
  WEBSITE = 'WEBSITE',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  OTHER = 'OTHER',
}

@Entity('business_claims')
export class BusinessClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'business_id' })
  businessId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: BusinessClaimStatus,
    default: BusinessClaimStatus.PENDING,
  })
  status: BusinessClaimStatus;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
    name: 'verification_method',
  })
  verificationMethod: VerificationMethod | string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'proof_url' })
  proofUrl: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'verification_data' })
  verificationData: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' })
  reviewedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
