


# Rapyd TypeScript SDK

A modern, fully-typed TypeScript SDK for the Rapyd payment platform API (unofficial).

![TypeScript](https://img.shields.io/badge/TypeScript-4.5%2B-blue)

## Features

✨ What makes this SDK special:

Here’s your list with updated emojis:  

🚀 Lightweight & Efficient – Optimized for performance with minimal dependencies.  
📌 TypeScript-Powered – Enjoy strong typing, autocompletion, and better developer experience.  
💳 Seamless Rapyd Integration** – Easily interact with Rapyd’s fintech APIs for payments, wallets, and more.  
🔒 Built-in Request Signing – Secure HMAC authentication is handled automatically.  
💡 Developer-Friendly – Clean, well-structured code with intuitive service methods.  
🛠️ Extensible – Designed for easy customization and future enhancements.  
📄 Detailed request and response typing**  

Let me know if you'd like any tweaks! 🚀

## Installation

```bash
npm install rapyd-ts-sdk
```

## Quick Start

```typescript
import { RapydClient } from 'rapyd-typescript-sdk';

const client = new RapydClient(
    'your_access_key',
    'your_secret_key'
);


// Get payment method field requirements
const fieldRequirements = await client.PaymentMethodsService.getFieldRequirements('us_debit_card'), //  bank_tranfer = us_ach_bank , etc ;
console.log(fieldRequirements);

// Get payment methods by country
const paymentMethods = await client.PaymentMethodsService.getPaymentMethodsByCountry('US');
console.log(`Found ${paymentMethods.payment_methods.length} payment methods for ${paymentMethods.country}`);

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

- Issues: [GitHub Issues](https://github.com/stawuah/rapyd-ts-sdk/issues)
- Email: nobudev20@gmail.com
- Documentation: [Wiki](https://github.com/yourusername/rapyd-typescript-sdk/wiki)

## License

MIT © [LICENSE](https://github.com/stawuah/rapyd-ts-sdk/blob/main/LICENSE)

---
Built with ❤️ by Awuah, Hunt