import { NestFactory } from '@nestjs/core'
import { config as loadEnv } from 'dotenv'
import { AppModule } from './app.module'

loadEnv()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const corsOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  })
  await app.listen(Number(process.env.PORT) || 3000)
}
bootstrap()
