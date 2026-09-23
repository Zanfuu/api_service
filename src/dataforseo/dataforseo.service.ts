import { Injectable, Logger, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NormalizedBusiness } from './interfaces/normalized-business.interface.js';

@Injectable()
export class DataForSeoService {
  private readonly logger = new Logger(DataForSeoService.name);
  private readonly baseUrl = 'https://api.dataforseo.com';

  constructor(private readonly configService: ConfigService) {}

  private getAuthHeader(): string {
    const login = this.configService.get<string>('DATAFORSEO_LOGIN');
    const password = this.configService.get<string>('DATAFORSEO_PASSWORD');

    if (!login || !password) {
      this.logger.error('DATAFORSEO_LOGIN atau DATAFORSEO_PASSWORD belum dikonfigurasi di environment!');
      throw new UnauthorizedException('Kredensial DataForSEO belum dikonfigurasi di server');
    }

    return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  }

  async createMapsTask(keyword: string, location: string): Promise<string> {
    const url = `${this.baseUrl}/v3/serp/google/maps/task_post`;
    const authHeader = this.getAuthHeader();

    const payload = [
      {
        keyword: keyword,
        location_name: location,
        language_code: 'id',
      },
    ];

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        throw new UnauthorizedException('Kredensial DataForSEO tidak valid / Gagal Autentikasi');
      }

      const result = await response.json();

      if (!response.ok || result.status_code !== 20000) {
        this.logger.error(`DataForSEO task_post error: ${JSON.stringify(result)}`);
        throw new BadRequestException(result.status_message || 'Gagal membuat task DataForSEO Google Maps');
      }

      const taskId = result?.tasks?.[0]?.id;
      if (!taskId) {
        throw new InternalServerErrorException('Task ID tidak ditemukan dari response DataForSEO');
      }

      return taskId;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error saat menghubungi DataForSEO API (task_post):', error);
      throw new InternalServerErrorException('Gagal terhubung ke DataForSEO API');
    }
  }

  async getMapsTaskResult(taskId: string, maxAttempts = 5, delayMs = 3000): Promise<NormalizedBusiness[]> {
    const url = `${this.baseUrl}/v3/serp/google/maps/task_get/advanced/${taskId}`;
    const authHeader = this.getAuthHeader();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: authHeader,
          },
        });

        if (response.status === 401) {
          throw new UnauthorizedException('Kredensial DataForSEO tidak valid');
        }

        const result = await response.json();
        const task = result?.tasks?.[0];

        if (task && task.status_code === 20000) {
          const items = task?.result?.[0]?.items || [];
          return this.normalizeBusinessResult(items);
        }

        // Jika task masih diproses, tunggu sebentar (polling delay)
        this.logger.log(`Task ${taskId} masih dalam proses (attempt ${attempt}/${maxAttempts}). Menunggu ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } catch (error) {
        if (attempt === maxAttempts) {
          this.logger.error(`Gagal mengambil hasil task ${taskId} setelah ${maxAttempts} percobaan`, error);
          throw new InternalServerErrorException('Gagal mengambil hasil pemrosesan DataForSEO task');
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new BadRequestException('Task DataForSEO belum selesai diproses oleh server DataForSEO');
  }

  normalizeBusinessResult(items: any[]): NormalizedBusiness[] {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    // Filter hanya item tipe local/maps business result
    const businessItems = items.filter(
      (item) => item.type === 'maps_search' || item.type === 'local_pack' || item.place_id || item.cid || item.title,
    );

    return businessItems.map((item) => {
      const title = item.title || 'Bisnis Tanpa Nama';
      const slug = this.slugify(title);

      return {
        googlePlaceId: item.place_id || null,
        googleCid: item.cid ? String(item.cid) : null,
        name: title,
        slug: slug,
        address: item.address || null,
        city: item.city || item.address_info?.city || null,
        province: item.state || item.province || item.address_info?.state || null,
        country: item.country_code || item.address_info?.country_code || 'ID',
        latitude: item.latitude || item.gps_coordinates?.latitude || null,
        longitude: item.longitude || item.gps_coordinates?.longitude || null,
        phone: item.phone || null,
        website: item.url || item.domain || null,
        category: item.category || item.main_category || null,
        googleRating: item.rating?.value ? parseFloat(item.rating.value) : null,
        googleReviewsCount: item.rating?.votes_count ? parseInt(item.rating.votes_count, 10) : null,
        externalSource: 'GOOGLE_MAPS_DATAFORSEO',
        externalSyncedAt: new Date(),
      };
    });
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
}
