import { v2 as cloudinary } from 'cloudinary';

import AppConfig from './env/app-config';

class CloudinaryConfig {
  private static _instance: CloudinaryConfig;

  private constructor() {
    cloudinary.config({
      api_key: AppConfig.getConfig('CLOUDINARY_API_KEY'),
      api_secret: AppConfig.getConfig('CLOUDINARY_API_SECRET'),
      cloud_name: AppConfig.getConfig('CLOUDINARY_CLOUD_NAME'),
    });
  }

  static getCloudinary() {
    return cloudinary;
  }

  static getInstance(): CloudinaryConfig {
    if (!this._instance) {
      this._instance = new CloudinaryConfig();
    }
    return this._instance;
  }
}

export default CloudinaryConfig;
