require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5050;
const STRIP_SK_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(`${STRIP_SK_KEY}`);

app.use(express.static('public'));
app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  })
);

//post endpoint to open Stripe Checkout Session
app.post('/checkout', async (req, res) => {
  const items = req.body.items;
  let lineItems = [];
  items.forEach((item) => {
    lineItems.push({
      price: item.priceID,
      quantity: item.quantity,
    });
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 1500, currency: 'cad' },
          display_name: 'Regular Parcel',
          tax_behavior: 'exclusive',
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 2000, currency: 'cad' },
          display_name: 'XpressPost',
          tax_behavior: 'exclusive',
        },
      },
    ],
    automatic_tax: {
      enabled: true,
    },
    line_items: lineItems,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/shop',
  });

  res.send(
    JSON.stringify({
      url: session.url,
    })
  );
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});
