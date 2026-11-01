# Haramaya Delivery: Frontend

Responsive storefront and admin dashboard for a campus delivery platform in Ethiopia.

**Live:** https://hu-delivery.vercel.app
**Backend:** [haramaya-delivery-backend](https://github.com/yaredkumera/haramaya-delivery-backend)

## Screenshots

| Products | Checkout |
| --- | --- |
| ![Products](docs/screenshots/products.png) | ![Checkout](docs/screenshots/checkout.png) |

| Admin orders | Pickup |
| --- | --- |
| ![Admin orders](docs/screenshots/admin-orders.png) | ![Pickup](docs/screenshots/pickup.png) |

## Features

- Product browsing with search, categories and pagination
- Cart, and checkout with four payment options (Telebirr to Telebirr, Telebirr to CBE, CBE to CBE, cash on pickup) with the correct transaction ID rules for each
- Order tracking with automatic status refresh and a downloadable receipt with a QR code
- Admin: product management, payment review, order handling, and QR-based pickup
- Fully responsive, with light and dark themes

## Tech stack

React · TypeScript · Vite · Redux Toolkit (RTK Query) · React Router · Tailwind CSS · react-hot-toast · lucide-react

## Getting started

```bash
git clone https://github.com/yaredkumera/haramaya-delivery-frontend.git
cd haramaya-delivery-frontend
npm install
cp .env.example .env     # point it at your backend
npm run dev
```

The app needs the [backend API](https://github.com/yaredkumera/haramaya-delivery-backend) running.

## Author

**Yared Kumera**: [GitHub](https://github.com/yaredkumera)
