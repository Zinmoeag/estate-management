# Cloudinary PDF Upload Setup

This document provides instructions for setting up and using Cloudinary for PDF uploads in your Node.js application.

## Prerequisites

1. A Cloudinary account (sign up at [cloudinary.com](https://cloudinary.com))
2. Your Cloudinary credentials (Cloud Name, API Key, API Secret)

## Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

The Cloudinary package has been installed. If you need to reinstall:

```bash
npm install cloudinary
```

## Setup Files Created

1. **`src/config/cloudinary.config.ts`** - Cloudinary configuration singleton
2. **`src/utils/cloudinary/cloudinary.service.ts`** - Main Cloudinary service with PDF upload methods
3. **`src/middlewares/pdf-upload.middleware.ts`** - Express middleware for PDF uploads
4. **`src/routes/pdf-upload.routes.ts`** - Sample routes demonstrating usage

## Usage Examples

### 1. Basic PDF Upload

```typescript
import { CloudinaryService } from './src/utils/cloudinary/cloudinary.service';

// Upload a PDF file
const result = await CloudinaryService.uploadPDF(
  fileBuffer, // Buffer or base64 string
  'pdfs',     // folder (optional)
  'custom-id' // public_id (optional)
);

if (result.success) {
  console.log('Upload successful:', result.data);
  // result.data contains: public_id, secure_url, format, etc.
} else {
  console.error('Upload failed:', result.error);
}
```

### 2. Using Express Routes

Add the PDF routes to your main app:

```typescript
import pdfUploadRoutes from './src/routes/pdf-upload.routes';

app.use('/api/pdf', pdfUploadRoutes);
```

### 3. Single PDF Upload via API

```bash
curl -X POST http://localhost:3000/api/pdf/upload \
  -F "pdf=@document.pdf" \
  -F "folder=documents" \
  -F "public_id=my-document"
```

### 4. Multiple PDF Upload via API

```bash
curl -X POST http://localhost:3000/api/pdf/upload-multiple \
  -F "pdfs=@document1.pdf" \
  -F "pdfs=@document2.pdf" \
  -F "folder=documents"
```

### 5. Delete PDF

```bash
curl -X DELETE http://localhost:3000/api/pdf/delete/public_id_here
```

### 6. Get PDF Info

```bash
curl -X GET http://localhost:3000/api/pdf/info/public_id_here
```

### 7. Generate Upload URL

```bash
curl -X GET "http://localhost:3000/api/pdf/upload-url?folder=documents&public_id=custom-id"
```

## Using Middleware in Custom Routes

```typescript
import { 
  uploadSinglePDF, 
  uploadToCloudinary, 
  handleMulterError,
  PDFUploadRequest 
} from '../middlewares/pdf-upload.middleware';

router.post('/upload-document',
  uploadSinglePDF,
  handleMulterError,
  uploadToCloudinary,
  (req: PDFUploadRequest, res: Response) => {
    // Access the upload result
    const uploadResult = req.cloudinaryResult;
    
    if (uploadResult?.success) {
      // Save to database or process further
      res.json({
        success: true,
        data: uploadResult.data
      });
    }
  }
);
```

## Features

### ✅ Supported Operations

- **Single PDF Upload**: Upload one PDF file at a time
- **Multiple PDF Upload**: Upload up to 5 PDF files simultaneously
- **File Validation**: Only PDF files are accepted
- **File Size Limit**: 10MB maximum file size
- **Custom Folders**: Organize PDFs in Cloudinary folders
- **Custom Public IDs**: Set custom identifiers for files
- **Delete Files**: Remove PDFs from Cloudinary
- **File Information**: Get metadata about uploaded PDFs
- **Direct Upload URLs**: Generate signed URLs for client-side uploads

### 🔧 Configuration Options

- **Resource Type**: Set to 'raw' for PDF files
- **Format Validation**: Only PDF format allowed
- **Quality Optimization**: Automatic quality optimization
- **Error Handling**: Comprehensive error handling and validation

### 📁 File Organization

PDFs are organized in Cloudinary folders:
- Default folder: `pdfs/`
- Custom folders can be specified during upload
- Files are stored with unique public IDs

## Error Handling

The system includes comprehensive error handling for:

- Invalid file types (non-PDF files)
- File size limits (10MB max)
- Upload failures
- Network errors
- Cloudinary API errors

## Security Features

- File type validation
- File size limits
- Secure URL generation
- API key protection
- Input sanitization

## Performance Considerations

- Memory storage for temporary file handling
- Efficient buffer processing
- Optimized Cloudinary transformations
- Batch upload support for multiple files

## Troubleshooting

### Common Issues

1. **"Invalid config key" error**: Ensure all Cloudinary environment variables are set
2. **"Only PDF files are allowed"**: Check that uploaded files are actually PDFs
3. **"File size too large"**: Reduce file size or increase limit in middleware
4. **Upload failures**: Verify Cloudinary credentials and network connectivity

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=cloudinary:*
```

## Integration with Database

To store PDF references in your database:

```typescript
// Example: Save PDF info to database
const pdfRecord = await prisma.pdfDocument.create({
  data: {
    publicId: uploadResult.data.public_id,
    secureUrl: uploadResult.data.secure_url,
    fileName: req.file.originalname,
    fileSize: uploadResult.data.bytes,
    uploadedAt: new Date()
  }
});
```

## Support

For issues related to:
- **Cloudinary API**: Check [Cloudinary documentation](https://cloudinary.com/documentation)
- **This implementation**: Check the error logs and ensure proper configuration
- **File uploads**: Verify file format and size constraints 