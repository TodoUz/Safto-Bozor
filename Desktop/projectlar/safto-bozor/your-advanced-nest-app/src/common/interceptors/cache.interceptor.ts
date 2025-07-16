import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    // Faqat GET so'rovlari uchun keshdan foydalanish
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cachedResponse = await this.cacheManager.get(url);
    if (cachedResponse) {
      console.log(`Keshdan olindi: ${url}`);
      return of(cachedResponse); // Keshdan javobni qaytarish
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Javobni keshga saqlash (masalan, 60 soniya)
        await this.cacheManager.set(url, response, 60000);
        console.log(`Keshga saqlandi: ${url}`);
      }),
    );
  }
}
