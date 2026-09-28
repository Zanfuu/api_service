import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, PlatformRole, UserStatus } from '../users/entities/user.entity.js';
import { BusinessMember } from '../businesses/entities/business-member.entity.js';
import { AdminQueryDto } from './dto/admin-query.dto.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto.js';

@Injectable()
export class AdminManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BusinessMember)
    private readonly businessMemberRepository: Repository<BusinessMember>,
  ) {}

  async getAdmins(query: AdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user')
      .where('user.role != :superAdminRole', { superAdminRole: PlatformRole.SUPER_ADMIN });

    if (query.search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('user.created_at >= :startDate', { startDate: new Date(query.startDate) });
    }

    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('user.created_at <= :endDate', { endDate: end });
    }

    // Stats calculations for non-superadmin users
    const statsQb = this.userRepository.createQueryBuilder('user')
      .where('user.role != :superAdminRole', { superAdminRole: PlatformRole.SUPER_ADMIN });

    const totalAdminCount = await statsQb.getCount();
    const activeAdminCount = await statsQb.clone().andWhere('user.status = :activeStatus', { activeStatus: UserStatus.ACTIVE }).getCount();
    const suspendedAdminCount = await statsQb.clone().andWhere('user.status = :suspendedStatus', { suspendedStatus: UserStatus.SUSPENDED }).getCount();

    // Query paginated users
    qb.orderBy('user.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [users, totalFiltered] = await qb.getManyAndCount();

    // Fetch business_counts for fetched users
    const userIds = users.map((u) => u.id);
    let businessCountMap: Record<string, number> = {};

    if (userIds.length > 0) {
      const counts = await this.businessMemberRepository
        .createQueryBuilder('bm')
        .select('bm.user_id', 'userId')
        .addSelect('COUNT(bm.id)', 'count')
        .where('bm.user_id IN (:...userIds)', { userIds })
        .groupBy('bm.user_id')
        .getRawMany();

      counts.forEach((row) => {
        businessCountMap[row.userId] = parseInt(row.count, 10);
      });
    }

    const formattedData = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === PlatformRole.ADMIN ? 'Admin Bisnis' : 'Admin Bisnis',
      business_count: businessCountMap[user.id] || 0,
      status: user.status,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
    }));

    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return {
      data: formattedData,
      stats: {
        total_admin: totalAdminCount,
        active_admin: activeAdminCount,
        suspended_admin: suspendedAdminCount,
      },
      pagination: {
        page,
        limit,
        total: totalFiltered,
        total_pages: totalPages,
      },
    };
  }

  async createAdmin(dto: CreateAdminDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      name: dto.name,
      email,
      passwordHash,
      role: PlatformRole.ADMIN,
      status: dto.status || UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    await this.userRepository.save(user);

    return {
      message: 'Admin berhasil ditambahkan',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'Admin Bisnis',
        status: user.status,
        created_at: user.createdAt,
      },
    };
  }

  async updateAdminStatus(id: string, dto: UpdateAdminStatusDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    if (user.role === PlatformRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tidak dapat mengubah status Super Admin');
    }

    user.status = dto.status;
    await this.userRepository.save(user);

    return {
      message: `Status admin berhasil diperbarui menjadi ${dto.status}`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    };
  }

  async deleteAdmin(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    if (user.role === PlatformRole.SUPER_ADMIN) {
      throw new ForbiddenException('Tidak dapat menghapus Super Admin');
    }

    await this.userRepository.remove(user);

    return {
      message: 'Admin berhasil dihapus',
    };
  }

  async getCustomers(query: AdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user')
      .where('user.role = :customerRole', { customerRole: PlatformRole.USER });

    if (query.search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('user.created_at >= :startDate', { startDate: new Date(query.startDate) });
    }

    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('user.created_at <= :endDate', { endDate: end });
    }

    // Stats calculations for customers
    const statsQb = this.userRepository.createQueryBuilder('user')
      .where('user.role = :customerRole', { customerRole: PlatformRole.USER });

    const totalCustomerCount = await statsQb.getCount();
    const activeCustomerCount = await statsQb.clone().andWhere('user.status = :activeStatus', { activeStatus: UserStatus.ACTIVE }).getCount();
    const suspendedCustomerCount = await statsQb.clone().andWhere('user.status = :suspendedStatus', { suspendedStatus: UserStatus.SUSPENDED }).getCount();

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [users, totalFiltered] = await qb.getManyAndCount();

    const formattedData = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'Customer',
      status: user.status,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
    }));

    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return {
      data: formattedData,
      stats: {
        total_customer: totalCustomerCount,
        active_customer: activeCustomerCount,
        suspended_customer: suspendedCustomerCount,
      },
      pagination: {
        page,
        limit,
        total: totalFiltered,
        total_pages: totalPages,
      },
    };
  }
}
