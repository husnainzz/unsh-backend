# AIreco Backend API

A comprehensive backend API for a clothing e-commerce application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for clothing products with search and filtering
- **Order Management**: Complete order lifecycle with status tracking
- **Admin Portal**: Admin-only routes for product and order management
- **User Portal**: User profile management and order history

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Built-in Mongoose validation

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   APP_PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/aireco?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

3. **MongoDB Atlas Setup**

   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Replace the MONGODB_URI in .env

4. **Run the Server**

   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### User Management

- `GET /api/users/profile` - Get user profile (Auth required)
- `PUT /api/users/profile` - Update user profile (Auth required)
- `GET /api/users/orders` - Get user orders (Auth required)

### Products

- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get product by ID (Public)
- `GET /api/products/categories` - Get product categories (Public)
- `GET /api/products/brands` - Get product brands (Public)
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders

- `POST /api/orders` - Create new order (Auth required)
- `GET /api/orders/:id` - Get order by ID (Auth required)
- `PUT /api/orders/:id/cancel` - Cancel order (Auth required)
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Data Models

### User

- Basic info (name, email, password)
- Role-based access (user/admin)
- Address and contact information
- Password hashing with bcrypt

### Product

- Product details (name, description, price)
- Clothing-specific fields (size, color, category, brand)
- Inventory management (stock)
- Image URLs and tags
- Rating system

### Order

- Order items with product references
- Status tracking (pending → confirmed → processing → shipped → delivered)
- Payment and shipping information
- Automatic stock management

## Authentication

- JWT tokens with 7-day expiration
- Protected routes require `Authorization: Bearer <token>` header
- Admin routes require admin role verification

## Error Handling

- Comprehensive error messages
- HTTP status codes
- Validation errors
- Authentication errors

## Development

- Hot reload with nodemon
- Environment-based configuration
- CORS enabled for frontend integration
- Structured logging

## Next Steps

1. **Frontend Development**: React/Vue.js frontend application
2. **Payment Integration**: Stripe/PayPal payment processing
3. **Image Upload**: Cloud storage for product images
4. **Email Notifications**: Order status updates
5. **Analytics**: Sales and user behavior tracking
