import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

export enum BusinessStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLAIMED = 'CLAIMED',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

@Entity('businesses')
@Unique(['externalSource', 'externalId'])
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false, name: 'is_claimed' })
  isClaimed: boolean;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'external_source' })
  externalSource: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'external_id' })
  externalId: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  province: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'postal_code' })
  postalCode: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string | null;

  @Column({ type: 'simple-array', nullable: true })
  categories: string[] | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'external_rating' })
  externalRating: number | null;

  @Column({ type: 'int', nullable: true, name: 'external_reviews_count' })
  externalReviewsCount: number | null;

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.ACTIVE,
  })
  status: BusinessStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'external_synced_at' })
  externalSyncedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
