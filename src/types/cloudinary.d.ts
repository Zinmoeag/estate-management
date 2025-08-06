declare module 'cloudinary' {
  export interface UploadApiResponse {
    access_control: any[];
    access_mode: string;
    bytes: number;
    context: any;
    created_at: string;
    etag: string;
    format: string;
    height: number;
    metadata: any;
    moderation: string[];
    original_filename: string;
    placeholder: boolean;
    public_id: string;
    resource_type: string;
    secure_url: string;
    tags: string[];
    type: string;
    url: string;
    version: number;
    width: number;
  }

  export interface UploadApiErrorResponse {
    http_code: number;
    message: string;
    name: string;
  }

  export interface DeleteApiResponse {
    result: string;
  }

  export interface ResourceApiResponse {
    access_control: any[];
    access_mode: string;
    bytes: number;
    context: any;
    created_at: string;
    format: string;
    height: number;
    metadata: any;
    moderation: string[];
    original_filename: string;
    public_id: string;
    resource_type: string;
    secure_url: string;
    type: string;
    url: string;
    version: number;
    width: number;
  }

  export interface UploadOptions {
    [key: string]: any;
    allowed_formats?: string[];
    folder?: string;
    format?: string;
    public_id?: string;
    resource_type?: string;
    transformation?: any[];
  }

  export interface DeleteOptions {
    invalidate?: boolean;
    resource_type?: string;
    type?: string;
  }

  export interface ResourceOptions {
    context?: boolean;
    max_results?: number;
    moderations?: boolean;
    next_cursor?: string;
    prefix?: string;
    resource_type?: string;
    tags?: boolean;
    type?: string;
  }

  export interface v2 {
    api: {
      resource: (
        public_id: string,
        options?: ResourceOptions
      ) => Promise<ResourceApiResponse>;
    };

    config: (config: {
      api_key: string;
      api_secret: string;
      cloud_name: string;
    }) => void;

    uploader: {
      destroy: (
        public_id: string,
        options?: DeleteOptions
      ) => Promise<DeleteApiResponse>;

      upload: (
        file: Buffer | string,
        options?: UploadOptions
      ) => Promise<UploadApiResponse>;
    };

    utils: {
      api_sign_request: (
        params: Record<string, any>,
        api_secret: string
      ) => string;
    };
  }

  const cloudinary: v2;
  export { cloudinary };
  export default cloudinary;
}
