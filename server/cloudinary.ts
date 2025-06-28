import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Upload buffer to Cloudinary
export async function uploadToCloudinary(
    buffer: Buffer, 
    filename: string, 
    folder: string = 'tournament-uploads'
): Promise<{ url: string; public_id: string }> {
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
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        ).end(buffer);
    });
}
