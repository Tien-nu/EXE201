import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: './src/modules/marketplace',
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
