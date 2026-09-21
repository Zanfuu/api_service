import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, UserStatus } from './entities/user.entity.js';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'DESC' },
    });
    return {
      message: 'Berhasil mengambil daftar user/customer',
      data: users,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return {
      message: 'Berhasil mengambil detail user',
      data: user,
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      status: dto.status || UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    return {
      message: 'User berhasil ditambahkan',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.status) user.status = dto.status;

    await this.userRepository.save(user);

    return {
      message: 'Data user berhasil diperbarui',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.userRepository.remove(user);
    return {
      message: 'User berhasil dihapus',
    };
  }
}
