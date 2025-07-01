import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if environment variables are available
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️ Cloudinary configuration missing. File uploads will not work.');
}

export { cloudinary };

// Upload buffer to Cloudinary
export async function uploadToCloudinary(
    buffer: Buffer, 
    filename: string, 
    folder: string = 'tournament-uploads'
): Promise<{ url: string; public_id: string }> {
    if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,
                public_id: filename,
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                } else {
                    reject(new Error('Upload failed - no result returned'));
                }
            }
        ).end(buffer);
    });
}
