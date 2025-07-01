import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb';

let gridFSBucket: GridFSBucket | null = null;

// Initialize GridFS bucket
export async function getGridFSBucket(): Promise<GridFSBucket> {
    if (!gridFSBucket) {
        await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        gridFSBucket = new GridFSBucket(db, { bucketName: 'bankSlips' });
    }
    return gridFSBucket;
}

// Upload file to GridFS
export async function uploadFileToGridFS(
    fileBuffer: Buffer,
    filename: string,
    contentType: string
): Promise<ObjectId> {
    const bucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: contentType,
            metadata: {
                uploadDate: new Date(),
                originalName: filename
            }
        });

        uploadStream.on('error', (error) => {
            console.error('GridFS upload error:', error);
            reject(error);
        });

        uploadStream.on('finish', () => {
            console.log(`File uploaded successfully with ID: ${uploadStream.id}`);
            resolve(uploadStream.id);
        });

        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
}

// Download file from GridFS
export async function downloadFileFromGridFS(fileId: string | ObjectId): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
    size: number;
}> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    // Get file metadata
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
        throw new Error('File not found');
    }

    const file = files[0];

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        const downloadStream = bucket.openDownloadStream(objectId);

        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on('error', (error) => {
            console.error('GridFS download error:', error);
            reject(error);
        });

        downloadStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve({
                buffer,
                filename: file.filename || 'unknown',
                contentType: file.contentType || 'application/octet-stream',
                size: file.length || buffer.length
            });
        });
    });
}

// Delete file from GridFS
export async function deleteFileFromGridFS(fileId: string | ObjectId): Promise<void> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    try {
        await bucket.delete(objectId);
        console.log(`File deleted successfully: ${objectId}`);
    } catch (error) {
        console.error('GridFS delete error:', error);
        throw error;
    }
}

// Check if file exists in GridFS
export async function fileExistsInGridFS(fileId: string | ObjectId): Promise<boolean> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    try {
        const files = await bucket.find({ _id: objectId }).toArray();
        return files.length > 0;
    } catch (error) {
        console.error('GridFS file check error:', error);
        return false;
    }
}

// List all files (for admin purposes)
export async function listAllFiles(): Promise<Array<{
    _id: ObjectId;
    filename: string;
    contentType: string;
    length: number;
    uploadDate: Date;
}>> {
    const bucket = await getGridFSBucket();

    try {
        const files = await bucket.find({}).toArray();
        return files.map(file => ({
            _id: file._id,
            filename: file.filename || 'unknown',
            contentType: file.contentType || 'unknown',
            length: file.length || 0,
            uploadDate: file.uploadDate || new Date()
        }));
    } catch (error) {
        console.error('GridFS list files error:', error);
        throw error;
    }
}

// Validate file type for bank slips
export function validateBankSlipFile(contentType: string, filename: string): boolean {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/bmp', 'image/webp', 'application/pdf'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'];

    const hasValidType = allowedTypes.includes(contentType.toLowerCase());
    const hasValidExtension = allowedExtensions.some(ext =>
        filename.toLowerCase().endsWith(ext)
    );

    return hasValidType && hasValidExtension;
}

export type { GridFSBucket } from 'mongodb';
