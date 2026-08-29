// Server configuration from environment variables.
import dotenv from 'dotenv';
dotenv.config();

const bool = (v: string | undefined, d: boolean) => (v === undefined ? d : v === '1' || v.toLowerCase() === 'true');

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'adsec',
    password: process.env.PGPASSWORD || 'adsec_dev_password',
    database: process.env.PGDATABASE || 'adsecurity',
  },
  jwtSecret: process.env.JWT_SECRET || 'adsec-dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'server/uploads',
  maxImageBytes: Number(process.env.MAX_IMAGE_BYTES || 5 * 1024 * 1024),
  maxFileBytes: Number(process.env.MAX_FILE_BYTES || 10 * 1024 * 1024),
  publicUrl: process.env.PUBLIC_URL || '',
  seedAdmin: bool(process.env.SEED_ADMIN, false),
};