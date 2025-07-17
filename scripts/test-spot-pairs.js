// Using built-in fetch in Node.js 18+

async function testSpotPairs() {
  try {
    // Fetch spot metadata directly from Hyperliquid
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'spotMetaAndAssetCtxs',
      }),
    });

    const data = await response.json();
    
    if (!data || data.length < 2) {
      console.error('Failed to fetch spot data');
      return;
    }
    
    const [spotMeta, assetCtxs] = data;
    
    console.log('Total tokens:', spotMeta.tokens.length);
    console.log('\nSearching for BTC, ETH, SOL, FARTCOIN, PUMP, HYPE...\n');
    
    // Look for our target tokens and their variations (including U-variants)
    const targetTokens = ['BTC', 'UBTC', 'WBTC', 'ETH', 'UETH', 'WETH', 'SOL', 'USOL', 'WSOL', 'FARTCOIN', 'FART', 'PUMP', 'HYPE'];
    const foundTokens = [];
    
    spotMeta.tokens.forEach(token => {
      if (targetTokens.includes(token.name)) {
        foundTokens.push(token);
      }
    });
    
    console.log('Found tokens:');
    foundTokens.forEach(token => {
      console.log(`- ${token.name} (index: ${token.index})`);
    });
    
    // Find USDC pairs for these tokens
    console.log('\nUSDC Trading Pairs:\n');
    
    spotMeta.universe.forEach((pair, pairIndex) => {
      const baseTokenIndex = pair.tokens[0];
      const quoteTokenIndex = pair.tokens[1];
      
      const baseToken = spotMeta.tokens.find(t => t.index === baseTokenIndex);
      const quoteToken = spotMeta.tokens.find(t => t.index === quoteTokenIndex);
      
      if (quoteToken?.name === 'USDC') {
        const isTargetToken = foundTokens.some(t => t.index === baseTokenIndex);
        if (isTargetToken) {
          const assetCtx = assetCtxs[pairIndex];
          const price = parseFloat(assetCtx?.midPx || assetCtx?.markPx || '0');
          const volume = parseFloat(assetCtx?.dayNtlVlm || '0');
          
          console.log(`${baseToken.name}/USDC:`);
          console.log(`  - Pair Name: ${pair.name}`);
          console.log(`  - Price: $${price.toFixed(6)}`);
          console.log(`  - 24h Volume: $${volume.toFixed(2)}`);
          console.log(`  - Pair Index: ${pairIndex}`);
          console.log('');
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSpotPairs();