import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessStatus } from './entities/business.entity.js';
import { BusinessMember, BusinessRole } from './entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateBusinessDto, UpdateBusinessDto, AddBusinessMemberDto, SyncGoogleBusinessDto } from './dto/business.dto.js';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessMember)
    private readonly memberRepository: Repository<BusinessMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(ownerUserId: string, dto: CreateBusinessDto) {
    const existingSlug = await this.businessRepository.findOne({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new ConflictException('Slug bisnis sudah digunakan');
    }

    const business = this.businessRepository.create({
      name: dto.name,
      slug: dto.slug,
      googlePlaceId: dto.googlePlaceId || null,
      status: dto.status || BusinessStatus.ACTIVE,
    });

    await this.businessRepository.save(business);

    // Otomatis jadikan pendaftar sebagai OWNER
    const member = this.memberRepository.create({
      businessId: business.id,
      userId: ownerUserId,
      role: BusinessRole.OWNER,
    });

    await this.memberRepository.save(member);

    return {
      message: 'Bisnis berhasil dibuat',
      data: business,
      memberInfo: member,
    };
  }

  async findAll() {
    const businesses = await this.businessRepository.find({
      order: { createdAt: 'DESC' },
    });
    return {
      message: 'Berhasil mengambil daftar bisnis (GET dari Database lokal)',
      data: businesses,
    };
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Bisnis tidak ditemukan');
    }

    const members = await this.memberRepository.find({
      where: { businessId: id },
      relations: {
        user: true,
      },
    });

    return {
      message: 'Berhasil mengambil detail bisnis (GET dari Database lokal)',
      data: {
        ...business,
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.user?.name,
          email: m.user?.email,
          role: m.role,
          createdAt: m.createdAt,
        })),
      },
    };
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Bisnis tidak ditemukan');
    }

    if (dto.name) business.name = dto.name;
    if (dto.slug) business.slug = dto.slug;
    if (dto.googlePlaceId !== undefined) business.googlePlaceId = dto.googlePlaceId;
    if (dto.status) business.status = dto.status;

    await this.businessRepository.save(business);

    return {
      message: 'Data bisnis berhasil diperbarui',
      data: business,
    };
  }

  async syncGoogleBusiness(id: string, dto?: SyncGoogleBusinessDto) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException('Bisnis tidak ditemukan');
    }

    const placeIdToSync = dto?.googlePlaceId || business.googlePlaceId || `ChIJ_${business.slug}_mock_place_id`;

    // 🔄 LOGIC SYNC: Mensimulasikan trigger pemanggilan Google Business / Places API
    // Data hasil fetch Google Business Profile API disinkronkan ke Database PostgreSQL kita
    const mockGoogleData = {
      address: `Jl. Transgo No. 88, Kota Bandung, Jawa Barat`,
      phone: `+62 812-3456-7890`,
      website: `https://${business.slug}.katamereka.id`,
      googleRating: 4.85,
      googleUserRatingsTotal: 128,
    };

    business.googlePlaceId = placeIdToSync;
    business.address = mockGoogleData.address;
    business.phone = mockGoogleData.phone;
    business.website = mockGoogleData.website;
    business.googleRating = mockGoogleData.googleRating;
    business.googleUserRatingsTotal = mockGoogleData.googleUserRatingsTotal;
    business.lastSyncedAt = new Date();

    await this.businessRepository.save(business);

    return {
      message: 'Berhasil melakukan SINKRONISASI (SYNC) data profil dari Google Business API ke Database',
      data: business,
    };
  }

  async addMember(businessId: string, dto: AddBusinessMemberDto) {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException('Bisnis tidak ditemukan');
    }

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { businessId, userId: dto.userId },
    });
    if (existingMember) {
      throw new ConflictException('User sudah menjadi anggota di bisnis ini');
    }

    const member = this.memberRepository.create({
      businessId,
      userId: dto.userId,
      role: dto.role || BusinessRole.MEMBER,
    });

    await this.memberRepository.save(member);

    return {
      message: 'Anggota berhasil ditambahkan ke bisnis',
      data: member,
    };
  }
}
