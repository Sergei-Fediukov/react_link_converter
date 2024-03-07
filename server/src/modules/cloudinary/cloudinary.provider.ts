// import { ConfigOptions, v2 } from 'cloudinary';

// export const CloudinaryProvider = {
//   provide: 'Cloudinary',
//   useFactory: (): ConfigOptions => {
//     return v2.config({
//       cloud_name: process.env.CLD_CLOUD_NAME,
//       api_key: process.env.CLD_API_KEY,
//       api_secret: process.env.CLD_API_SECRET,
//     });
//   },
// };

import { ConfigOptions, v2 } from 'cloudinary'

import { ConfigService } from '@nestjs/config'

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ConfigOptions => {
    return v2.config({
      cloud_name: configService.get<string>('cloudinary.cloudName'),
      api_key: configService.get<string>('cloudinary.apiKey'),
      api_secret: configService.get<string>('cloudinary.apiSecret'),
    })
  },
}
