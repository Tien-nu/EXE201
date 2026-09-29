"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
module.exports = (0, utils_1.defineConfig)({
    admin: {
        disable: process.env.NODE_ENV === "production",
    },
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET,
            // Storefront keeps the login cookie for 7 days; a 1-day token (Medusa's
            // default) made pages fail with "Unauthorized" after a day.
            jwtExpiresIn: '7d',
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFHakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBQSxvQkFBWSxFQUFDO0lBQzVCLEtBQUssRUFBRTtRQUNMLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZO0tBQy9DO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVTtZQUNoQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO1lBQ2pDLHdFQUF3RTtZQUN4RSw0REFBNEQ7WUFDNUQsWUFBWSxFQUFFLElBQUk7WUFDbEIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYTtTQUN4QztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1A7WUFDRSxPQUFPLEVBQUUsMkJBQTJCO1NBQ3JDO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsK0JBQStCO1lBQ3hDLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLHFDQUFxQzt3QkFDOUMsRUFBRSxFQUFFLE9BQU87d0JBQ1gsT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQzt5QkFDbkI7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsT0FBTyxFQUFFLGtDQUFrQzt3QkFDM0MsRUFBRSxFQUFFLGNBQWM7d0JBQ2xCLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ25CLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzNCLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7NEJBQ3ZFLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzNCLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzNCLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7eUJBQzVCO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtRQUNEO1lBQ0UsT0FBTyxFQUFFLDhCQUE4QjtZQUN2QyxPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxxQ0FBcUM7d0JBQzlDLEVBQUUsRUFBRSxRQUFRO3FCQUNiO29CQUNEO3dCQUNFLE9BQU8sRUFBRSwrQkFBK0I7d0JBQ3hDLEVBQUUsRUFBRSxLQUFLO3FCQUNWO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=