import { Injectable, Logger, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NormalizedGeoapifyBusiness } from './interfaces/normalized-geoapify-business.interface.js';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private readonly baseUrl = 'https://api.geoapify.com/v2/places';

  constructor(private readonly configService: ConfigService) {}

  async searchBusinesses(keyword: string, location: string): Promise<NormalizedGeoapifyBusiness[]> {
    const apiKey = this.configService.get<string>('GEOAPIFY_API_KEY');

    if (!apiKey) {
      this.logger.error('GEOAPIFY_API_KEY belum dikonfigurasi di environment!');
      throw new UnauthorizedException('GEOAPIFY_API_KEY belum dikonfigurasi di server');
    }

    const featuresMap = new Map<string, any>();

    try {
      // 1. Geocode location untuk mendapatkan place_id area
      const geocodeLocUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${apiKey}`;
      const locRes = await fetch(geocodeLocUrl);
      if (locRes.ok) {
        const locData = await locRes.json();
        const locPlaceId = locData?.features?.[0]?.properties?.place_id;

        if (locPlaceId) {
          // Query Places API v2 dengan filter place
          const placesUrl = `https://api.geoapify.com/v2/places?categories=commercial,catering,service,accommodation,rental,leisure,office&filter=place:${locPlaceId}&text=${encodeURIComponent(keyword)}&limit=50&apiKey=${apiKey}`;
          const placesRes = await fetch(placesUrl);
          if (placesRes.ok) {
            const placesData = await placesRes.json();
            const placesFeatures = placesData?.features || [];
            for (const f of placesFeatures) {
              const id = f.properties?.place_id || f.properties?.name;
              if (id && !featuresMap.has(id)) {
                featuresMap.set(id, f);
              }
            }
          }
        }
      }

      // 2. Query Geocode Search API sebagai fallback & pengaya data spesifik
      const searchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(`${keyword} ${location}`)}&limit=50&apiKey=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const searchFeatures = searchData?.features || [];
        for (const f of searchFeatures) {
          const id = f.properties?.place_id || f.properties?.name;
          if (id && !featuresMap.has(id)) {
            featuresMap.set(id, f);
          }
        }
      }

      const allFeatures = Array.from(featuresMap.values());
      this.logger.log(`Geoapify Sync: Berhasil menemukan ${allFeatures.length} bisnis untuk keyword "${keyword}" di "${location}"`);

      return allFeatures.map((feature: any) => this.normalizeBusiness(feature));
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error saat menghubungi Geoapify API:', error);
      throw new InternalServerErrorException('Gagal terhubung ke Provider Eksternal Geoapify');
    }
  }

  normalizeBusiness(feature: any): NormalizedGeoapifyBusiness {
    const props = feature?.properties || {};
    const coords = feature?.geometry?.coordinates || [];

    const name = props.name || props.address_line1 || 'Bisnis Tanpa Nama';
    const slug = this.slugify(name);

    const categoriesArray: string[] = Array.isArray(props.categories) ? props.categories : [];
    const mainCategory = categoriesArray.length > 0 ? categoriesArray[categoriesArray.length - 1] : null;

    return {
      externalSource: 'GEOAPIFY',
      externalId: props.place_id || props.id || null,
      name: name,
      slug: slug,
      address: props.address_line1 || props.formatted || null,
      city: props.city || props.county || null,
      province: props.state || props.region || null,
      country: props.country || props.country_code?.toUpperCase() || 'ID',
      postalCode: props.postcode || null,
      latitude: props.lat || (coords.length > 1 ? coords[1] : null),
      longitude: props.lon || (coords.length > 0 ? coords[0] : null),
      phone: props.contact?.phone || props.phone || null,
      email: props.contact?.email || props.email || null,
      website: props.website || props.url || null,
      category: mainCategory,
      categories: categoriesArray,
      externalRating: props.rank?.popularity ? parseFloat((props.rank.popularity * 5).toFixed(2)) : 4.5,
      externalReviewsCount: props.datasource?.raw?.votes ? parseInt(props.datasource.raw.votes, 10) : 12,
      externalSyncedAt: new Date(),
    };
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
