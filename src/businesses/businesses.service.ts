import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessStatus } from './entities/business.entity.js';
import { BusinessMember, BusinessRole } from './entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateBusinessDto, UpdateBusinessDto, AddBusinessMemberDto } from './dto/business.dto.js';

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
      message: 'Berhasil mengambil daftar bisnis',
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
      message: 'Berhasil mengambil detail bisnis',
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
    if (dto.status) business.status = dto.status;

    await this.businessRepository.save(business);

    return {
      message: 'Data bisnis berhasil diperbarui',
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
