


# Rapyd TypeScript SDK

A modern, fully-typed TypeScript SDK for the Rapyd payment platform API (unofficial).

![npm](https://img.shields.io/npm/v/rapyd-typescript-sdk)
![License](https://img.shields.io/npm/l/rapyd-typescript-sdk)
![TypeScript](https://img.shields.io/badge/TypeScript-4.5%2B-blue)

## Features

✨ What makes this SDK special:

- Full TypeScript support
- Built-in request signing
- Promise-based API
- Comprehensive documentation
- Built-in error handling
- Complete test coverage

## Installation

```bash
npm install rapyd-typescript-sdk
```

## Quick Start

```typescript
import { RapydClient } from 'rapyd-typescript-sdk';

const client = new RapydClient(
    'your_access_key',
    'your_secret_key'
);

// Create a payment
const payment = await client.createPayment({
    amount: 100,
    currency: 'USD',
    payment_method: 'us_debit_card'
});
```

## Core Features

### Payments

```typescript
// List payment methods
const methods = await client.listPaymentMethods('US', 'USD');

// Create payment
const payment = await client.createPayment({
    amount: 100,
    currency: 'USD',
    payment_method: 'us_debit_card'
});
```

### Wallets

```typescript
// Create wallet
const wallet = await client.createWallet({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    ewallet_reference_id: 'john-doe-001'
});

// Get balance
const balance = await client.getWalletBalance('wallet_id');
```

### Payouts

```typescript
const payout = await client.createPayout({
    beneficiary: 'beneficiary_id',
    payout_method_type: 'us_bank_transfer',
    amount: 100,
    currency: 'USD'
});
```

### Virtual Accounts

```typescript
const account = await client.createVirtualAccount({
    country: 'US',
    currency: 'USD',
    description: 'Business Account'
});
```

## Error Handling

```typescript
try {
    const payment = await client.createPayment({
        amount: 100,
        currency: 'USD',
        payment_method: 'us_debit_card'
    });
} catch (error) {
    console.error('Payment failed:', error.message);
}
```

## Contributing

1. Fork the repository
2. Create your branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/rapyd-typescript-sdk/issues)
- Email: your.email@example.com
- Documentation: [Wiki](https://github.com/yourusername/rapyd-typescript-sdk/wiki)

## License

MIT © [Your Name]

---
Built with ❤️ by [Your Name]