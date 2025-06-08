# VIP Program Extension

A Fynd Platform extension for managing VIP programs, including product exclusivity, custom promotions, and user management.

## Project Structure

```
src/
├── config/             # Configuration files
│   ├── database.js     # Database configuration
│   └── fdk.js         # FDK extension configuration
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Data models
├── routes/            # Route handlers
│   ├── productRoutes.js
│   ├── salesChannelRoutes.js
│   ├── pixelbinRoutes.js
│   └── promotionRoutes.js
├── services/          # Business logic
│   ├── sessionService.js
│   └── shipmentService.js
├── utils/             # Utility functions
│   └── helpers.js
└── server.js          # Main application file
```

## Features

- VIP product management
- Custom promotions for VIP users
- User group management
- Campaign creation and management
- File upload to Pixelbin
- Automatic VIP status cleanup

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- SQLite3
- Fynd Platform account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
EXTENSION_API_KEY=your_extension_api_key
EXTENSION_API_SECRET=your_extension_api_secret
EXTENSION_BASE_URL=your_extension_base_url
FP_API_DOMAIN=your_fp_api_domain
PIXELBIN_API_SECRET=your_pixelbin_api_secret
MONGO_URI=your_mongodb_connection_string
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vip-program-extension
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/vip-products` - Get VIP products
- `POST /api/products/vip-products` - Save VIP products
- `GET /api/products/application/:application_id` - Get products for application

### Sales Channels
- `GET /api/sales` - Get all sales channels
- `POST /api/sales/configure-plans` - Configure plans for sales channels

### Pixelbin
- `POST /api/pixelbin/upload` - Upload file to Pixelbin

### Promotions
- `POST /api/promotion/create-campaign` - Create campaign

## Development

### Code Style
- Use ES6+ features
- Follow the existing code style
- Add JSDoc comments for functions
- Use meaningful variable and function names

### Testing
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
