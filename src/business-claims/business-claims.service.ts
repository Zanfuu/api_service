import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BusinessClaim, BusinessClaimStatus } from './entities/business-claim.entity.js';
import { Business, BusinessStatus } from '../businesses/entities/business.entity.js';
import { BusinessMember, BusinessRole } from '../businesses/entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateBusinessClaimDto } from './dto/create-business-claim.dto.js';
import { ReviewBusinessClaimDto } from './dto/review-business-claim.dto.js';
import { BusinessClaimQueryDto } from './dto/business-claim-query.dto.js';

@Injectable()
export class BusinessClaimsService {
  private readonly logger = new Logger(BusinessClaimsService.name);

  constructor(
    @InjectRepository(BusinessClaim)
    private readonly claimRepository: Repository<BusinessClaim>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessMember)
    private readonly memberRepository: Repository<BusinessMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createClaim(userId: string, businessId: string, dto: CreateBusinessClaimDto) {
    // 1. Validate Business Exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException('Bisnis tidak ditemukan');
    }

    // 2. Check if business is already claimed / has an OWNER
    const existingOwner = await this.memberRepository.findOne({
      where: { businessId, role: BusinessRole.OWNER },
    });
    if (business.isClaimed || existingOwner) {
      throw new BadRequestException('This business has already been claimed.');
    }

    // 3. Check if user is already a member of this business
    const existingMember = await this.memberRepository.findOne({
      where: { businessId, userId },
    });
    if (existingMember) {
      throw new BadRequestException('Anda sudah menjadi anggota di bisnis ini');
    }

    // 4. Check if user already has a PENDING claim for this business
    const pendingClaim = await this.claimRepository.findOne({
      where: { businessId, userId, status: BusinessClaimStatus.PENDING },
    });
    if (pendingClaim) {
      throw new BadRequestException('Anda sudah memiliki klaim PENDING untuk bisnis ini');
    }

    // 5. Create Business Claim
    const claim = this.claimRepository.create({
      businessId,
      userId,
      verificationMethod: dto.verification_method || null,
      proofUrl: dto.proof_url || null,
      verificationData: dto.verification_data || null,
      message: dto.message || null,
      status: BusinessClaimStatus.PENDING,
    });

    await this.claimRepository.save(claim);

