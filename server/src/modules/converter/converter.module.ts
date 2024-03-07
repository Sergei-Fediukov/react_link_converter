import { Module } from '@nestjs/common'

import { ConverterService } from 'src/modules/converter'

import { ConverterController } from './converter.controller'
import { CloudinaryModule } from '../cloudinary/cloudinary.module'

@Module({
  imports: [CloudinaryModule],
  controllers: [ConverterController],
  providers: [ConverterService],
  exports: [ConverterService],
})
export class ConverterModule {}
