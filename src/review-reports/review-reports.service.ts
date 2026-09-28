import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReviewReport } from './entities/review-report.entity.js';
import { Review, ReviewStatus } from '../reviews/entities/review.entity.js';
import { Business } from '../businesses/entities/business.entity.js';
import { CreateReviewReportDto } from './dto/create-review-report.dto.js';
import { GetReviewReportsQueryDto } from './dto/get-review-reports-query.dto.js';
import { ReviewReportStatus } from './enums/review-report-status.enum.js';
import { ReviewReportResolution } from './enums/review-report-resolution.enum.js';

@Injectable()
export class ReviewReportsService {
  constructor(
    @InjectRepository(ReviewReport)
    private readonly reportRepository: Repository<ReviewReport>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
  ) {}

  async createReport(userId: string, reviewId: string, dto: CreateReviewReportDto) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Ulasan tidak ditemukan');
    }

    const existingReport = await this.reportRepository.findOne({
      where: { reviewId, reporterUserId: userId },
    });
    if (existingReport) {
      throw new ConflictException({
        success: false,
        message: 'Review ini sudah pernah Anda laporkan',
      });
    }

    const report = this.reportRepository.create({
      reviewId,
      businessId: review.businessId,
      reporterUserId: userId,
      reason: dto.reason,
      description: dto.description || null,
      status: ReviewReportStatus.PENDING,
    });

    await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Laporan berhasil dikirim',
    };
  }

  async getUserReportStatus(userId: string, reviewId: string) {
    const report = await this.reportRepository.findOne({
      where: { reviewId, reporterUserId: userId },
    });

    if (!report) {
      return {
        reported: false,
        status: null,
        resolution: null,
      };
    }

    return {
      reported: true,
      status: report.status,
      resolution: report.resolution,
    };
  }

  async getBusinessReportsSummary(businessId: string) {
    const total = await this.reportRepository.count({ where: { businessId } });
    const pending = await this.reportRepository.count({
      where: { businessId, status: ReviewReportStatus.PENDING },
    });
    const resolved = await this.reportRepository.count({
      where: { businessId, status: ReviewReportStatus.RESOLVED },
    });

    return {
      pending,
      resolved,
      total,
    };
  }

  async getBusinessReports(businessId: string, query: GetReviewReportsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.review', 'review')
      .leftJoinAndSelect('review.user', 'reviewAuthor')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reviewer', 'reviewer')
      .where('report.business_id = :businessId', { businessId });

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    if (query.reason) {
      qb.andWhere('report.reason = :reason', { reason: query.reason });
    }

    const sortOrder = query.sort === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy('report.created_at', sortOrder);
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    const formattedData = items.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      resolution: r.resolution,
      created_at: r.createdAt,
      reviewed_at: r.reviewedAt,
      reviewed_by: r.reviewedBy,
      reviewer_name: r.reviewer?.name || null,
      review: r.review
        ? {
            id: r.review.id,
            rating: r.review.rating,
            title: r.review.title,
            content: r.review.content,
            status: r.review.status,
            created_at: r.review.createdAt,
            author: r.review.user
              ? {
                  id: r.review.user.id,
                  name: r.review.user.name,
                  email: r.review.user.email,
                }
              : null,
          }
        : null,
      reporter: r.reporter
        ? {
            id: r.reporter.id,
            name: r.reporter.name,
            email: r.reporter.email,
          }
        : null,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  async getBusinessReportDetail(businessId: string, reportId: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, businessId },
      relations: {
        review: { user: true },
        reporter: true,
        reviewer: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    return {
      success: true,
      data: {
        id: report.id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        resolution: report.resolution,
        created_at: report.createdAt,
        reviewed_at: report.reviewedAt,
        reviewed_by: report.reviewedBy,
        reviewer_name: report.reviewer?.name || null,
        review: report.review
          ? {
              id: report.review.id,
              rating: report.review.rating,
              title: report.review.title,
              content: report.review.content,
              status: report.review.status,
              created_at: report.review.createdAt,
              author: report.review.user
                ? {
                    id: report.review.user.id,
                    name: report.review.user.name,
                    email: report.review.user.email,
                  }
                : null,
            }
          : null,
        reporter: report.reporter
          ? {
              id: report.reporter.id,
              name: report.reporter.name,
              email: report.reporter.email,
            }
          : null,
      },
    };
  }

  async keepReview(businessId: string, reportId: string, userId: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, businessId },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (report.status === ReviewReportStatus.RESOLVED) {
      throw new BadRequestException('Laporan ini sudah pernah diproses');
    }

    report.status = ReviewReportStatus.RESOLVED;
    report.resolution = ReviewReportResolution.KEEP;
    report.reviewedBy = userId;
    report.reviewedAt = new Date();

    await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Laporan diproses: Ulasan tetap ditayangkan (KEEP)',
      data: {
        report_id: report.id,
        status: report.status,
        resolution: report.resolution,
      },
    };
  }

  async hideReview(businessId: string, reportId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const report = await queryRunner.manager.findOne(ReviewReport, {
        where: { id: reportId, businessId },
      });

      if (!report) {
        throw new NotFoundException('Laporan tidak ditemukan');
      }

      if (report.status === ReviewReportStatus.RESOLVED && report.resolution === ReviewReportResolution.HIDE) {
        throw new BadRequestException('Laporan ini sudah pernah diproses HIDE');
      }

      const review = await queryRunner.manager.findOne(Review, {
        where: { id: report.reviewId },
      });

      if (!review) {
        throw new NotFoundException('Ulasan tidak ditemukan');
      }

      // 1. Update review status to HIDDEN
      review.status = ReviewStatus.HIDDEN;
      await queryRunner.manager.save(Review, review);

      // 2. Update target report to RESOLVED + HIDE
      report.status = ReviewReportStatus.RESOLVED;
      report.resolution = ReviewReportResolution.HIDE;
      report.reviewedBy = userId;
      report.reviewedAt = new Date();
      await queryRunner.manager.save(ReviewReport, report);

      // 3. Resolve all other PENDING reports for the same review automatically
      await queryRunner.manager.update(
        ReviewReport,
        { reviewId: report.reviewId, status: ReviewReportStatus.PENDING },
        {
          status: ReviewReportStatus.RESOLVED,
          resolution: ReviewReportResolution.HIDE,
          reviewedBy: userId,
          reviewedAt: new Date(),
        },
      );

      // 4. Recalculate business average rating & review count
      const publishedReviews = await queryRunner.manager.find(Review, {
        where: { businessId, status: ReviewStatus.PUBLISHED },
      });

      const newReviewCount = publishedReviews.length;
      let newAverageRating = 0;
      if (newReviewCount > 0) {
        const sum = publishedReviews.reduce((acc, r) => acc + r.rating, 0);
        newAverageRating = parseFloat((sum / newReviewCount).toFixed(2));
      }

      await queryRunner.manager.update(Business, { id: businessId }, {
        averageRating: newAverageRating,
        reviewCount: newReviewCount,
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Laporan diproses: Ulasan berhasil disembunyikan (HIDE) dan rating dihitung ulang',
        data: {
          report_id: report.id,
          review_id: review.id,
          review_status: review.status,
          status: report.status,
          resolution: report.resolution,
          new_average_rating: newAverageRating,
          new_review_count: newReviewCount,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // SUPER ADMIN READ ONLY METHODS
  async getAdminReports(query: GetReviewReportsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.review', 'review')
      .leftJoinAndSelect('report.business', 'business')
      .leftJoinAndSelect('review.user', 'reviewAuthor')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reviewer', 'reviewer');

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    if (query.reason) {
      qb.andWhere('report.reason = :reason', { reason: query.reason });
    }

    const sortOrder = query.sort === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy('report.created_at', sortOrder);
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    const formattedData = items.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      resolution: r.resolution,
      created_at: r.createdAt,
      reviewed_at: r.reviewedAt,
      reviewed_by: r.reviewedBy,
      reviewer_name: r.reviewer?.name || null,
      business: r.business
        ? {
            id: r.business.id,
            name: r.business.name,
            slug: r.business.slug,
          }
        : null,
      review: r.review
        ? {
            id: r.review.id,
            rating: r.review.rating,
            content: r.review.content,
            status: r.review.status,
            author: r.review.user
              ? {
                  id: r.review.user.id,
                  name: r.review.user.name,
                  email: r.review.user.email,
                }
              : null,
          }
        : null,
      reporter: r.reporter
        ? {
            id: r.reporter.id,
            name: r.reporter.name,
            email: r.reporter.email,
          }
        : null,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  async getAdminReportDetail(reportId: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: {
        review: { user: true },
        business: true,
        reporter: true,
        reviewer: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Laporan ulasan tidak ditemukan');
    }

    return {
      success: true,
      data: {
        id: report.id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        resolution: report.resolution,
        created_at: report.createdAt,
        reviewed_at: report.reviewedAt,
        reviewed_by: report.reviewedBy,
        reviewer_name: report.reviewer?.name || null,
        business: report.business
          ? {
              id: report.business.id,
              name: report.business.name,
              slug: report.business.slug,
            }
          : null,
        review: report.review
          ? {
              id: report.review.id,
              rating: report.review.rating,
              content: report.review.content,
              status: report.review.status,
              created_at: report.review.createdAt,
              author: report.review.user
                ? {
                    id: report.review.user.id,
                    name: report.review.user.name,
                    email: report.review.user.email,
                  }
                : null,
            }
          : null,
        reporter: report.reporter
          ? {
              id: report.reporter.id,
              name: report.reporter.name,
              email: report.reporter.email,
            }
          : null,
      },
    };
  }
}
