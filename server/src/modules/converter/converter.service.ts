import chromium from 'chrome-aws-lambda'
import { UploadApiResponse, UploadStream } from 'cloudinary'
import * as fs from 'fs'
import { HTMLBeautifyOptions, html_beautify } from 'js-beautify'
import { omit } from 'lodash'
import { join } from 'path'
import puppeteer, { Page, PuppeteerLifeCycleEvent, Browser, PDFOptions } from 'puppeteer'
import { PassThrough } from 'stream'
import { v4 as uuid } from 'uuid'
import ytdl from 'ytdl-core'

import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AttachmentService } from 'src/modules/attachment'
import { AudioTypes, ConvertTypes, ImageTypes } from 'src/modules/types/converter'

import { ErrorService } from './../common/error.service'
import { RequestService } from './../common/request.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import { FileService } from '../common/file.service'

interface IConvertOptions {
  url: string
  convertType: ConvertTypes | ImageTypes | AudioTypes
}

interface IInitiatePageLounch {
  page: Page
  browser: Browser
}

export interface IResponse {
  fileName: string | null
  previewImage: string | null
  resourceName: string | null
  resourceUrl: string | null
}

interface ICreateResponseInput {
  url: string
  fileName: string
  convertType: ConvertTypes | ImageTypes | AudioTypes
}

@Injectable()
export class ConverterService {
  constructor(
    private readonly configService: ConfigService,
    private readonly attachmentService: AttachmentService,
    private readonly fileService: FileService,
    private readonly requestService: RequestService,
    private readonly errorService: ErrorService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  private readonly logger = new Logger(ConverterService.name)

  private attachmentFolder = join(__dirname, '../../../', 'dist/static/files')
  private isRemoteUploadEnabled = this.configService.get('fileUpload.isRemoteUpload')

  private async initialPageLounch(url: string): Promise<any> {
    /**
     * networkidle2:
     * Waits until there is no network activity for a short period after the page is fully loaded.
     * Expects no more than two in-flight network connections in the last 500 milliseconds.
     * It represents a more "relaxed" state, allowing a brief period of network inactivity after the initial page load.
     *
     * networkidle0:
     * Waits until there are no more network connections for a continuous period.
     * It doesn't have the same restrictions on the number of in-flight connections or the duration of inactivity as networkidle2.
     * It waits until there is no more network activity for a continuous period, potentially leading to a longer waiting time compared to networkidle2.
     */
    const waitUntil: PuppeteerLifeCycleEvent[] = ['load', 'domcontentloaded', 'networkidle2']
    // console.log('\x1b[46m', '\x1b[30m', '------> ', puppeteer.executablePath(), '\x1b[0m');
    // Create a browser instance
    // const browser = await puppeteer.launch({
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //   headless: false,
    //   // executablePath: '/tmp/linkconverter-react_link_converter/server/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
    // })
    console.log('\x1b[46m', '\x1b[30m', '------> executablePath', puppeteer.executablePath(), '\x1b[0m')
    const browser = await chromium.puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: puppeteer.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    })

