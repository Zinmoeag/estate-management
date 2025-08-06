import { Request, Response, Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import {
  handleMulterError,
  PDFUploadRequest,
  uploadMultiplePDFs,
  uploadMultipleToCloudinary,
  uploadSinglePDF,
  uploadToCloudinary,
} from '../middlewares/pdf-upload.middleware';
import { CloudinaryService } from '../utils/cloudinary/cloudinary.service';

const router = Router();

const uploadJpg = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG files are allowed'));
    }
  },
});

router.post(
  '/upload-jpg',
  uploadJpg.single('file'),
  async (req: any, res: Response) => {
    const result = await CloudinaryService.uploadJpg(req.file.buffer);

    res.json({
      data: req.cloudinaryResult?.data,
      message: 'J uploaded successfully',
      success: true,
    });
  }
);

/**
 * Upload a single PDF file
 * POST /api/pdf/upload
 * Body: multipart/form-data with 'pdf' field
 * Optional: folder, public_id in body
 */
router.post(
  '/upload',
  uploadSinglePDF,
  handleMulterError,
  uploadToCloudinary,
  (req: PDFUploadRequest, res: Response) => {
    res.json({
      data: req.cloudinaryResult?.data,
      message: 'PDF uploaded successfully',
      success: true,
    });
  }
);

/**
 * Upload multiple PDF files
 * POST /api/pdf/upload-multiple
 * Body: multipart/form-data with 'pdfs' field (array)
 * Optional: folder in body
 */
router.post(
  '/upload-multiple',
  uploadMultiplePDFs,
  handleMulterError,
  uploadMultipleToCloudinary,
  (req: PDFUploadRequest, res: Response) => {
    res.json({
      data: req.cloudinaryResult?.data,
      message: 'PDFs uploaded successfully',
      success: true,
    });
  }
);

/**
 * Delete a PDF file from Cloudinary
 * DELETE /api/pdf/delete/:public_id
 */
