export interface NormalizedBusiness {
  googlePlaceId: string | null;
  googleCid: string | null;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  category: string | null;
  googleRating: number | null;
  googleReviewsCount: number | null;
  externalSource: string;
  externalSyncedAt: Date;
}