    return {
      success: true,
      message: 'Claim submitted successfully',
      data: {
        id: claim.id,
        business_id: claim.businessId,
        status: claim.status,
        created_at: claim.createdAt,
      },
    };
  }

  async getClaimStatus(userId: string, businessId: string) {
    const claim = await this.claimRepository.findOne({
      where: { businessId, userId },
      order: { createdAt: 'DESC' },
    });

    return {
      status: claim ? claim.status : null,
    };
  }

  async getMyClaims(userId: string) {
    const claims = await this.claimRepository.find({
      where: { userId },
      relations: { business: true },
      order: { createdAt: 'DESC' },
    });

    return claims.map((c) => ({
      id: c.id,
      business: c.business
        ? {
            id: c.business.id,
            name: c.business.name,
            slug: c.business.slug,
          }
        : null,
      status: c.status,
      verification_method: c.verificationMethod,
      proof_url: c.proofUrl,
      message: c.message,
      admin_notes: c.adminNotes,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));
  }

  async getClaimsForAdmin(query: BusinessClaimQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.business', 'business')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.reviewer', 'reviewer');

    if (query.status) {
      queryBuilder.andWhere('claim.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(business.name ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    queryBuilder.orderBy('claim.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((c) => ({
        id: c.id,
        business: {
          id: c.business?.id,
          name: c.business?.name,
          slug: c.business?.slug,
          is_claimed: c.business?.isClaimed,
        },
        user: {
          id: c.user?.id,
          name: c.user?.name,
          email: c.user?.email,
        },
        status: c.status,
        verification_method: c.verificationMethod,
        proof_url: c.proofUrl,
        message: c.message,
        admin_notes: c.adminNotes,
        reviewed_by: c.reviewer ? { id: c.reviewer.id, name: c.reviewer.name } : null,
        reviewed_at: c.reviewedAt,
        created_at: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  async getClaimDetail(claimId: string) {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: { business: true, user: true, reviewer: true },
    });

    if (!claim) {
      throw new NotFoundException('Klaim tidak ditemukan');
    }

    return {
      id: claim.id,
      business: claim.business
        ? {
            id: claim.business.id,
            name: claim.business.name,
            slug: claim.business.slug,
            address: claim.business.address,
            city: claim.business.city,
            is_claimed: claim.business.isClaimed,
          }
        : null,
      user: claim.user
        ? {
            id: claim.user.id,
            name: claim.user.name,
            email: claim.user.email,
          }
        : null,
      status: claim.status,
      verification_method: claim.verificationMethod,
      proof_url: claim.proofUrl,
      verification_data: claim.verificationData,
      message: claim.message,
      admin_notes: claim.adminNotes,
      reviewed_by: claim.reviewer ? { id: claim.reviewer.id, name: claim.reviewer.name } : null,
      reviewed_at: claim.reviewedAt,
      created_at: claim.createdAt,
      updated_at: claim.updatedAt,
    };
  }

  async approveClaim(adminId: string, claimId: string, dto: ReviewBusinessClaimDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock & Validate Claim still PENDING
      const claim = await queryRunner.manager.findOne(BusinessClaim, {
        where: { id: claimId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!claim) {
        throw new NotFoundException('Klaim bisnis tidak ditemukan');
      }

      if (claim.status !== BusinessClaimStatus.PENDING) {
        throw new BadRequestException('Klaim ini sudah diproses dan tidak berstatus PENDING lagi');
      }

      // 2. Race Condition Check: Ensure business does not already have an OWNER
      const existingOwner = await queryRunner.manager.findOne(BusinessMember, {
        where: { businessId: claim.businessId, role: BusinessRole.OWNER },
      });

      const targetBusiness = await queryRunner.manager.findOne(Business, {
        where: { id: claim.businessId },
      });

      if (existingOwner || targetBusiness?.isClaimed) {
        throw new BadRequestException('This business has already been claimed.');
      }

      // 3. Update Business Claim to APPROVED
      claim.status = BusinessClaimStatus.APPROVED;
      claim.reviewedBy = adminId;
      claim.reviewedAt = new Date();
      if (dto.admin_notes) {
        claim.adminNotes = dto.admin_notes;
      }
      await queryRunner.manager.save(claim);

      // 4. Create Business Member with OWNER role
      const member = queryRunner.manager.create(BusinessMember, {
        businessId: claim.businessId,
        userId: claim.userId,
        role: BusinessRole.OWNER,
      });
      await queryRunner.manager.save(member);

      // 5. Update Business Status to CLAIMED & isClaimed = true
      if (targetBusiness) {
        targetBusiness.isClaimed = true;
        targetBusiness.status = BusinessStatus.CLAIMED;
        await queryRunner.manager.save(targetBusiness);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Business claim approved.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to approve claim ${claimId}:`, err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectClaim(adminId: string, claimId: string, dto: ReviewBusinessClaimDto) {
    const claim = await this.claimRepository.findOne({ where: { id: claimId } });

    if (!claim) {
      throw new NotFoundException('Klaim bisnis tidak ditemukan');
    }

    if (claim.status !== BusinessClaimStatus.PENDING) {
      throw new BadRequestException('Klaim ini sudah diproses dan tidak berstatus PENDING lagi');
    }

    claim.status = BusinessClaimStatus.REJECTED;
    claim.reviewedBy = adminId;
    claim.reviewedAt = new Date();
    if (dto.admin_notes) {
      claim.adminNotes = dto.admin_notes;
    }

    await this.claimRepository.save(claim);

    return {
      success: true,
      message: 'Business claim rejected.',
    };
  }
}
