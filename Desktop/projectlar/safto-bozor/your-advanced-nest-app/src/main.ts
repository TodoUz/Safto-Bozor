import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // Xatolarni boshqarish filtri
import { config } from 'dotenv';

// .env faylini yuklash
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validatsiya Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOda aniqlanmagan xususiyatlarni olib tashlash
      forbidNonWhitelisted: true, // DTOda aniqlanmagan xususiyatlar bo'lsa xato berish
      transform: true, // Kiruvchi ma'lumotlarni DTO sinflariga avtomatik o'zgartirish
    }),
  );

  // Global Xatolarni Boshqarish Filtrlari
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS ni yoqish (agar frontend boshqa domenda bo'lsa)
  app.enableCors({
    origin: '*', // Barcha domenlardan so'rovlarni qabul qilish. Ishlab chiqarishda aniq domenlarni belgilash tavsiya etiladi.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
