import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity.js';
import { Business } from '../../businesses/entities/business.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ReviewReportReason } from '../enums/review-report-reason.enum.js';
import { ReviewReportStatus } from '../enums/review-report-status.enum.js';
import { ReviewReportResolution } from '../enums/review-report-resolution.enum.js';

@Entity('review_reports')
@Unique(['reviewId', 'reporterUserId'])
@Index(['businessId', 'status', 'createdAt'])
@Index(['reviewId'])
@Index(['businessId'])
@Index(['reporterUserId'])
@Index(['status'])
@Index(['reason'])
@Index(['createdAt'])
export class ReviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'review_id' })
  reviewId: string;

  @Column({ type: 'uuid', name: 'business_id' })
  businessId: string;

  @Column({ type: 'uuid', name: 'reporter_user_id' })
  reporterUserId: string;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_user_id' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: ReviewReportReason,
  })
  reason: ReviewReportReason;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ReviewReportStatus,
    default: ReviewReportStatus.PENDING,
  })
  status: ReviewReportStatus;

  @Column({
    type: 'enum',
    enum: ReviewReportResolution,
    nullable: true,
  })
  resolution: ReviewReportResolution | null;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' })
  reviewedBy: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
