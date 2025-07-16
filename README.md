# POS CMS - Point of Sale Content Management System

A modern, full-featured Point of Sale (POS) Content Management System built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: Overview of sales, revenue, and recent activity
- **Point of Sale**: Interactive POS interface for processing transactions
- **Product Management**: Add, edit, and manage inventory
- **Order Management**: View and manage customer orders
- **Customer Management**: Customer database and information
- **Real-time Database**: Powered by Supabase for real-time data synchronization
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pos-cms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
pos-cms/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── pos/               # Point of Sale interface
│   │   ├── products/          # Product management
│   │   ├── orders/            # Order management
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── Navbar.tsx         # Navigation sidebar
│   ├── lib/                   # Utilities and configurations
│   │   └── supabase.ts        # Supabase client setup
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Main type definitions
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json
```

## Database Schema

The application expects the following Supabase tables:

### Products
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, optional)
- `price` (numeric)
- `category` (text)
- `stock_quantity` (integer)
- `sku` (text, unique)
- `image_url` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Categories
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, optional)
- `created_at` (timestamp)

### Customers
- `id` (uuid, primary key)
- `name` (text)
- `email` (text, optional)
- `phone` (text, optional)
- `address` (text, optional)
- `created_at` (timestamp)

### Orders
- `id` (uuid, primary key)
- `customer_id` (uuid, foreign key, optional)
- `total_amount` (numeric)
- `tax_amount` (numeric)
- `discount_amount` (numeric)
- `status` (text: 'pending', 'completed', 'cancelled')
- `payment_method` (text: 'cash', 'card', 'digital')
- `created_at` (timestamp)

### Order Items
- `id` (uuid, primary key)
- `order_id` (uuid, foreign key)
- `product_id` (uuid, foreign key)
- `quantity` (integer)
- `price` (numeric)

## Features Overview

### Dashboard
- Sales statistics and KPIs
- Recent activity feed
- Quick action buttons
- Revenue and performance charts

### Point of Sale
- Product grid with category filtering
- Real-time cart management
- Tax calculation
- Multiple payment methods (cash, card)
- Receipt generation

### Product Management
- Add, edit, and delete products
- Inventory tracking
- Stock level indicators
- Category-based organization
- Search and filtering

### Order Management
- Order history and details
- Status management
- Customer information
- Order item breakdown
- Revenue tracking

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling

## Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js and Supabase
