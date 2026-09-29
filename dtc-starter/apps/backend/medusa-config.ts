import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Uploaded images go to S3-compatible storage (Supabase Storage) when
// S3_BUCKET is set; otherwise they are saved in ./static like in development.
// A cloud server loses ./static on every redeploy, so production needs S3.
const fileProvider = process.env.S3_BUCKET
  ? {
      resolve: '@medusajs/medusa/file-s3',
      id: 's3',
      options: {
        file_url: process.env.S3_FILE_URL,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        // Supabase does not support object ACLs; the bucket itself is public.
        acl: false,
        additional_client_config: { forcePathStyle: true },
      },
    }
  : {
      resolve: '@medusajs/medusa/file-local',
      id: 'local',
      options: {
        backend_url: `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/static`,
      },
    }

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      // Storefront keeps the login cookie for 7 days; a 1-day token (Medusa's
      // default) made pages fail with "Unauthorized" after a day.
      jwtExpiresIn: '7d',
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      resolve: './src/modules/marketplace',
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [fileProvider],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              channels: ['feed'],
            },
          },
          {
            resolve: './src/modules/email-notification',
            id: 'yarnly-email',
            options: {
              channels: ['email'],
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
              from: process.env.SMTP_FROM,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
          },
          {
            resolve: './src/modules/ghn-fulfillment',
            id: 'ghn',
          },
        ],
      },
    },
  ],
})
