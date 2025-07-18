import { db } from "../server/db";
import { tradingPlatforms } from "../shared/schema";
import { eq } from "drizzle-orm";

async function addSubdomainsToExistingPlatforms() {
  console.log("Adding subdomains to existing platforms...");
  
  // Get all platforms without subdomain
  const platforms = await db.select().from(tradingPlatforms);
  
  for (const platform of platforms) {
    if (!platform.subdomain) {
      // Generate subdomain from slug
      const subdomain = platform.slug;
      
      console.log(`Updating platform ${platform.id} (${platform.name}) with subdomain: ${subdomain}`);
      
      await db
        .update(tradingPlatforms)
        .set({ subdomain })
        .where(eq(tradingPlatforms.id, platform.id));
    }
  }
  
  console.log("Done! All platforms now have subdomains.");
  process.exit(0);
}

addSubdomainsToExistingPlatforms().catch(console.error);