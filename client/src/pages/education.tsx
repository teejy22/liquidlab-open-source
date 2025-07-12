import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, TrendingUp, AlertTriangle, DollarSign, Search, Clock, User, ArrowRight } from "lucide-react";

const educationCategories = [
  {
    id: "hyperliquid",
    title: "Hyperliquid Basics",
    description: "Learn about the Hyperliquid DEX and its features",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-800",
    articles: [
      {
        title: "What is Hyperliquid?",
        description: "A comprehensive introduction to Hyperliquid's decentralized exchange",
        readTime: "5 min",
        difficulty: "Beginner",
        content: `
# What is Hyperliquid?

Hyperliquid is a high-performance decentralized exchange (DEX) built specifically for derivatives trading. Unlike traditional centralized exchanges, Hyperliquid operates entirely on-chain while maintaining the speed and user experience of centralized platforms.

## Key Features

### 1. Fully On-Chain Operations
- All trades are executed on the blockchain
- Complete transparency and decentralization
- No custodial risk - you control your funds

### 2. High Performance
- Sub-second trade execution
- Advanced order types (limit, market, stop-loss)
- Real-time order book updates

### 3. Perpetual Futures Focus
- Trade perpetual contracts on major cryptocurrencies
- Up to 50x leverage available
- Automatic position management

## How It Works

Hyperliquid uses a unique architecture that combines:
- **On-chain settlement**: All trades are recorded on the blockchain
- **Optimized execution**: Fast matching engine for instant trades
- **Decentralized governance**: Community-driven protocol updates

## Getting Started

To start trading on Hyperliquid:
1. Connect your wallet (MetaMask, WalletConnect)
2. Deposit USDC as collateral
3. Choose your trading pair
4. Place your first trade

## Safety Features

- **Liquidation Protection**: Automatic position closure to prevent losses exceeding collateral
- **Risk Management**: Built-in tools to manage your exposure
- **Transparent Fees**: Clear fee structure with no hidden costs
        `
      },
      {
        title: "Hyperliquid vs Traditional Exchanges",
        description: "Compare Hyperliquid with centralized exchanges",
        readTime: "7 min",
        difficulty: "Beginner",
        content: `
# Hyperliquid vs Traditional Exchanges

Understanding the differences between Hyperliquid and traditional centralized exchanges is crucial for making informed trading decisions.

## Centralized Exchanges (CEX)

### Advantages:
- High liquidity
- Fast execution
- Advanced trading features
- Customer support

### Disadvantages:
- **Custodial Risk**: Exchange controls your funds
- **Regulatory Risk**: Subject to government regulations
- **Counterparty Risk**: Exchange could fail or be hacked
- **Limited Transparency**: Order matching happens off-chain

## Hyperliquid (DEX)

### Advantages:
- **Self-Custody**: You control your private keys
- **Transparency**: All trades visible on-chain
- **No KYC**: Trade without identity verification
- **Global Access**: Available worldwide
- **Censorship Resistant**: Cannot be shut down by authorities

### Disadvantages:
- Learning curve for wallet management
- Gas fees for transactions
- Limited customer support
- Newer technology with potential bugs

## Key Differences

| Feature | Centralized Exchange | Hyperliquid |
|---------|---------------------|-------------|
| Fund Control | Exchange | User |
| Transparency | Limited | Full |
| Speed | Very Fast | Fast |
| Liquidity | High | Growing |
| KYC Required | Yes | No |
| Regulatory Risk | High | Low |

## Which Should You Choose?

**Choose Hyperliquid if:**
- You value self-custody and decentralization
- You want transparency in trading
- You prefer no KYC requirements
- You're comfortable with wallet management

**Choose Traditional Exchanges if:**
- You want maximum liquidity
- You prefer customer support
- You're new to crypto trading
- You don't mind custodial arrangements
        `
      },
      {
        title: "Setting Up Your Hyperliquid Account",
        description: "Step-by-step guide to getting started",
        readTime: "8 min",
        difficulty: "Beginner",
        content: `
# Setting Up Your Hyperliquid Account

Get started with Hyperliquid in just a few simple steps.

## Step 1: Install a Web3 Wallet

### MetaMask (Recommended)
1. Visit [metamask.io](https://metamask.io)
2. Download the browser extension
3. Create a new wallet or import existing one
4. **Important**: Write down your seed phrase and store it safely

### Alternative Wallets
- WalletConnect compatible wallets
- Coinbase Wallet
- Trust Wallet

## Step 2: Connect to Hyperliquid

1. Visit [app.hyperliquid.xyz](https://app.hyperliquid.xyz)
2. Click "Connect Wallet"
3. Select your wallet provider
4. Approve the connection

## Step 3: Add Funds

### Deposit USDC
1. Click "Deposit" in the top menu
2. Select USDC as your deposit currency
3. Enter the amount you want to deposit
4. Confirm the transaction in your wallet

### Minimum Deposit
- No minimum deposit required
- Consider gas fees when depositing small amounts
- Start with a small amount to test the system

## Step 4: Verify Your Setup

### Check Your Balance
- Your USDC balance should appear in the top right
- It may take a few minutes for the deposit to confirm

### Test a Small Trade
1. Select a trading pair (e.g., BTC-USD)
2. Place a small market order
3. Verify the trade executed correctly

## Step 5: Security Best Practices

### Wallet Security
- Never share your private keys or seed phrase
- Use a hardware wallet for large amounts
- Enable two-factor authentication if available

### Trading Security
- Start with small positions
- Use stop-losses to limit risk
- Don't invest more than you can afford to lose

## Troubleshooting

### Common Issues:
- **Wallet won't connect**: Try refreshing the page
- **Transaction failed**: Check if you have enough ETH for gas
- **Deposit not showing**: Wait for blockchain confirmation

### Getting Help:
- Check Hyperliquid's documentation
- Join their Discord community
- Follow their Twitter for updates
        `
      }
    ]
  },
  {
    id: "perpetual-futures",
    title: "Perpetual Futures",
    description: "Understanding perpetual contracts and how they work",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-green-100 text-green-800",
    articles: [
      {
        title: "What are Perpetual Futures?",
        description: "Introduction to perpetual contracts and their unique features",
        readTime: "6 min",
        difficulty: "Intermediate",
        content: `
# What are Perpetual Futures?

Perpetual futures, also known as perpetual swaps, are derivative contracts that allow traders to speculate on the price of an asset without owning the underlying asset and without an expiration date.

## Key Characteristics

### 1. No Expiration Date
- Unlike traditional futures, perpetual contracts never expire
- You can hold positions as long as you want
- No need to roll over contracts

### 2. Leverage Trading
- Trade with borrowed funds to amplify potential returns
- Common leverage ratios: 2x, 5x, 10x, 25x, 50x
- Higher leverage = higher risk and potential rewards

### 3. Funding Rate Mechanism
- Keeps the contract price close to the spot price
- Paid between long and short traders
- Calculated every 8 hours on most platforms

## How They Work

### Long Position
- **Betting the price will go up**
- Buy the perpetual contract
- Profit when price increases
- Loss when price decreases

### Short Position
- **Betting the price will go down**
- Sell the perpetual contract
- Profit when price decreases
- Loss when price increases

## Funding Rates

The funding rate is a mechanism that ensures the perpetual contract price stays close to the spot price.

### Positive Funding Rate
- Longs pay shorts
- Happens when contract price > spot price
- Indicates bullish sentiment

### Negative Funding Rate
- Shorts pay longs
- Happens when contract price < spot price
- Indicates bearish sentiment

## Example Trade

Let's say BTC is trading at $50,000:

**Long Position with 10x Leverage:**
- Invest $1,000 of your own money
- Control $10,000 worth of BTC
- If BTC goes to $55,000 (10% increase)
- Your profit: $1,000 (100% return on your investment)
- If BTC goes to $45,000 (10% decrease)
- Your loss: $1,000 (100% loss of your investment)

## Advantages

1. **No Expiration**: Hold positions indefinitely
2. **High Liquidity**: Easy to enter and exit positions
3. **Leverage**: Amplify potential returns
4. **Short Selling**: Profit from falling prices
5. **24/7 Trading**: Markets never close

## Risks

1. **Liquidation Risk**: Positions can be forcefully closed
2. **Funding Costs**: May pay funding fees
3. **High Volatility**: Amplified by leverage
4. **Complexity**: Requires understanding of derivatives

## Best Practices

1. **Start Small**: Begin with low leverage
2. **Use Stop Losses**: Limit potential losses
3. **Monitor Funding Rates**: Understand the costs
4. **Risk Management**: Never risk more than you can afford
5. **Education**: Learn before you trade
        `
      },
      {
        title: "Funding Rates Explained",
        description: "Deep dive into how funding rates work and their impact",
        readTime: "8 min",
        difficulty: "Intermediate",
        content: `
# Funding Rates Explained

Funding rates are a crucial mechanism in perpetual futures trading that keeps contract prices aligned with spot prices. Understanding them is essential for successful trading.

## What is a Funding Rate?

The funding rate is a periodic payment between long and short traders that helps maintain the perpetual contract price close to the underlying asset's spot price.

## How It Works

### Payment Direction
- **Positive Funding Rate**: Long traders pay short traders
- **Negative Funding Rate**: Short traders pay long traders

### Payment Schedule
- Most exchanges: Every 8 hours
- Hyperliquid: Every 8 hours (00:00, 08:00, 16:00 UTC)
- Payment only occurs if you hold a position at the funding time

## Funding Rate Calculation

The funding rate typically consists of two components:

### 1. Interest Rate Component
- Usually fixed at 0.01% per 8 hours
- Represents the cost of borrowing

### 2. Premium Component
- Based on the difference between contract and spot price
- Calculated using the average premium over the funding period

**Formula:**
\`\`\`
Funding Rate = Interest Rate + Premium
\`\`\`

## Impact on Trading

### For Long Positions
- **Positive Funding**: You pay funding fees
- **Negative Funding**: You receive funding payments
- High positive funding rates can eat into profits

### For Short Positions
- **Positive Funding**: You receive funding payments
- **Negative Funding**: You pay funding fees
- High negative funding rates can reduce profits

## Reading Funding Rates

### Typical Ranges
- **Normal Market**: -0.05% to +0.05%
- **Bullish Market**: +0.05% to +0.50%
- **Bearish Market**: -0.50% to -0.05%
- **Extreme**: Beyond ±0.50%

### What High Rates Mean
- **High Positive**: Strong bullish sentiment, longs paying premium
- **High Negative**: Strong bearish sentiment, shorts paying premium

## Trading Strategies

### Funding Rate Arbitrage
1. **Identify High Funding Rates**
2. **Take Opposite Position**: If funding is high positive, go short
3. **Collect Funding**: Earn payments from the other side
4. **Hedge Risk**: Use spot positions to reduce price risk

### Timing Entries
- **Before Funding**: Avoid entering just before funding time
- **After Funding**: Better timing for new positions
- **Rate Changes**: Monitor upcoming funding rate estimates

## Examples

### Example 1: BTC Long Position
- Position Size: $10,000
- Funding Rate: +0.05%
- Funding Payment: $10,000 × 0.05% = $5 (you pay)

### Example 2: ETH Short Position
- Position Size: $5,000
- Funding Rate: +0.10%
- Funding Payment: $5,000 × 0.10% = $5 (you receive)

## Monitoring Tools

### On Hyperliquid
- Current funding rate displayed on trading interface
- Historical funding rates available
- Next funding time countdown

### External Tools
- Funding rate aggregators
- Historical data analysis
- Mobile apps with alerts

## Best Practices

1. **Monitor Rates**: Check funding rates before opening positions
2. **Factor in Costs**: Include funding costs in your trading calculations
3. **Timing**: Consider funding times when entering/exiting
4. **Hedging**: Use spot positions to reduce funding exposure
5. **Alerts**: Set up notifications for extreme funding rates

## Common Mistakes

1. **Ignoring Funding**: Not accounting for funding costs
2. **Bad Timing**: Opening positions right before funding
3. **Overleveraging**: High funding rates + high leverage = big costs
4. **Chasing Rates**: Entering trades solely for funding payments
        `
      },
      {
        title: "Mark Price vs Last Price",
        description: "Understanding different price types and their importance",
        readTime: "5 min",
        difficulty: "Intermediate",
        content: `
# Mark Price vs Last Price

Understanding the difference between mark price and last price is crucial for perpetual futures trading, especially for liquidation calculations.

## What is Last Price?

The last price is simply the price at which the most recent trade was executed on the exchange.

### Characteristics:
- **Real-time**: Updates with every trade
- **Volatile**: Can have sudden spikes or drops
- **Manipulable**: Large orders can temporarily move the price

## What is Mark Price?

The mark price is a calculated price that represents the "fair value" of the perpetual contract based on the underlying spot price.

### Characteristics:
- **Stable**: Less volatile than last price
- **Fair**: Represents true market value
- **Manipulation-resistant**: Harder to manipulate

## How Mark Price is Calculated

### Basic Formula:
\`\`\`
Mark Price = Spot Price + Funding Basis
\`\`\`

### Funding Basis:
- The difference between the perpetual and spot price
- Calculated using an exponential moving average
- Helps smooth out price discrepancies

### Spot Price Sources:
- Multiple spot exchanges (Binance, Coinbase, etc.)
- Weighted average of prices
- Removes outliers and manipulation attempts

## Why Mark Price Matters

### 1. Liquidation Calculations
- **Liquidation Price**: Based on mark price, not last price
- **Prevents Manipulation**: Protects against artificial liquidations
- **Fair Liquidation**: Ensures liquidations happen at fair prices

### 2. Unrealized PnL
- **Portfolio Value**: Calculated using mark price
- **Accurate Reporting**: Shows true position value
- **Margin Requirements**: Based on mark price

### 3. Risk Management
- **Stop Orders**: Some platforms use mark price for triggers
- **Margin Calls**: Calculated using mark price
- **Position Sizing**: Based on mark price value

## Examples

### Example 1: Market Manipulation Scenario
- **BTC Spot Price**: $50,000
- **Last Price**: $52,000 (due to large buy order)
- **Mark Price**: $50,100 (calculated fair value)
- **Liquidation**: Uses mark price, preventing unfair liquidation

### Example 2: Normal Trading
- **ETH Spot Price**: $3,000
- **Last Price**: $3,005
- **Mark Price**: $3,002
- **Small Difference**: Normal market conditions

## Monitoring Both Prices

### On Trading Platforms:
- **Last Price**: Usually displayed prominently
- **Mark Price**: Often shown in smaller text or separate section
- **Difference**: Some platforms show the spread

### Trading Implications:
- **Entry/Exit**: Use last price for actual trades
- **Risk Management**: Use mark price for position sizing
- **Liquidation Risk**: Monitor mark price for liquidation levels

## Best Practices

### 1. Always Check Mark Price
- Before opening large positions
- When calculating liquidation risk
- During volatile market conditions

### 2. Understand the Difference
- Large differences indicate manipulation or low liquidity
- Small differences are normal
- Use mark price for risk calculations

### 3. Set Conservative Liquidation Levels
- Account for potential mark price movements
- Don't rely solely on last price
- Leave buffer for price volatility

### 4. Monitor During High Volatility
- Differences can increase during volatile periods
- Be extra cautious with leverage
- Consider reducing position sizes

## Common Scenarios

### Flash Crashes
- Last price may spike down briefly
- Mark price remains stable
- Prevents unnecessary liquidations

### Low Liquidity
- Last price may be stale
- Mark price continues to track spot
- Provides better price discovery

### Market Manipulation
- Large orders affect last price
- Mark price remains fair
- Protects traders from manipulation

## Conclusion

Understanding the difference between mark price and last price is essential for:
- Accurate risk management
- Avoiding unfair liquidations
- Making informed trading decisions
- Calculating true position value

Always monitor both prices and understand their implications for your trading strategy.
        `
      }
    ]
  },
  {
    id: "leverage-trading",
    title: "Leverage Trading",
    description: "Learn about leverage, margin, and risk management",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-red-100 text-red-800",
    articles: [
      {
        title: "Understanding Leverage",
        description: "What is leverage and how does it work?",
        readTime: "7 min",
        difficulty: "Beginner",
        content: `
# Understanding Leverage

Leverage is a powerful tool that allows traders to control larger positions with less capital. While it can amplify profits, it also significantly increases risk.

## What is Leverage?

Leverage is using borrowed funds to increase your buying power and potentially amplify returns on an investment.

### Key Concepts:
- **Leverage Ratio**: The ratio of your total position to your own capital
- **Margin**: The amount of your own money required to open a position
- **Borrowed Capital**: The additional funds provided by the exchange

## How Leverage Works

### Basic Example:
- **Your Capital**: $1,000
- **Leverage**: 10x
- **Position Size**: $10,000
- **Borrowed**: $9,000

### The Math:
\`\`\`
Position Size = Your Capital × Leverage Ratio
$10,000 = $1,000 × 10
\`\`\`

## Leverage Ratios

### Common Ratios:
- **2x**: Double your position size
- **5x**: Five times your position size
- **10x**: Ten times your position size
- **25x**: Twenty-five times your position size
- **50x**: Fifty times your position size

### Risk Increases with Leverage:
- **Higher Leverage** = **Higher Risk**
- **Higher Leverage** = **Higher Potential Rewards**
- **Higher Leverage** = **Easier to Get Liquidated**

## Profit and Loss Amplification

### Example: BTC at $50,000
**Without Leverage:**
- Investment: $1,000
- BTC moves to $55,000 (+10%)
- Profit: $100 (10% return)

**With 10x Leverage:**
- Investment: $1,000
- Position Size: $10,000
- BTC moves to $55,000 (+10%)
- Profit: $1,000 (100% return)

**The Downside:**
- If BTC drops to $45,000 (-10%)
- Loss: $1,000 (100% loss)
- **Position would be liquidated**

## Margin Requirements

### Initial Margin
- The minimum amount needed to open a position
- Calculated as: Position Size ÷ Leverage Ratio
- Example: $10,000 position ÷ 10x = $1,000 initial margin

### Maintenance Margin
- The minimum amount needed to keep a position open
- Usually lower than initial margin
- Varies by exchange and asset

### Margin Call
- Warning when your margin falls below maintenance level
- Opportunity to add funds or close positions
- Prevents automatic liquidation

## Liquidation

### What is Liquidation?
- Automatic closure of your position
- Happens when losses exceed your margin
- Protects the exchange from losses

### Liquidation Price Calculation
\`\`\`
Liquidation Price = Entry Price × (1 - Initial Margin ÷ Leverage)
\`\`\`

### Example:
- Entry Price: $50,000
- Leverage: 10x
- Initial Margin: 10%
- Liquidation Price: $50,000 × (1 - 0.10) = $45,000

## Types of Leverage

### Cross Margin
- Uses your entire account balance as collateral
- Positions share the same margin pool
- Higher liquidation threshold
- More complex risk management

### Isolated Margin
- Each position has its own margin
- Losses limited to position margin
- Easier risk management
- Lower liquidation threshold

## Leverage Strategies

### Conservative Approach (2x-5x)
- **Lower Risk**: Less likely to be liquidated
- **Steady Returns**: Modest amplification
- **Good for Beginners**: Easier to manage

### Moderate Approach (5x-10x)
- **Balanced Risk/Reward**: Moderate amplification
- **Requires Skill**: Need good risk management
- **Popular Choice**: Common among experienced traders

### Aggressive Approach (10x+)
- **High Risk**: Easy to get liquidated
- **High Reward**: Significant amplification
- **Expert Level**: Requires excellent risk management

## Risk Management with Leverage

### 1. Position Sizing
- Never risk more than 1-2% of your account per trade
- Calculate position size based on risk tolerance
- Account for leverage amplification

### 2. Stop Losses
- Always set stop losses before entering
- Place them at logical technical levels
- Account for volatility and spread

### 3. Take Profits
- Set profit targets before entering
- Take partial profits as price moves in your favor
- Don't get greedy

### 4. Diversification
- Don't put all capital in one trade
- Spread risk across multiple positions
- Use different strategies

## Common Leverage Mistakes

### 1. Over-leveraging
- Using too much leverage for your experience level
- Not accounting for volatility
- Focusing only on potential profits

### 2. No Risk Management
- Not setting stop losses
- Ignoring position sizing rules
- Chasing losses with higher leverage

### 3. Emotional Trading
- Making decisions based on fear or greed
- Increasing leverage after losses
- Not sticking to the trading plan

### 4. Ignoring Funding Costs
- Not considering funding rate costs
- Holding positions too long
- Not factoring costs into profitability

## Best Practices

### 1. Start Small
- Begin with low leverage (2x-5x)
- Practice with small amounts
- Gradually increase as you gain experience

### 2. Educate Yourself
- Understand how leverage works
- Learn about margin requirements
- Study risk management techniques

### 3. Use Appropriate Tools
- Leverage calculators
- Risk management tools
- Position sizing calculators

### 4. Have a Plan
- Define your risk tolerance
- Set clear entry and exit rules
- Stick to your strategy

## Conclusion

Leverage is a double-edged sword that can amplify both profits and losses. Success with leverage requires:
- Proper education and understanding
- Disciplined risk management
- Appropriate position sizing
- Emotional control

Remember: **Higher leverage does not mean higher profits** - it means higher risk. Always trade responsibly and never risk more than you can afford to lose.
        `
      },
      {
        title: "Margin and Liquidation",
        description: "How margin trading works and how to avoid liquidation",
        readTime: "9 min",
        difficulty: "Intermediate",
        content: `
# Margin and Liquidation

Understanding margin requirements and liquidation mechanics is crucial for successful leverage trading. This guide will help you manage risk and avoid forced position closures.

## What is Margin?

Margin is the collateral required to open and maintain a leveraged position. It's your "skin in the game" that ensures you can cover potential losses.

### Types of Margin

#### 1. Initial Margin
- **Purpose**: Required to open a position
- **Calculation**: Position Size ÷ Leverage Ratio
- **Example**: $10,000 position with 10x leverage = $1,000 initial margin

#### 2. Maintenance Margin
- **Purpose**: Minimum required to keep position open
- **Typically**: 50-80% of initial margin
- **Example**: If initial margin is $1,000, maintenance might be $500

#### 3. Variation Margin
- **Purpose**: Additional margin called when losses occur
- **Frequency**: Calculated in real-time
- **Example**: Mark-to-market losses require additional collateral

## Margin Calculation

### Basic Formula:
\`\`\`
Required Margin = Position Size × Margin Percentage
\`\`\`

### Margin Percentage:
\`\`\`
Margin Percentage = 1 ÷ Leverage Ratio
\`\`\`

### Examples:
- **5x Leverage**: 1 ÷ 5 = 20% margin required
- **10x Leverage**: 1 ÷ 10 = 10% margin required
- **25x Leverage**: 1 ÷ 25 = 4% margin required

## Cross Margin vs Isolated Margin

### Cross Margin
**How it works:**
- All positions share the same margin pool
- Unrealized profits from one position can offset losses in another
- Your entire account balance acts as collateral

**Advantages:**
- Higher liquidation threshold
- Positions can support each other
- Better capital efficiency

**Disadvantages:**
- One bad trade can affect entire account
- Complex risk management
- Potential for larger losses

**Example:**
- Account Balance: $10,000
- Position 1: Long BTC, $5,000 notional, losing $1,000
- Position 2: Short ETH, $3,000 notional, gaining $500
- Net: $9,500 available for margin

### Isolated Margin
**How it works:**
- Each position has its own dedicated margin
- Losses are limited to the margin allocated to that position
- Other positions are not affected

**Advantages:**
- Limited risk per position
- Easier risk management
- Clear position-level risk

**Disadvantages:**
- Lower capital efficiency
- Each position stands alone
- May require more margin overall

**Example:**
- Position 1: $1,000 isolated margin, max loss = $1,000
- Position 2: $500 isolated margin, max loss = $500
- Other positions unaffected

## Liquidation Process

### What is Liquidation?
Liquidation is the automatic closure of a position when losses exceed available margin, protecting the exchange from trader default.

### Liquidation Triggers:
1. **Mark Price**: Position value falls below maintenance margin
2. **Margin Ratio**: Available margin drops below required minimum
3. **Account Balance**: Insufficient funds to cover losses

### Liquidation Price Calculation

#### For Long Positions:
\`\`\`
Liquidation Price = Entry Price × (1 - Initial Margin Rate + Taker Fee Rate)
\`\`\`

#### For Short Positions:
\`\`\`
Liquidation Price = Entry Price × (1 + Initial Margin Rate + Taker Fee Rate)
\`\`\`

### Example Calculations:

**Long Position:**
- Entry Price: $50,000
- Leverage: 10x (10% margin)
- Fee Rate: 0.1%
- Liquidation Price: $50,000 × (1 - 0.10 + 0.001) = $45,050

**Short Position:**
- Entry Price: $50,000
- Leverage: 10x (10% margin)
- Fee Rate: 0.1%
- Liquidation Price: $50,000 × (1 + 0.10 + 0.001) = $55,050

## Margin Health Monitoring

### Margin Ratio
\`\`\`
Margin Ratio = (Account Balance + Unrealized PnL) ÷ Maintenance Margin
\`\`\`

### Health Indicators:
- **> 2.0**: Very healthy
- **1.5 - 2.0**: Healthy
- **1.2 - 1.5**: Caution
- **1.0 - 1.2**: Danger zone
- **< 1.0**: Liquidation risk

### Margin Call Levels:
- **Warning**: Usually at 120-150% of maintenance margin
- **Margin Call**: At 100-110% of maintenance margin
- **Liquidation**: At or below 100% of maintenance margin

## Avoiding Liquidation

### 1. Conservative Leverage
- Use lower leverage ratios
- Start with 2x-5x for beginners
- Gradually increase with experience

### 2. Proper Position Sizing
- Never risk more than 1-2% of account per trade
- Calculate position size based on stop loss
- Account for volatility and spread

### 3. Stop Loss Orders
- **Always set stop losses** before entering
- Place them at logical technical levels
- Use stop-market or stop-limit orders

### 4. Monitor Margin Levels
- Check margin ratio regularly
- Set up alerts for margin calls
- Close positions before liquidation

### 5. Add Margin
- Deposit additional funds when needed
- Reduce position size to lower margin requirements
- Close unprofitable positions

## Liquidation Fees

### Typical Fee Structure:
- **Insurance Fund**: 0.1-0.5% of position value
- **Liquidation Engine**: 0.1-0.3% of position value
- **Total**: Usually 0.2-0.8% of position value

### Fee Calculation:
\`\`\`
Liquidation Fee = Position Value × Liquidation Fee Rate
\`\`\`

### Example:
- Position Value: $10,000
- Liquidation Fee Rate: 0.5%
- Liquidation Fee: $50

## Advanced Margin Strategies

### 1. Partial Liquidation
- Some exchanges liquidate only part of position
- Reduces position size to meet margin requirements
- Allows trader to keep some exposure

### 2. Auto-Deleveraging (ADL)
- System to close profitable positions
- Happens when insurance fund is depleted
- Rare but important to understand

### 3. Margin Trading Techniques
- **Hedging**: Use opposite positions to reduce risk
- **Scaling**: Add to positions at better prices
- **Rebalancing**: Adjust position sizes regularly

## Risk Management Tools

### 1. Position Size Calculator
\`\`\`
Position Size = (Account Balance × Risk %) ÷ (Entry Price - Stop Loss Price)
\`\`\`

### 2. Liquidation Price Calculator
- Use exchange tools or third-party calculators
- Always verify calculations
- Update when adding/removing margin

### 3. Margin Alerts
- Set up notifications for margin levels
- Use mobile apps for real-time monitoring
- Create automatic actions if possible

## Common Margin Mistakes

### 1. Over-leveraging
- Using too much leverage for account size
- Not accounting for volatility
- Focusing only on potential profits

### 2. Ignoring Margin Requirements
- Not monitoring margin levels
- Forgetting about funding costs
- Not planning for adverse moves

### 3. Poor Risk Management
- Not setting stop losses
- Adding to losing positions
- Revenge trading after liquidation

### 4. Misunderstanding Liquidation
- Thinking it won't happen to them
- Not calculating liquidation price
- Ignoring margin call warnings

## Best Practices Summary

1. **Start Conservative**: Use low leverage initially
2. **Monitor Constantly**: Check margin levels regularly
3. **Set Stops**: Always use stop-loss orders
4. **Size Appropriately**: Never risk more than you can afford
5. **Stay Educated**: Understand all mechanics before trading
6. **Plan for Worst Case**: Always have an exit strategy
7. **Use Tools**: Leverage calculators and monitoring tools

## Conclusion

Successful margin trading requires understanding:
- Different types of margin
- Liquidation mechanisms
- Risk management techniques
- Proper position sizing
- Continuous monitoring

Remember: **Liquidation is not a failure of the system - it's a feature designed to protect both trader and exchange.** Your job is to manage risk effectively and avoid reaching that point through proper planning and execution.
        `
      },
      {
        title: "Risk Management Strategies",
        description: "Essential techniques for managing leverage trading risks",
        readTime: "10 min",
        difficulty: "Advanced",
        content: `
# Risk Management Strategies

Risk management is the foundation of successful leverage trading. This comprehensive guide covers essential strategies to protect your capital and maximize long-term profitability.

## The 1% Rule

### Core Principle:
**Never risk more than 1% of your account balance on a single trade.**

### Calculation:
\`\`\`
Maximum Risk per Trade = Account Balance × 0.01
\`\`\`

### Example:
- Account Balance: $10,000
- Maximum Risk: $100 per trade
- Even with 10 consecutive losses, you still have $9,000 left

### Why It Works:
- Prevents catastrophic losses
- Allows for extended losing streaks
- Keeps emotions in check
- Enables long-term compounding

## Position Sizing

### Risk-Based Position Sizing
\`\`\`
Position Size = Risk Amount ÷ (Entry Price - Stop Loss Price)
\`\`\`

### Example:
- Risk Amount: $100
- Entry Price: $50,000
- Stop Loss: $49,000
- Position Size: $100 ÷ ($50,000 - $49,000) = 0.1 BTC

### Leverage Consideration:
- Higher leverage = smaller position size for same risk
- Lower leverage = larger position size for same risk

### Kelly Criterion (Advanced):
\`\`\`
f = (bp - q) ÷ b
\`\`\`
Where:
- f = fraction of capital to risk
- b = odds of winning
- p = probability of winning
- q = probability of losing

## Stop Loss Strategies

### 1. Fixed Percentage Stop Loss
- Set stop loss at fixed percentage below entry
- Example: 2% stop loss on all trades
- Simple but may not account for volatility

### 2. ATR-Based Stop Loss
- Use Average True Range for dynamic stops
- Calculation: Entry Price ± (ATR × Multiplier)
- Accounts for market volatility

### 3. Technical Stop Loss
- Based on support/resistance levels
- Trend lines, moving averages
- More logical but requires analysis

### 4. Trailing Stop Loss
- Moves with profitable positions
- Locks in profits while allowing for further gains
- Can be percentage-based or technical

## Take Profit Strategies

### 1. Fixed Risk-Reward Ratio
- Set profit target based on risk amount
- Common ratios: 1:2, 1:3, 1:4
- Example: Risk $100, target $200 profit

### 2. Partial Profit Taking
- Take 25% at 1:1 ratio
- Take 50% at 1:2 ratio
- Let 25% run with trailing stop

### 3. Technical Profit Targets
- Based on resistance levels
- Fibonacci retracements
- Chart patterns

## Diversification

### 1. Asset Diversification
- Don't put all capital in one cryptocurrency
- Spread across different sectors
- Consider correlation between assets

### 2. Strategy Diversification
- Use different trading strategies
- Combine trend following with mean reversion
- Mix timeframes and approaches

### 3. Time Diversification
- Don't enter all positions at once
- Scale into positions over time
- Use dollar-cost averaging

## Leverage Management

### Progressive Leverage System
- Start with 2x-3x leverage
- Increase gradually with experience
- Reduce leverage during volatile periods

### Leverage Ladder:
1. **Beginner**: 2x-3x leverage
2. **Intermediate**: 3x-5x leverage
3. **Advanced**: 5x-10x leverage
4. **Expert**: 10x+ leverage (with extreme caution)

### Dynamic Leverage Adjustment
- Reduce leverage in volatile markets
- Increase leverage in stable trends
- Monitor VIX or similar volatility indicators

## Emotional Risk Management

### 1. Trading Rules
- Write down your rules before trading
- Follow them religiously
- Review and adjust periodically

### 2. Position Limits
- Maximum number of open positions
- Maximum exposure per asset
- Maximum daily loss limits

### 3. Cooling-Off Periods
- Take breaks after large losses
- Don't trade when emotional
- Use paper trading to regain confidence

### 4. Journaling
- Record all trades with reasons
- Note emotional state during trades
- Identify patterns and mistakes

## Advanced Risk Management

### 1. Hedging Strategies
- Use opposite positions to reduce risk
- Correlation hedging
- Cross-asset hedging

### 2. Options Strategies (Where Available)
- Protective puts for long positions
- Covered calls for income
- Collars for risk management

### 3. Portfolio Heat
- Monitor total portfolio risk
- Limit correlated positions
- Use heat maps for visualization

## Risk Metrics and Monitoring

### 1. Maximum Drawdown
- Largest peak-to-trough decline
- Target: Keep under 10-20%
- Monitor continuously

### 2. Sharpe Ratio
\`\`\`
Sharpe Ratio = (Return - Risk-free Rate) ÷ Standard Deviation
\`\`\`
- Higher is better
- Measures risk-adjusted returns

### 3. Win Rate vs Average Win/Loss
- Win rate alone doesn't matter
- Focus on profit factor
- Aim for positive expectancy

### 4. Risk-Reward Ratio
- Average winning trade ÷ Average losing trade
- Should be > 1.0 for profitability
- Higher ratios allow for lower win rates

## Market Condition Adjustments

### 1. Bull Market Risk Management
- Reduce position sizes (easier to get overconfident)
- Take profits more frequently
- Watch for distribution patterns

### 2. Bear Market Risk Management
- Increase cash position
- Shorter holding periods
- More conservative position sizing

### 3. Sideways Market Risk Management
- Reduce leverage significantly
- Focus on range-bound strategies
- Be more selective with entries

## Technology and Tools

### 1. Risk Management Software
- Position sizing calculators
- Portfolio monitoring tools
- Automated alerts and stops

### 2. Trading Platforms
- Multiple order types
- Risk management features
- Real-time monitoring

### 3. Mobile Apps
- Monitor positions anywhere
- Receive alerts immediately
- Execute emergency trades

## Common Risk Management Mistakes

### 1. Moving Stop Losses
- Moving stops against you
- "It will come back" mentality
- Destroys risk management plan

### 2. Risking Too Much
- Violating position sizing rules
- Emotional trading decisions
- Trying to "get even" quickly

### 3. Ignoring Correlation
- Multiple correlated positions
- Concentration risk
- False diversification

### 4. No Plan B
- Not planning for worst-case scenarios
- No exit strategy
- Hoping instead of managing

## Risk Management Checklist

### Before Each Trade:
- [ ] Position size calculated
- [ ] Stop loss level determined
- [ ] Take profit targets set
- [ ] Risk-reward ratio acceptable
- [ ] Total portfolio risk checked
- [ ] Emotional state assessed

### During the Trade:
- [ ] Monitor margin levels
- [ ] Watch for news events
- [ ] Stick to original plan
- [ ] Adjust stops if needed (only in your favor)

### After the Trade:
- [ ] Record results and lessons
- [ ] Update risk metrics
- [ ] Review what worked/didn't work
- [ ] Plan improvements

## Building Your Risk Management System

### 1. Start Simple
- Begin with basic rules
- Focus on position sizing and stops
- Add complexity gradually

### 2. Backtest Your Rules
- Test on historical data
- Verify effectiveness
- Adjust based on results

### 3. Forward Test
- Use small amounts initially
- Monitor performance closely
- Scale up gradually

### 4. Continuous Improvement
- Regular rule review
- Adapt to changing markets
- Learn from mistakes

## Conclusion

Effective risk management is:
- **Non-negotiable**: Must be followed consistently
- **Personal**: Tailored to your risk tolerance
- **Dynamic**: Adjusted for market conditions
- **Measurable**: Tracked with metrics
- **Disciplined**: Followed regardless of emotions

Remember: **You can't control the market, but you can control your risk.** The goal is not to avoid all losses, but to manage them effectively while maximizing your edge in the market.

The most successful traders are not those who never lose, but those who lose small and win big. Risk management is what makes this possible.
        `
      }
    ]
  }
];

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState("hyperliquid");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = educationCategories.find(cat => cat.id === selectedCategory);
  const filteredArticles = currentCategory?.articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-6 flex items-center"
          >
            <ArrowRight className="w-4 h-4 mr-2 transform rotate-180" />
            Back to Articles
          </Button>
          
          <article className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="outline">{selectedArticle.difficulty}</Badge>
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{selectedArticle.readTime}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedArticle.title}
              </h1>
              <p className="text-lg text-gray-600">
                {selectedArticle.description}
              </p>
            </div>
            
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Trading Education
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Master the fundamentals of Hyperliquid, perpetual futures, and leverage trading with our comprehensive guides.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {educationCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'border-liquid-green text-liquid-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {category.icon}
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentCategory?.title}
            </h2>
            <p className="text-gray-600">
              {currentCategory?.description}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleArticleClick(article)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={currentCategory?.color}>
                      {article.difficulty}
                    </Badge>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{article.readTime}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {article.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-liquid-green">
                    <span className="text-sm font-medium">Read Article</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Apply your knowledge and start building your trading platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <button 
                className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#00D084', 
                  border: '2px solid #00D084' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00D084';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#00D084';
                }}
              >
                Start Building
              </button>
            </Link>
            <Link href="/templates">
              <button 
                className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  border: '2px solid white' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#00D084';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
              >
                View Templates
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}