import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    let dbStatus = 'unhealthy';
    try {
      if (this.dataSource.isInitialized) {
        dbStatus = 'healthy';
      }
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    let dataForSeoStatus = 'not_configured';
    const dataForSeoApiKey = process.env.DATAFORSEO_API_KEY;

    if (dataForSeoApiKey) {
      try {
        const response = await fetch('https://api.dataforseo.com/v3/appendix/status', {
          headers: {
            Authorization: `Basic ${Buffer.from(dataForSeoApiKey).toString('base64')}`,
          },
        });
        if (response.ok) {
          dataForSeoStatus = 'healthy';
        } else {
          dataForSeoStatus = 'unhealthy_credentials';
        }
      } catch (e) {
        dataForSeoStatus = 'unhealthy_connection';
      }
    }

    const isHealthy = dbStatus === 'healthy' && (dataForSeoStatus === 'healthy' || dataForSeoStatus === 'not_configured');

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        apiService: 'healthy',
        database: {
          status: dbStatus,
          host: process.env.DATABASE_HOST || '43.133.133.58',
          name: process.env.DATABASE_NAME || 'katamereka_db',
        },
        dataForSeo: {
          status: dataForSeoStatus,
          endpoint: 'https://api.dataforseo.com/v3/serp/google/maps/live/advanced',
        },
      },
    };
  }
}
