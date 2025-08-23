# UNCH Fashion Backend API Documentation

## Base URL

`http://localhost:5001/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **admin**: Full access to all endpoints
- **coordinator**: Can manage orders and some product operations
- **worker**: Can view orders and products
- **customer**: Can place orders and view their own data

---

## User Routes

### Public Routes

- `POST /users/register` - Register a new user (requires name, email, password, phoneNumber)
- `POST /users/login` - Login user (requires email, password)

### Protected Routes (requires auth)

- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update current user profile
- `GET /users/orders` - Get current user's orders

### Admin Only Routes

- `GET /users/all` - Get all users
- `PUT /users/:id/role` - Update user role
- `PATCH /users/:id/toggle-status` - Toggle user active status

---

## Product Routes

### Public Routes

- `GET /products` - Get all active products (with pagination, filtering, search)
- `GET /products/categories` - Get product categories
- `GET /products/prod/:prodId` - Get product by prodId
- `GET /products/:prodId` - Get product by prodId (alias)

### Admin Only Routes

- `GET /products/all` - Get all products (including inactive)
- `POST /products` - Create new product
- `PUT /products/:prodId` - Update product by prodId
- `DELETE /products/:prodId` - Delete product by prodId
- `PATCH /products/:prodId/toggle-status` - Toggle product active status

---

## Order Routes

### Public Routes (No Authentication Required)

- `GET /orders/track/:trackingId` - Track order by tracking ID
- `POST /orders/guest` - Create guest order (no login required)

### Protected Routes (requires auth)

- `POST /orders` - Create new order (authenticated user)
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/cancel` - Cancel order
- `GET /orders/user/orders` - Get current user's orders

### Coordinator/Admin Routes

- `PUT /orders/:id/status` - Update order status

### Admin Only Routes

- `GET /orders` - Get all orders (with pagination and filtering)
- `PUT /orders/:id/payment` - Update payment status

---

## New Features

### 🆕 Guest Orders

- **No registration required** - Guests can place orders directly
- **Required fields**: name, email, phoneNumber, items, shippingAddress, paymentDetails
- **Auto-generated tracking ID** for order tracking
- **Same product validation** and stock management as authenticated orders
- **Screenshot included** during order creation (not as separate upload)

### 📸 Screenshot Handling

- **Screenshots uploaded during order creation** (not as separate endpoint)
- **Stored in paymentDetails.screenshot** field
- **Available for both guest and authenticated orders**
- **Admin can view and verify** payment screenshots

### 🔍 Enhanced Order Management

- **Order type distinction**: "guest" vs "authenticated"
- **Simple tracking by tracking ID only** (no email lookup)
- **Better admin filtering** by order type
- **Improved order history** for both user types

---

## Request/Response Examples

### Create Guest Order (No Login Required)

```json
POST /api/orders/guest
{
  "guestInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890"
  },
  "items": [
    {
      "prodId": "PRO-1234567890-1234",
      "quantity": 2,
      "size": "M",
      "color": "White",
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentDetails": {
    "method": "bank",
    "screenshot": "https://example.com/payment-proof.jpg"
  }
}
```

### Create Authenticated User Order

```json
POST /api/orders
{
  "items": [
    {
      "prodId": "PRO-1234567890-1234",
      "quantity": 2,
      "size": "M",
      "color": "White",
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentDetails": {
    "method": "card",
    "screenshot": "https://example.com/payment-proof.jpg"
  }
}
```

### Track Order (Public)

```bash
GET /api/orders/track/ORD-1234567890-1234
```

### Register User (Enhanced Validation)

```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

---

## Schema Changes Summary

### Product Schema

- ✅ Added `prodId` field (auto-generated: PRO-<timestamp>-<random4digits>)
- ✅ Removed `tags` and `brand` fields
- ✅ Updated category enum to ["male", "female", "kids"]
- ✅ Simplified colors to array of strings
- ✅ Updated images structure with `url` and `featured` fields
- ✅ Updated rating to simple number (0-5)

### Order Schema

- ✅ Added `trackingId` field (auto-generated: ORD-<timestamp>-<random4digits>)
- ✅ Changed product references from ObjectId to `prodId` string
- ✅ Added `paymentDetails` object with method, status, and screenshot
- ✅ Updated status enum to ["pending", "processing", "shipped", "delivered", "cancelled"]
- 🆕 Added `guestInfo` object for guest orders
- 🆕 Made `user` field optional for guest orders
- 🆕 Added `orderType` field ("guest" vs "authenticated")
- 🆕 Simplified screenshot handling (uploaded during order creation)

### User Schema

- ✅ Added new roles: ["admin", "coordinator", "worker", "customer"]
- ✅ Changed `phone` to `phoneNumber` (required)
- ✅ Maintained bcrypt password hashing and comparison methods
- 🆕 Enhanced email validation with regex pattern
- 🆕 Enhanced phone number validation with regex pattern

---

## Important Notes

1. **Product IDs**: All product operations now use `prodId` instead of MongoDB ObjectId
2. **Order Tracking**: Orders can be tracked publicly using the `trackingId`
3. **Role-Based Access**: Different user roles have different levels of access
4. **Auto-generation**: `prodId` and `trackingId` are automatically generated
5. **Payment Handling**: Payment status can be updated separately from order status
6. **Stock Management**: Product stock is automatically updated when orders are created/cancelled
7. **Guest Orders**: No registration required, but email and phone are mandatory
8. **Screenshot Uploads**: Screenshots are included during order creation
9. **Enhanced Validation**: Email and phone number formats are validated
10. **Order Types**: Clear distinction between guest and authenticated orders
11. **Simple Tracking**: Only tracking by tracking ID (no email lookup)

---

## Guest Order Flow

```
1. Guest visits website
2. Adds products to cart
3. Fills guest information (name, email, phone)
4. Provides shipping address
5. Chooses payment method
6. Uploads payment screenshot (if needed)
7. Places order → Gets tracking ID
8. Can track order using tracking ID only
9. Option to create account later (future enhancement)
```

---

## Security Features

- **Rate limiting** for guest orders (future enhancement)
- **Email verification** for guest orders (future enhancement)
- **Fraud prevention** measures (future enhancement)
- **Order ownership validation** for authenticated users
- **Admin-only access** to sensitive operations
- **Input validation** for all user inputs
- **Secure password hashing** with bcrypt
- **Simple tracking system** reduces security risks
