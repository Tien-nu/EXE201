"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hardReset;
const utils_1 = require("@medusajs/framework/utils");
async function hardReset({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // To perform raw SQL queries in Medusa v2, we usually resolve the Knex instance.
    // Or we can just use the internal query builder.
    const dbConfig = container.resolve("pgConnection");
    if (dbConfig) {
        try {
            await dbConfig.raw('TRUNCATE TABLE product CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_collection CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_category CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_tag CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_option CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_type CASCADE;');
            await dbConfig.raw('TRUNCATE TABLE product_variant CASCADE;');
            logger.info('Hard deleted all products, collections, categories, tags, options.');
        }
        catch (e) {
            logger.error('Failed to run raw SQL TRUNCATE: ' + e);
        }
    }
    else {
        logger.error('No DB connection found.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFyZC1yZXNldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2hhcmQtcmVzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSw0QkF5QkM7QUE1QkQscURBQXFFO0FBR3RELEtBQUssVUFBVSxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDN0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsRSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWhFLGlGQUFpRjtJQUNqRixpREFBaUQ7SUFDakQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBb0QsY0FBYyxDQUFDLENBQUE7SUFFckcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQztZQUNILE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1lBQ3JELE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1lBQ2hFLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1lBQzlELE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO1lBQ3pELE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1lBQzVELE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO1lBQzFELE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO1lBRTdELE1BQU0sQ0FBQyxJQUFJLENBQUMsb0VBQW9FLENBQUMsQ0FBQTtRQUNuRixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDdEQsQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7QUFDSCxDQUFDIn0=