    // Create a new page
    const page = await browser.newPage()
    // Open URL in current page
    await page.setBypassCSP(true)
    await page.goto(url, { waitUntil, timeout: 30000 })
    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen')
    return { browser, page }
  }

  private async finalPageShutdown(browser: Browser): Promise<void> {
    // Close the browser instance
    await browser.close()
  }

  private getPath(attachmentFolder: string, fileName: string, type: ConvertTypes | ImageTypes | AudioTypes): string {
    return `${attachmentFolder}/${type}/${fileName}.${type.toLowerCase()}`
  }

  private async createImage(page: Page, fileName: string, isPreview: boolean): Promise<any> {
    const convertType = ImageTypes.JPG
    const uploadFileName = isPreview ? `${fileName}_preview` : fileName
    const imageBuffer = await page.screenshot({ omitBackground: true, fullPage: true })

    if (this.isRemoteUploadEnabled) {
      const data = await this.cloudinaryService.uploadFile(imageBuffer, convertType, uploadFileName, false)
      return { resourceUrl: data?.secure_url }
    } else {
      await this.fileService.folderExistenceCheck(`${this.attachmentFolder}/${convertType}`)
      await this.fileService.createFile(this.getPath(this.attachmentFolder, uploadFileName, convertType), imageBuffer)
      return { resourceUrl: `${this.configService.get('host')}/${convertType}/${uploadFileName}.${convertType.toLowerCase()}` }
    }
  }

  private async createPdfFile(page: Page, fileName: string): Promise<any> {
    const convertType = ConvertTypes.PDF
    const options: PDFOptions = {
      path: `${this.attachmentFolder}/${convertType}/${fileName}.${ConvertTypes.PDF.toLowerCase()}`,
      width: '100vw',
      height: '100vh',
      margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
      printBackground: true,
      format: 'Letter',
      landscape: false,
      scale: 1,
    }
    if (this.isRemoteUploadEnabled) {
      const buffer = await page.pdf(omit(options, 'path'))

      const data = await this.cloudinaryService.uploadFile(buffer, convertType, fileName, true)
      return { resourceUrl: data?.secure_url }
    } else {
      await this.fileService.folderExistenceCheck(`${this.attachmentFolder}/${convertType}`)
      await page.pdf(options)
      return { resourceUrl: `${this.configService.get('host')}/${convertType}/${fileName}.${ConvertTypes.PDF.toLowerCase()}` }
    }
  }

  private async createHTMLBasedFile(page: Page, fileName: string, convertType: ConvertTypes) {
    const htmlBeautifyOptions: HTMLBeautifyOptions = {
      indent_size: 2,
      wrap_line_length: 80,
      preserve_newlines: true,
      wrap_attributes: 'auto',
    }

    const bodyHTML = await page.evaluate(() => document.documentElement.outerHTML)
    if (this.isRemoteUploadEnabled) {
      const data = await this.cloudinaryService.uploadFile(Buffer.from(bodyHTML), convertType, fileName, true)
      return { resourceUrl: data?.secure_url }
    } else {
      await this.fileService.folderExistenceCheck(`${this.attachmentFolder} /${convertType}`)
      await this.fileService.createFile(
        this.getPath(this.attachmentFolder, fileName, convertType),
        html_beautify(bodyHTML, htmlBeautifyOptions),
      )
      return { resourceUrl: `${this.configService.get('host')}/${convertType}/${fileName}.${convertType.toLowerCase()}` }
    }
  }

  private async createAudioFile(convertType: AudioTypes, fileName: string, url: string) {
    const info = await ytdl.getInfo(url)
    if (!info) this.errorService.throwError({ errorCode: 404, errorMessage: 'URL is not correct or enpoint is not available' })

    const ytdlOptions: ytdl.downloadOptions = { filter: 'audioonly', quality: 'highestaudio' }

    const data = await new Promise<UploadApiResponse | null>(async (resolve, reject) => {
      if (this.isRemoteUploadEnabled) {
        const passThroughStream = new PassThrough()

        const uploadCallback = (error: any, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('File successfully uploaded')
            resolve(result)
          }
        }
        const upload: UploadStream = this.cloudinaryService.uploadStream(
          {
            folder: `react_link_converter/${AudioTypes.MP3}`,
            fileName,
            resourceType: 'video',
          },
          uploadCallback,
        )

        ytdl(url, ytdlOptions)
          .pipe(passThroughStream)
          .pipe(upload)
          .on('finish', () => {
            console.log('File upload was ended')
          })
          .on('error', (error) => {
            console.error('Read stream error', error)
            reject(error)
          })
      } else {
        await this.fileService.folderExistenceCheck(`${this.attachmentFolder}/${convertType}`)
        ytdl(url, ytdlOptions)
          .pipe(fs.createWriteStream(this.getPath(this.attachmentFolder, fileName, convertType)))
          .on('error', (e) => reject(e))
          .on('finish', () =>
            resolve({
              secure_url: `${this.configService.get('host')}/${convertType}/${fileName}.${convertType.toLowerCase()}`,
            } as UploadApiResponse),
          )
      }
    })
    console.log('\x1b[45m', '\x1b[30m', '------> data', data, '\x1b[0m')

    return { resourceName: info.videoDetails.title, resourceUrl: data?.secure_url }
  }

  private async createFile({ convertType, fileName, url }: ICreateResponseInput) {
    let response: IResponse = { fileName: null, previewImage: null, resourceName: new URL(url).hostname, resourceUrl: null }
    let initialPageLounchData: IInitiatePageLounch

    if (convertType !== ConvertTypes.AUDIO) {
      initialPageLounchData = await this.initialPageLounch(url)
    }

    if (!this.isRemoteUploadEnabled) {
      await this.fileService.folderExistenceCheck(this.attachmentFolder)
    }

    switch (convertType) {
      case ConvertTypes.PDF: {
        if (!initialPageLounchData?.page) this.errorService.throwError({ errorCode: HttpStatus.BAD_REQUEST })
        const { resourceUrl: previewImageResourceUrl } = await this.createImage(initialPageLounchData.page, fileName, true)
        const { resourceUrl } = await this.createPdfFile(initialPageLounchData.page, fileName)
        response = { ...response, previewImage: previewImageResourceUrl, resourceUrl }
        break
      }
      case ConvertTypes.IMAGE: {
        convertType = ImageTypes.JPG
        if (!initialPageLounchData?.page) this.errorService.throwError({ errorCode: HttpStatus.BAD_REQUEST })
        const { resourceUrl } = await this.createImage(initialPageLounchData?.page, fileName, false)
        response = { ...response, previewImage: resourceUrl, resourceUrl }
        break
      }
      case ConvertTypes.HTML:
      case ConvertTypes.TXT: {
        if (!initialPageLounchData?.page) this.errorService.throwError({ errorCode: HttpStatus.BAD_REQUEST })
        const { resourceUrl } = await this.createHTMLBasedFile(initialPageLounchData.page, fileName, convertType)
        response = { ...response, resourceUrl }
        break
      }
      case ConvertTypes.AUDIO: {
        convertType = AudioTypes.MP3
        const { resourceName, resourceUrl } = await this.createAudioFile(convertType, fileName, url)
        response = { ...response, resourceName, resourceUrl }
        break
      }
    }

    response.fileName = this.isRemoteUploadEnabled ? null : fileName

    if (!this.isRemoteUploadEnabled) {
      await this.finalPageShutdown(initialPageLounchData?.browser)
    }
    return { fileConvertType: convertType, response }
  }

  async initialURLHealhCheck(url: string, convertType?: ConvertTypes | ImageTypes | AudioTypes) {
    let endpointAvailability: boolean

    if (convertType === ConvertTypes.AUDIO) {
      const lowerCasedURL = url.toLocaleLowerCase()
      endpointAvailability = lowerCasedURL.includes('youtube.com') || lowerCasedURL.includes('youtu.be')
    } else {
      endpointAvailability = await this.requestService.checkEndpointAvailability(url)
    }

    this.logger.log(`[HEALTH CHECK for type ${convertType}] URL: ${url}, AVAILABILITY: ${endpointAvailability}`)
    return endpointAvailability
  }

  async convert({ url, convertType }: IConvertOptions): Promise<IResponse> {
    // Endpoint availability check
    const endpointAvailability = await this.initialURLHealhCheck(url, convertType)

    if (!endpointAvailability) {
      this.errorService.throwError({ errorCode: 404, errorMessage: 'URL is not correct or enpoint is not available' })
    }

    const fileName = uuid()

    // Create or remote upload file
    const { fileConvertType, response } = await this.createFile({ convertType, fileName, url })

    // Create db record
    await this.attachmentService.createAttachment(fileName, fileConvertType)
    console.log('\x1b[45m', '\x1b[30m', '------>response ', response, '\x1b[0m')
    return response
  }
}
