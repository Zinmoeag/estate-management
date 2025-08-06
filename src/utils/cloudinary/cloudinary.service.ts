import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import CloudinaryConfig from '../../config/cloudinary.config';

export interface CloudinaryUploadResult {
  data?: {
    bytes: number;
    created_at: string;
    format: string;
    public_id: string;
    resource_type: string;
    secure_url: string;
  };
  error?: string;
  success: boolean;
}

export class CloudinaryService {
  private static cloudinary = CloudinaryConfig.getCloudinary();

  /**
   * Delete a PDF file from Cloudinary
   * @param public_id - The public ID of the file to delete
   * @returns Promise<boolean>
   */
  static async deletePDF(public_id: string): Promise<boolean> {
    try {
      // Initialize Cloudinary config
      CloudinaryConfig.getInstance();

      const result = await this.cloudinary.uploader.destroy(public_id, {
        resource_type: 'raw',
      });

      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting PDF from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Generate a signed upload URL for direct uploads
   * @param folder - Optional folder path
   * @param public_id - Optional custom public ID
   * @returns Promise<string>
   */
  static async generateUploadURL(
    folder = 'pdfs',
    public_id?: string
  ): Promise<string> {
    try {
      // Initialize Cloudinary config
      CloudinaryConfig.getInstance();

      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        allowed_formats: 'pdf',
        folder,
        resource_type: 'raw',
        timestamp,
      };

      if (public_id) {
        params.public_id = public_id;
      }

      const signature = this.cloudinary.utils.api_sign_request(
        params,
        CloudinaryConfig.getCloudinary().config().api_secret!
      );

      return `https://api.cloudinary.com/v1_1/${
        CloudinaryConfig.getCloudinary().config().cloud_name
      }/raw/upload`;
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
  }

  /**
   * Get PDF file information from Cloudinary
   * @param public_id - The public ID of the file
   * @returns Promise<any>
   */
  static async getPDFInfo(public_id: string): Promise<any> {
    try {
      // Initialize Cloudinary config
      CloudinaryConfig.getInstance();

      const result = await this.cloudinary.api.resource(`pdfs/${public_id}`, {
        resource_type: 'raw',
      });

      return result;
    } catch (error) {
      console.error('Error getting PDF info from Cloudinary:', error);
      throw error;
    }
  }

  static async uploadJpg(
    file: Buffer | string,
    folder = 'images',
    public_id?: string
  ): Promise<CloudinaryUploadResult> {
    try {
      // Initialize Cloudinary config
      CloudinaryConfig.getInstance();

      const uploadOptions: any = {
        folder: folder,
        format: 'pdf',
        resource_type: 'raw',
        type: 'upload',
        unique_filename: false,
        use_filename: true,
      };

      if (public_id) {
        uploadOptions.public_id = public_id;
      }

      let uploadResult: UploadApiResponse;

      if (Buffer.isBuffer(file)) {
        // Upload buffer as base64
        const base64File = file.toString('base64');
        const dataURI = `data:image/jpeg;base64,${base64File}`;

        // uploadResult = await this.cloudinary.uploader.upload(
        //   dataURI,
        //   uploadOptions
        // );
        uploadResult = await this.cloudinary.image(dataURI, uploadOptions);
        console.log(uploadResult.url, 'uploadResult ==>');
      } else {
        // Upload as base64 string
        uploadResult = await this.cloudinary.uploader.upload(
          file,
          uploadOptions
        );
        console.log(uploadResult.url, 'uploadResult ==>');
      }

      return {
        data: uploadResult,
        success: true,
      };
    } catch (error) {
      console.error('Error uploading JPG to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Upload a PDF file to Cloudinary
   * @param file - The file buffer or base64 string
   * @param folder - Optional folder path in Cloudinary
   * @param public_id - Optional custom public ID
   * @returns Promise<CloudinaryUploadResult>
   */
  static async uploadPDF(
    file: Buffer | string,
    folder = 'pdfs',
    public_id?: string
  ): Promise<CloudinaryUploadResult> {
    try {
      // Initialize Cloudinary config
      CloudinaryConfig.getInstance();

      const uploadOptions: any = {
        folder: folder,
        format: 'pdf',
        resource_type: 'raw',
        type: 'upload',
        unique_filename: false,
        use_filename: true,
      };

      // Ensure public_id has .pdf extension if provided
      if (public_id) {
        uploadOptions.public_id = public_id;
      }

      console.log(uploadOptions, 'uploadOptions ==>');

      let uploadResult: UploadApiResponse;

      if (Buffer.isBuffer(file)) {
        // Upload buffer as base64
        const base64File = file.toString('base64');
        const dataURI = `data:application/pdf;base64,${base64File}`;

        uploadResult = await this.cloudinary.uploader.upload(
          dataURI,
          uploadOptions
        );

        console.log(uploadResult, 'uploadResult ==>');

        console.log(uploadResult.url, 'uploadResult ==>');
      } else {
        // Upload as base64 string
        uploadResult = await this.cloudinary.uploader.upload(
          file,
          uploadOptions
        );
      }

      return {
        data: {
          bytes: uploadResult.bytes,
          created_at: uploadResult.created_at,
          format: uploadResult.format,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          secure_url: uploadResult.secure_url,
        },
        success: true,
      };
    } catch (error) {
      const uploadError = error as UploadApiErrorResponse;
      return {
        error: uploadError.message || 'Failed to upload PDF to Cloudinary',
        success: false,
      };
    }
  }
}
