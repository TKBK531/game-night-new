# MongoDB GridFS File Storage Setup

Your ProcurementPro website now supports direct file storage in MongoDB using GridFS! This eliminates the need for external file storage services like Cloudinary for bank slip uploads.

## 🚀 What's New

### GridFS File Storage
- **Direct MongoDB Storage**: Bank slip files are stored directly in your MongoDB database
- **No External Dependencies**: No need for Cloudinary or other file storage services
- **Automatic File Management**: Files are automatically managed with your database backups
- **Better Security**: Files are stored with your data, not on external services

## 📁 File Storage Options

Your application now supports **two file storage methods**:

### 1. MongoDB GridFS (Recommended)
- Files stored directly in MongoDB
- Automatic backup with database
- No external service required
- Better for small to medium files (< 16MB each)

### 2. Cloudinary (Fallback)
- External cloud storage
- Better for large files or CDN requirements
- Requires Cloudinary account setup

## 🔧 Technical Details

### GridFS Schema
Your MongoDB schema now includes:

```typescript
// Team document structure
{
  teamName: string,
  game: 'valorant' | 'cod',
  // ... other fields ...
  
  // GridFS file storage
  bankSlipFileId: ObjectId,        // GridFS file ID
  bankSlipFileName: string,        // Original filename
  bankSlipContentType: string,     // MIME type
  
  // Cloudinary fallback (optional)
  bankSlipUrl: string             // External URL
}
```

### Supported File Types
- **Images**: JPEG, PNG, GIF, BMP, WebP
- **Documents**: PDF
- **File Size Limit**: 5MB per file
- **Storage**: MongoDB GridFS collections (`bankSlips.files` and `bankSlips.chunks`)

## 🔄 API Endpoints

### File Upload
```http
POST /api/teams
Content-Type: multipart/form-data

{
  "teamName": "TeamName",
  "game": "valorant",
  // ... other team fields ...
  "bankSlip": [FILE_UPLOAD]
}
```

### File Download
```http
GET /api/files/{teamId}/bank-slip
```
**Response**: Direct file stream with proper headers

### Admin File List
```http
GET /api/admin/files
```
**Response**:
```json
[
  {
    "teamId": "507f1f77bcf86cd799439011",
    "teamName": "TeamName",
    "fileName": "TeamName-Captain-1234567890.jpg",
    "fileType": "gridfs",
    "fileId": "507f1f77bcf86cd799439012",
    "fileUrl": "/api/files/507f1f77bcf86cd799439011/bank-slip",
    "contentType": "image/jpeg",
    "uploadedAt": "2025-07-01T10:00:00Z"
  }
]
```

## 🛠️ Setup Instructions

### 1. MongoDB Atlas Configuration
Follow the existing `MONGODB_SETUP.md` guide - no additional setup required for GridFS!

### 2. Environment Variables
```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/procurementpro?retryWrites=true&w=majority

# Optional (Cloudinary fallback)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Test File Upload
```powershell
# Start your application
npm run dev

# Test team registration with file upload through your website
# Files will be automatically stored in MongoDB GridFS
```

## 📊 File Management

### View Files in MongoDB Atlas
1. Go to your MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Look for collections:
   - `bankSlips.files` - File metadata
   - `bankSlips.chunks` - File data chunks
   - `teams` - Team data with file references

### File Storage Structure
```
MongoDB Database
├── teams (collection)
│   └── Documents with bankSlipFileId references
├── bankSlips.files (GridFS metadata)
│   └── File information (filename, size, type, etc.)
└── bankSlips.chunks (GridFS data)
    └── File content in 255KB chunks
```

## 🔍 Monitoring & Administration

### Check File Storage Status
```http
GET /api/health
```
**Response**:
```json
{
  "status": "ok",
  "fileStorage": "mongodb_gridfs",
  "database": "configured"
}
```

### Admin Operations
- **List Files**: `GET /api/admin/files`
- **Download File**: `GET /api/files/{teamId}/bank-slip`
- **View Team Data**: Standard MongoDB queries on `teams` collection

## 🚨 Important Notes

### File Size Limits
- **MongoDB GridFS**: 16MB per file (default MongoDB document limit)
- **Application**: 5MB per file (configured in multer)
- **Recommended**: Keep files under 5MB for best performance

### Backup Considerations
- **GridFS files are included in MongoDB backups**
- **No separate file backup needed**
- **Restore operations include all files**

### Performance
- **Small files (< 1MB)**: Excellent performance
- **Medium files (1-5MB)**: Good performance
- **Large files (> 5MB)**: Consider external storage

## 🔄 Migration from Cloudinary

If you have existing teams with Cloudinary files, they will continue to work:
- Existing `bankSlipUrl` fields are preserved
- New uploads use GridFS automatically
- File access endpoint supports both storage types
- No manual migration required

## 🎉 Benefits

### Simplified Architecture
- ✅ **Single Database**: Everything in MongoDB
- ✅ **No External Dependencies**: No Cloudinary account needed
- ✅ **Automatic Backups**: Files backed up with database
- ✅ **Better Security**: Files stay with your data

### Development Benefits
- ✅ **Easier Setup**: No external service configuration
- ✅ **Local Development**: Works entirely offline
- ✅ **Consistent Storage**: All data in one place
- ✅ **Free Tier Friendly**: No additional costs

Your file storage is now fully integrated with MongoDB! 🚀
