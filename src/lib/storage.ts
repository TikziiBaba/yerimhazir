
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

/**
 * İstemci tarafından doğrudan R2'ye yükleme için presigned URL üretir.
 * API anahtarları asla istemciye sızamaz.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB varsayılan
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes,
  });

  const uploadUrl = await getSignedUrl(S3, command, {
    expiresIn: 300, // 5 dakika geçerli
  });

  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

/**
 * İşletme medya dosyası için benzersiz anahtar oluşturur.
 * Yapı: businesses/{businessId}/{type}/{timestamp}.{ext}
 */
export function generateStorageKey(
  businessId: string,
  type: 'logo' | 'cover' | 'gallery',
  filename: string
): string {
  const ext = filename.split('.').pop() || 'webp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `businesses/${businessId}/${type}/${timestamp}-${random}.${ext}`;
}
