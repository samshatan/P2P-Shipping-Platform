import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

const S3_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const S3_PORT = parseInt(process.env.MINIO_PORT || '9000');
const S3_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'swiftroute';
const S3_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'swiftroute123';
const S3_BUCKET = process.env.MINIO_BUCKET || 'evidence-vault';

const s3Client = new S3Client({
    region: 'ap-south-1',
    endpoint: `http://${S3_ENDPOINT}:${S3_PORT}`,
    forcePathStyle: true,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY
    }
});

async function initS3() {
    console.log(`🪣 Checking S3 Bucket: ${S3_BUCKET}...`);
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
        console.log('✅ Bucket already exists.');
    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            console.log('📦 Creating missing bucket...');
            await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
            console.log('✅ Bucket created successfully.');
        } else {
            console.error('❌ S3 Initialization Failed:', error);
        }
    }
}

initS3();
