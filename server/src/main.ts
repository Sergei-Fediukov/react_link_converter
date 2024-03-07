import * as dotenv from 'dotenv'

import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { TimeoutMiddleware } from './middlewares'

async function bootstrap() {
  dotenv.config()
  const PORT = process.env.PORT || 3031
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  const config = new DocumentBuilder()
    .setTitle('Page to PDF converter backend')
    .setDescription('Rest API documentation')
    .setVersion('1.0.0')
    .addTag('created by Fediukov Sergei')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)

  app.useGlobalInterceptors(new TimeoutMiddleware())

  await app.listen(PORT, () => {
    console.log('\x1b[43m', '\x1b[30m', `Server started on port ${PORT}!`, '\x1b[0m')
  })
}
bootstrap()
