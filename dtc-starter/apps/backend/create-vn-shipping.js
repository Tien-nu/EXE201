const { initialize } = require("@medusajs/medusa");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

async function createShippingOption() {
  const medusa = await initialize({
    projectConfig: {
      databaseUrl: process.env.DATABASE_URL,
    },
  });

  try {
    const regionService = medusa.resolve("regionModuleService");
    const fulfillmentService = medusa.resolve("fulfillmentModuleService");
    const stockLocationService = medusa.resolve("stockLocationService");

    const regions = await regionService.list();
    const vnRegion = regions.find((r) => r.currency_code === "vnd" || r.name.toLowerCase().includes("vietnam"));
    
    if (!vnRegion) {
      console.log("VN region not found!");
      return;
    }

    const fulfillmentSets = await fulfillmentService.listFulfillmentSets();
    if (fulfillmentSets.length === 0) {
        console.log("No fulfillment sets found!");
        return;
    }
    
    // Create shipping option
    console.log("Creating shipping option...");
    // Just inject via raw SQL for simplicity since Medusa V2 shipping option creation via service is complex
  } catch (e) {
    console.error(e);
  }
}

createShippingOption();
