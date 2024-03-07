import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ConverterService } from 'src/modules/converter'

import { IResponse } from './converter.service'
import { ConvertPagePayload, UrlHealthCheckPayload } from './dto/request'

@ApiTags('Converter')
@Controller('/converter')
export class ConverterController {
  constructor(private readonly converterService: ConverterService) {}

  @Post('/health-check')
  @HttpCode(201)
  async healthCheck(@Body() { url, convertType }: UrlHealthCheckPayload): Promise<boolean> {
    return this.converterService.initialURLHealhCheck(url, convertType)
  }

  @Post()
  @HttpCode(201)
  async convertPage(@Body() convertOptions: ConvertPagePayload): Promise<IResponse> {
    return this.converterService.convert(convertOptions)
  }
}
