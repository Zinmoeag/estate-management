import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { CloudinaryService } from '../utils/cloudinary/cloudinary.service';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to only allow PDF files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Configure multer upload
const upload = multer({
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  storage: storage,
});

export interface PDFUploadRequest extends Request {
  cloudinaryResult?: {
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
  };
}

/**
 * Middleware to handle single PDF upload
 */
export const uploadSinglePDF = upload.single('pdf');

/**
 * Middleware to handle multiple PDF uploads
 */
export const uploadMultiplePDFs = upload.array('pdfs', 5); // Max 5 files

/**
 * Middleware to upload PDF to Cloudinary after multer processing
 */
export const uploadToCloudinary = async (
  req: PDFUploadRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No PDF file provided',
        success: false,
      });
    }

    const folder = req.body.folder ?? 'pdfs';
    let public_id = req.body.public_id;

    // If no public_id provided, use original filename with .pdf extension
    if (!public_id && req.file.originalname) {
      // const originalName = req.file.originalname.replace(/\.[^/.]+$/, ''); // Remove existing extension
      public_id = Math.random().toString(36).substring(2, 15);
    }

    const result = await CloudinaryService.uploadPDF(
      req.file.buffer,
      folder,
      public_id
    );

    req.cloudinaryResult = result;

    if (!result.success) {
      return res.status(400).json({
        message: result.error ?? 'Failed to upload PDF',
        success: false,
      });
    }

    next();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({
      message: 'Internal server error during PDF upload',
      success: false,
    });
  }
};

/**
 * Middleware to upload multiple PDFs to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  req: PDFUploadRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No PDF files provided',
        success: false,
      });
    }

    const folder = req.body.folder ?? 'pdfs';
    const results = [];

    for (const file of req.files as Express.Multer.File[]) {
      // Generate public_id with .pdf extension from original filename
      // const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove existing extension
      const public_id =
        req.body.public_id ?? Math.random().toString(36).substring(2, 15);

      const result = await CloudinaryService.uploadPDF(
        file.buffer,
        folder,
        public_id
      );
      results.push({
        originalName: file.originalname,
        ...result,
      });
    }

    req.cloudinaryResult = {
      data: results as any,
      success: true,
    };

    next();
  } catch (error) {
    console.error('Error uploading multiple PDFs to Cloudinary:', error);
    return res.status(500).json({
      message: 'Internal server error during PDF upload',
      success: false,
    });
  }
};

/**
 * Error handling middleware for multer errors
 */
export const handleMulterError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 10MB',
        success: false,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 5 files',
        success: false,
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field',
        success: false,
      });
    }
  }

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }

  next(error);
};