router.delete('/delete/:public_id', async (req: Request, res: Response) => {
  try {
    const { public_id } = req.params;

    const result = await CloudinaryService.deletePDF(public_id);

    if (result) {
      res.json({
        message: 'PDF deleted successfully',
        success: true,
      });
    } else {
      res.status(400).json({
        message: 'Failed to delete PDF',
        success: false,
      });
    }
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Get PDF file information
 * GET /api/pdf/info/:public_id
 */
router.get('/info/:public_id', async (req: Request, res: Response) => {
  try {
    const { public_id } = req.params;

    const info = await CloudinaryService.getPDFInfo(public_id);

    res.json({
      data: info,
      success: true,
    });
  } catch (error) {
    console.log(error, 'error ==>');
    console.error('Error getting PDF info:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Generate upload URL for direct uploads
 * GET /api/pdf/upload-url
 * Query params: folder (optional), public_id (optional)
 */
router.get('/upload-url', async (req: Request, res: Response) => {
  try {
    const { folder, public_id } = req.query;

    const uploadUrl = await CloudinaryService.generateUploadURL(
      (folder as string) || 'pdfs',
      public_id as string
    );

    res.json({
      data: {
        upload_url: uploadUrl,
      },
      success: true,
    });
  } catch (error) {
    console.log(error, 'error ==>');
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Download a PDF file from Cloudinary
 * GET /api/pdf/download/:public_id
 */
router.get('/download/:public_id', async (req: Request, res: Response) => {
  try {
    const { public_id } = req.params;
    console.log(public_id, 'public_id ==>');

    // Get PDF info from Cloudinary
    const info = await CloudinaryService.getPDFInfo(public_id);

    if (!info?.secure_url) {
      return res.status(404).json({
        message: 'PDF not found',
        success: false,
      });
    }

    // Redirect to Cloudinary secure URL for download
    res.redirect(info.secure_url);
  } catch (error) {
    console.error('Error downloading PDF from Cloudinary:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Download a PDF file from Cloudinary with custom filename
 * GET /api/pdf/download/:public_id/:filename
 */
router.get(
  '/download/:public_id/:filename',
  async (req: Request, res: Response) => {
    try {
      const { filename, public_id } = req.params;

      // Get PDF info from Cloudinary
      const info = await CloudinaryService.getPDFInfo(public_id);

      if (!info?.secure_url) {
        return res.status(404).json({
          message: 'PDF not found',
          success: false,
        });
      }

      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      // Redirect to Cloudinary secure URL
      res.redirect(info.secure_url);
    } catch (error) {
      console.error('Error downloading PDF from Cloudinary:', error);
      res.status(500).json({
        message: 'Internal server error',
        success: false,
      });
    }
  }
);

// Local storage configuration for PDF uploads
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
    cb(null, `${originalName}-${uniqueSuffix}.pdf`);
  },
});

// Local upload multer configuration
const localUpload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  storage: localStorage,
});

/**
 * Upload a single PDF file to local storage
 * POST /api/pdf/local/upload
 * Body: multipart/form-data with 'pdf' field
 */
router.post(
  '/local/upload',
  localUpload.single('pdf'),
  // eslint-disable-next-line no-unused-vars
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No PDF file provided',
          success: false,
        });
      }

      const fileInfo = {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        url: `/api/pdf/local/serve/${req.file.filename}`, // API endpoint for serving
      };

      res.json({
        data: fileInfo,
        message: 'PDF uploaded successfully to local storage',
        success: true,
      });
    } catch (error) {
      console.error('Error in local upload:', error);
      res.status(500).json({
        message: 'Internal server error during local PDF upload',
        success: false,
      });
    }
  }
);

/**
 * Upload multiple PDF files to local storage
 * POST /api/pdf/local/upload-multiple
 * Body: multipart/form-data with 'pdfs' field (array)
 */
router.post(
  '/local/upload-multiple',
  localUpload.array('pdfs', 5), // Max 5 files
  (req: Request, res: Response) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: 'No PDF files provided',
          success: false,
        });
      }

      const filesInfo = (req.files as Express.Multer.File[]).map((file) => ({
        filename: file.filename,
        mimetype: file.mimetype,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        url: `/api/pdf/local/serve/${file.filename}`, // API endpoint for serving
      }));

      res.json({
        data: filesInfo,
        message: 'PDFs uploaded successfully to local storage',
        success: true,
      });
    } catch (error) {
      console.error('Error in local multiple upload:', error);
      res.status(500).json({
        message: 'Internal server error during local PDF upload',
        success: false,
      });
    }
  }
);

/**
 * Delete a PDF file from local storage
 * DELETE /api/pdf/local/delete/:filename
 */
router.delete('/local/delete/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'pdfs', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found',
        success: false,
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      message: 'PDF deleted successfully from local storage',
      success: true,
    });
  } catch (error) {
    console.error('Error deleting local PDF:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Get list of all PDF files in local storage
 * GET /api/pdf/local/list
 */
router.get('/local/list', (req: Request, res: Response) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');

    if (!fs.existsSync(uploadDir)) {
      return res.json({
        data: [],
        message: 'No files found',
        success: true,
      });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((file) => file.endsWith('.pdf'))
      .map((filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        return {
          created: stats.birthtime,
          filename,
          modified: stats.mtime,
          size: stats.size,
          url: `/api/pdf/local/serve/${filename}`,
        };
      });

    res.json({
      data: files,
      message: 'PDF files retrieved successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error listing local PDFs:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Download a PDF file from local storage
 * GET /api/pdf/local/download/:filename
 */
router.get('/local/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'pdfs', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found',
        success: false,
      });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading local PDF:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Serve PDF file directly (public access)
 * GET /api/pdf/local/serve/:filename
 */
router.get('/local/serve/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'pdfs', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found',
        success: false,
      });
    }

    // Set proper headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving local PDF:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
});

export default router;
