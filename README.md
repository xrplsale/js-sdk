# XRPL.Sale JavaScript/TypeScript SDK

Official JavaScript/TypeScript SDK for integrating with the XRPL.Sale platform - the native XRPL launchpad for token sales and project funding.

[![npm version](https://badge.fury.io/js/%40xrplsale%2Fsdk.svg)](https://www.npmjs.com/package/@xrplsale/sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Complete TypeScript Support** - Full type definitions and IntelliSense
- 🔐 **XRPL Wallet Authentication** - Seamless wallet integration
- 📊 **Project Management** - Create, launch, and manage token sales
- 💰 **Investment Tracking** - Monitor investments and analytics
- 🔔 **Webhook Support** - Real-time event notifications
- 📈 **Analytics & Reporting** - Comprehensive data insights
- 🛡️ **Error Handling** - Robust error management
- ⚡ **Auto-retry Logic** - Resilient API calls

## Installation

```bash
npm install @xrplsale/sdk
```

Or with yarn:

```bash
yarn add @xrplsale/sdk
```

## Quick Start

```typescript
import { XRPLSaleClient } from '@xrplsale/sdk';

// Initialize the client
const client = new XRPLSaleClient({
  apiKey: 'your-api-key',
  environment: 'production', // or 'testnet'
  debug: true // Enable debug logging
});

// Create a new project
const project = await client.projects.create({
  name: 'My DeFi Protocol',
  description: 'Revolutionary DeFi protocol on XRPL',
  tokenSymbol: 'MDP',
  totalSupply: '100000000',
  tiers: [
    {
      tier: 1,
      pricePerToken: '0.001',
      totalTokens: '20000000'
    }
  ],
  saleStartDate: new Date('2025-02-01'),
  saleEndDate: new Date('2025-03-01')
});

console.log('Project created:', project.id);
```

## Authentication

The SDK supports XRPL wallet-based authentication:

```typescript
// Generate authentication challenge
const challenge = await client.auth.generateChallenge('rYourWalletAddress...');

// Sign the challenge with your wallet
// (implementation depends on your wallet library)
const signature = signMessage(challenge.challenge);

// Authenticate
const authResult = await client.auth.authenticate({
  walletAddress: 'rYourWalletAddress...',
  signature: signature,
  timestamp: challenge.timestamp
});

console.log('Authentication successful:', authResult.token);
```

## Core Services

### Projects Service

```typescript
// List active projects
const projects = await client.projects.getActive({
  page: 1,
  limit: 10
});

// Get project details
const project = await client.projects.get('proj_abc123');

// Launch a project
await client.projects.launch('proj_abc123');

// Get project statistics
const stats = await client.projects.getStats('proj_abc123');
```

### Investments Service

```typescript
// Create an investment
const investment = await client.investments.create({
  projectId: 'proj_abc123',
  amountXRP: '100',
  investorAccount: 'rInvestorAddress...'
});

// List investments for a project
const investments = await client.investments.getByProject('proj_abc123');

// Get investor summary
const summary = await client.investments.getInvestorSummary('rInvestorAddress...');

// Simulate an investment
const simulation = await client.investments.simulate({
  projectId: 'proj_abc123',
  amountXRP: '100'
});
```

### Analytics Service

```typescript
// Get platform analytics
const analytics = await client.analytics.getPlatformAnalytics();

// Get project-specific analytics
const projectAnalytics = await client.analytics.getProjectAnalytics('proj_abc123');

// Get market trends
const trends = await client.analytics.getMarketTrends('30d');

// Export data
const exportData = await client.analytics.exportData({
  type: 'projects',
  format: 'csv',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

## Webhook Integration

### Express.js Middleware

```typescript
import express from 'express';

const app = express();

// Use raw body parser for webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Handle webhooks with automatic signature verification
app.post('/webhooks', client.webhooks.middleware(), (req, res) => {
  const event = req.webhookEvent;
  
  switch (event.type) {
    case 'investment.created':
      handleNewInvestment(event.data);
      break;
    case 'project.launched':
      handleProjectLaunched(event.data);
      break;
    case 'tier.completed':
      handleTierCompleted(event.data);
      break;
  }
  
  res.status(200).send('OK');
});

async function handleNewInvestment(data: any) {
  console.log('New investment:', data.amount, 'XRP');
  
  // Send confirmation email
  await sendConfirmationEmail(data.investor_account, data.amount);
}
```

### Manual Webhook Verification

```typescript
import { createHmac } from 'crypto';

app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-xrpl-sale-signature'];
  const payload = req.body;
  
  // Verify signature
  if (client.webhooks.verifySignature(payload, signature)) {
    const event = client.webhooks.parseWebhook(payload);
    // Process event...
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import { 
  XRPLSaleError, 
  ValidationError, 
  AuthenticationError,
  NotFoundError 
} from '@xrplsale/sdk';

try {
  const project = await client.projects.get('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Project not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed');
  } else if (error instanceof ValidationError) {
    console.log('Validation error:', error.details);
  } else if (error instanceof XRPLSaleError) {
    console.log('API error:', error.message, 'Status:', error.statusCode);
  }
}
```

## Utilities

The SDK includes helpful utility functions:

```typescript
import { XRPLUtils, FormatUtils, ValidationUtils } from '@xrplsale/sdk';

// XRPL utilities
const xrpAmount = XRPLUtils.dropsToXrp('1000000'); // '1'
const drops = XRPLUtils.xrpToDrops('1.5'); // '1500000'
const isValid = XRPLUtils.isValidAddress('rAddress...');

// Formatting
const formatted = FormatUtils.formatXRP('1.23456789', 4); // '1.2346'
const percentage = FormatUtils.formatPercentage(0.1534); // '15.34%'

// Validation
const validEmail = ValidationUtils.isValidEmail('user@example.com');
const validSymbol = ValidationUtils.isValidTokenSymbol('MYTOKEN');
```

## Configuration Options

```typescript
interface XRPLSaleConfig {
  apiKey: string;                    // Required: Your API key
  environment?: 'production' | 'testnet'; // Default: 'production'
  timeout?: number;                  // Request timeout in ms (default: 30000)
  debug?: boolean;                   // Enable debug logging (default: false)
  webhookSecret?: string;            // Secret for webhook verification
}
```

## Pagination

Most list methods support pagination:

```typescript
const result = await client.projects.list({
  page: 1,
  limit: 50,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

console.log('Projects:', result.data);
console.log('Pagination:', result.pagination);
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Watch for changes
npm run build:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## TypeScript Support

The SDK is written in TypeScript and includes comprehensive type definitions:

```typescript
import { Project, Investment, ProjectStatus } from '@xrplsale/sdk';

const project: Project = await client.projects.get('proj_123');
const status: ProjectStatus = project.status; // Type-safe!
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 [Documentation](https://xrpl.sale/docs)
- 💬 [Discord Community](https://discord.gg/xrpl-sale)
- 🐛 [Issue Tracker](https://github.com/xrplsale/js-sdk/issues)
- 📧 [Email Support](mailto:developers@xrpl.sale)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [XRPL.Sale Platform](https://xrpl.sale)
- [API Documentation](https://xrpl.sale/api-reference)
- [Other SDKs](https://xrpl.sale/documentation/developers/sdk-downloads)
- [GitHub Organization](https://github.com/xrplsale)

---

Made with ❤️ by the XRPL.Sale team