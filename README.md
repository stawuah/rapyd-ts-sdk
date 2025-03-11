


# Rapyd TypeScript SDK

A modern, fully-typed TypeScript SDK for the Rapyd payment platform API (unofficial).

![TypeScript](https://img.shields.io/badge/TypeScript-4.5%2B-blue)

## Features

✨ What makes this SDK special: 

🚀 Lightweight & Efficient – Optimized for performance with minimal dependencies.  
📌 TypeScript-Powered – Enjoy strong typing, autocompletion, and better developer experience.  
💳 Seamless Rapyd Integration – Easily interact with Rapyd’s fintech APIs for payments, wallets, and more.  
🔒 Built-in Request Signing – Secure HMAC authentication is handled automatically.  
💡 Developer-Friendly – Clean, well-structured code with intuitive service methods.  
🛠️ Extensible – Designed for easy customization and future enhancements.  
📄 Detailed request and response typing


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

//you could pick this option or choose the snippet below on how to create payment

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

// CREATE PAYMENT
// you could use the sdk custom types in your project 
import { RapydClient, PaymentService, CreatePaymentRequest } from 'rapyd-payments-sdk';

// Initialize the client
const rapydClient = new RapydClient({
  accessKey: 'your-access-key',
  secretKey: 'your-secret-key',
  baseURL: 'https://sandboxapi.rapyd.net' // or production URL
});

const paymentService = new PaymentService(rapydClient); // just call the method based of the rapydClient class

// Create a payment
async function makePayment() {
  try {
    const paymentRequest: CreatePaymentRequest = {
      amount: 101,
      currency: 'USD',
      description: 'Payment method token',
      payment_method: 'other_7f991f72a4c14c5cd79627ebc21241de',
      ewallets: [{
        ewallet: 'ewallet_1290eef66d0b84ece177a3f5bd8fb0c8',
        percentage: 100
      }],
      metadata: {
        merchant_defined: true
      }
    };

    const paymentResponse = await paymentService.createPayment(paymentRequest);
    console.log('Payment created:', paymentResponse.data.id);
    return paymentResponse;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// UPDATE PAYMENT 

// Update a payment using the client (which delegates to PaymentService)
const paymentId = 'payment_36724a4ea01b438fd24ac3ab00b29150';

// Method 1: Update general payment information
await rapydClient.updatePayment(paymentId, {
  receipt_email: 'customer@example.com',
  description: 'Updated payment description'
});

// Method 2: Update just the address
const address = {
  name: 'John Doe',
  line_1: '123 Main St',
  city: 'Anytown',
  country: 'US'
};
await rapydClient.updatePaymentAddress(paymentId, address);

// Method 3: Update just metadata
const metadata = {
  order_id: '12345',
  customer_type: 'premium'
};
await rapydClient.updatePaymentMetadata(paymentId, metadata);

// Method 4: Cancel escrow
await rapydClient.cancelEscrow(paymentId);

// CAPTURE PAYMENT IN FULL OR PARTIALY

// Capture full payment
rapydClient.captureFullPayment('payment_19e3edad1e9102cd24006a34c52c9a0b')
  .then(response => console.log(response))
  .catch(error => console.error(error));

// Capture partial payment
rapydClient.capturePayment('payment_19e3edad1e9102cd24006a34c52c9a0b', { 
  amount: 50.00,
  receipt_email: 'customer@example.com',
  statement_descriptor: 'Your Store Name'
})
  .then(response => console.log(response))
  .catch(error => console.error(error));

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