import { config } from 'dotenv'

config()

export const {
    PORT = '',
    FRONTEND_URL = '',
    DATABASE_URL = '',
    CLOUDINARY_API_KEY = '',
    CLOUDINARY_CLOUD_NAME = '',
    CLOUDINARY_API_SECRET = '',
    JWT_CREDENTIAL_SECRET = '',
    JWT_REFRESH_SECRET = '',
    NODE_ENV = '',
    EMAIL_USER = '',
    EMAIL_PASS = '',
    GOOGLE_CLIENT_ID = '',
} = process.env