import { db } from '../server/db.ts';
import { tradingPlatforms, platformVerificationTokens } from '../shared/schema.ts';

async function checkVerificationCodes() {
  const platforms = await db.select().from(tradingPlatforms);
  const tokens = await db.select().from(platformVerificationTokens);
  
  console.log('Total platforms:', platforms.length);
  console.log('\nPlatforms with verification codes:');
  
  for (const platform of platforms) {
    const token = tokens.find(t => t.platformId === platform.id);
    console.log(`Platform ${platform.id} (${platform.name}): ${token ? token.code : 'NO CODE'}`);
  }
  
  const platformsWithoutCodes = platforms.filter(p => !tokens.find(t => t.platformId === p.id));
  
  if (platformsWithoutCodes.length > 0) {
    console.log('\nPlatforms WITHOUT verification codes:', platformsWithoutCodes.length);
    platformsWithoutCodes.forEach(p => console.log(`- Platform ${p.id}: ${p.name}`));
  } else {
    console.log('\nAll platforms have verification codes!');
  }
  
  process.exit(0);
}

checkVerificationCodes();