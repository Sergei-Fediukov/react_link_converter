import { UploadApiErrorResponse, UploadApiResponse, UploadResponseCallback, UploadStream, v2 } from 'cloudinary'
import { Readable } from 'stream'

import { Injectable } from '@nestjs/common'

type AudioUploadStreamPayload = {
  folder: string
  fileName: string
  resourceType: 'image' | 'video' | 'raw' | 'auto'
}

@Injectable()
export class CloudinaryService {
  uploadStream({ folder, fileName, resourceType }: AudioUploadStreamPayload, callBack?: UploadResponseCallback): UploadStream {
    return v2.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: resourceType,
      },
      callBack,
    )
  }

  async uploadFile(buffer: Buffer, folder: string, fileName: string, isRaw?: boolean): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const folderPath = `react_link_converter/${folder}`
    try {
      await v2.api.create_folder(folderPath)
    } catch (error) {
      console.error('Create folder Cloudinary error:', error)
      throw error
    }

    return new Promise((resolve, reject) => {
      const upload = this.uploadStream({ folder: folderPath, fileName, resourceType: isRaw ? 'raw' : 'image' }, (error, result) => {
        if (error) return reject(error)
        resolve(result)
      })

      const readableStream = new Readable()
      readableStream.push(buffer)
      readableStream.push(null)
      readableStream.pipe(upload)
    })
  }
}
