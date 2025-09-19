# Marketplace API Documentation

## Base URL
```
http://localhost:3000/api
```
Production: `https://your-backend-url.vercel.app/api` (configured via `VITE_API_BASE_URL`)

## Authentication
Most endpoints require authentication via JWT Bearer token:
```
Authorization: Bearer <your-token>
```

Tokens are stored in localStorage as `token` after login.

---

## Products

### Get All Products
**GET** `/products`

#### Query Parameters
| Parameter | Type   | Description              | Default |
|-----------|--------|--------------------------|---------|
| page      | number | Page number              | 1       |
| limit     | number | Number of items per page | 10      |
| category  | string | Filter by category       | -       |

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "products": [
      {
        "_id": "string",
        "userID": {
          "_id": "string",
          "username": "string",
          "photo": "string"
        },
        "title": "string",
        "description": "string",
        "price": 0,
        "category": "string",
        "images": ["string"],
        "videoUrl": ["string"],
        "benefit1": "string",
        "benefit2": "string",
        "benefit3": "string",
        "rating": 0,
        "totalReviews": 0,
        "isActive": true,
        "hasSourceCode": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "pages": 1
    }
  },
  "message": "string",
  "success": true
}
```

### Get Product by ID
**GET** `/products/:id`

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "_id": "string",
    "userID": {
      "_id": "string",
      "username": "string",
      "photo": "string"
    },
    "title": "string",
    "description": "string",
    "price": 0,
    "category": "string",
    "images": ["string"],
    "videoUrl": ["string"],
    "benefit1": "string",
    "benefit2": "string",
    "benefit3": "string",
    "rating": 0,
    "totalReviews": 0,
    "isActive": true,
    "hasSourceCode": true,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "string",
  "success": true
}
```

---

## Cart

### Get Cart Items
**GET** `/cart`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "cartItems": [
      {
        "_id": "string",
        "userID": "string",
        "productID": {
          "_id": "string",
          "title": "string",
          "price": 0,
          "images": ["string"]
        },
        "quantity": 0,
        "addedAt": "string",
        "updatedAt": "string",
        "totalPrice": 0
      }
    ],
    "summary": {
      "totalItems": 0,
      "totalQuantity": 0,
      "totalPrice": 0
    }
  },
  "message": "string"
}
```

### Add to Cart
**POST** `/cart`

#### Request Body
```json
{
  "productID": "string",
  "quantity": 1
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "userID": "string",
    "productID": {
      "_id": "string",
      "title": "string",
      "price": 0,
      "images": ["string"]
    },
    "quantity": 0,
    "addedAt": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

### Update Cart Item
**PUT** `/cart/:productID`

#### Request Body
```json
{
  "quantity": 1
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "userID": "string",
    "productID": {
      "_id": "string",
      "title": "string",
      "price": 0,
      "images": ["string"]
    },
    "quantity": 0,
    "addedAt": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

### Remove Cart Item
**DELETE** `/cart/:productID`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "string"
}
```

### Clear Cart
**DELETE** `/cart`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "string"
}
```

### Get Cart Count
**GET** `/cart/count`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalItems": 0,
    "totalQuantity": 0
  },
  "message": "string"
}
```

---

## Orders

### Create Order from Cart
**POST** `/orders/from-cart`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "orderNumber": "string",
    "status": "pending",
    "customerEmail": "string",
    "customerName": "string",
    "items": [
      {
        "productId": "string",
        "name": "string",
        "unitPrice": 0,
        "quantity": 0,
        "downloadUrl": "string",
        "image": "string",
        "category": "string"
      }
    ],
    "totalAmount": 0,
    "createdAt": "string",
    "paymentMethod": "string",
    "isGuestOrder": false
  },
  "message": "string"
}
```

### Get User Orders
**GET** `/orders`

#### Query Parameters
| Parameter | Type   | Description                    | Default |
|-----------|--------|--------------------------------|---------|
| page      | number | Page number                    | 1       |
| limit     | number | Number of items per page       | 10      |
| status    | string | Filter by order status         | -       |

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "orders": [
      {
        "_id": "string",
        "orderNumber": "string",
        "status": "pending",
        "customerEmail": "string",
        "customerName": "string",
        "items": [
          {
            "productId": "string",
            "name": "string",
            "unitPrice": 0,
            "quantity": 0,
            "downloadUrl": "string",
            "image": "string",
            "category": "string"
          }
        ],
        "totalAmount": 0,
        "createdAt": "string",
        "paymentMethod": "string",
        "isGuestOrder": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalOrders": 0,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "string",
  "success": true
}
```

### Get Order by ID
**GET** `/orders/:orderId`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "orderNumber": "string",
    "status": "pending",
    "customerEmail": "string",
    "customerName": "string",
    "items": [
      {
        "productId": "string",
        "name": "string",
        "unitPrice": 0,
        "quantity": 0,
        "downloadUrl": "string",
        "image": "string",
        "category": "string"
      }
    ],
    "totalAmount": 0,
    "createdAt": "string",
    "paymentMethod": "string",
    "isGuestOrder": false
  },
  "message": "string"
}
```

### Create Instant Order
**POST** `/orders/instant`

#### Request Body
```json
{
  "productId": "string",
  "quantity": 1,
  "email": "string"
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "orderNumber": "string",
    "status": "pending",
    "customerEmail": "string",
    "customerName": "string",
    "items": [
      {
        "productId": "string",
        "name": "string",
        "unitPrice": 0,
        "quantity": 0,
        "downloadUrl": "string",
        "image": "string",
        "category": "string"
      }
    ],
    "totalAmount": 0,
    "createdAt": "string",
    "paymentMethod": "string",
    "isGuestOrder": true
  },
  "message": "string"
}
```

---

## Payments

### Create Payment
**POST** `/payments`

#### Request Body
```json
{
  "orderID": "string",
  "paymentMethod": "midtrans"
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

### Get User Payments
**GET** `/payments`

#### Query Parameters
| Parameter | Type   | Description              | Default |
|-----------|--------|--------------------------|---------|
| page      | number | Page number              | 1       |
| limit     | number | Number of items per page | 10      |

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

### Get Payment by ID
**GET** `/payments/:paymentId`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

### Get Instant Payment
**GET** `/payments/instant/:paymentId`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

### Check Payment Status
**GET** `/payments/:paymentId/status`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

### Create Instant Payment
**POST** `/payments/instant`

#### Request Body
```json
{
  "orderId": "string",
  "email": "string"
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "string"
}
```

---

## User Authentication & Profile

### Get Current User
**GET** `/auth/me`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "photo": "string",
    "name": "string",
    "phone": "string",
    "address": "string",
    "bio": "string"
  },
  "message": "string"
}
```

### Update Profile
**PUT** `/auth/profile`

#### Request Body
```json
{
  "name": "string",
  "phone": "string",
  "address": "string",
  "bio": "string"
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "photo": "string",
    "name": "string",
    "phone": "string",
    "address": "string",
    "bio": "string"
  },
  "message": "string"
}
```

### Upload Profile Image
**POST** `/auth/profile/image`

#### Request Body (FormData)
```
photo: File
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "photo": "string",
    "name": "string",
    "phone": "string",
    "address": "string",
    "bio": "string"
  },
  "message": "string"
}
```

### Change Password
**PUT** `/auth/change-password`

#### Request Body
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "string"
}
```

### Update Profile Complete (with optional image)
**PUT** `/auth/profile/complete`

#### Request Body (FormData)
```
name: string
phone: string
address: string
bio: string
photo: File (optional)
```

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "photo": "string",
    "name": "string",
    "phone": "string",
    "address": "string",
    "bio": "string"
  },
  "message": "string"
}
```

---

## Favorites

### Toggle Favorite Product
**POST** `/favorites/toggle/:productId`

#### Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "string"
}
```

---

## Reviews

### Check if User Has Reviewed Product
**GET** `/reviews/has-reviewed/:productId`

#### Response
```json
{
  "hasReviewed": true,
  "review": {
    "id": "string",
    "rating": 5,
    "comment": "string",
    "user_id": "string",
    "product_id": "string",
    "order_id": "string",
    "is_verified_purchase": true,
    "helpful_count": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Check if User Can Review Product
**GET** `/reviews/can-review/:productId/:orderId`

#### Response
```json
{
  "success": true,
  "canReview": true,
  "reason": "string",
  "existingReview": {
    "id": "string",
    "rating": 5,
    "comment": "string",
    "user_id": "string",
    "product_id": "string",
    "order_id": "string",
    "is_verified_purchase": true,
    "helpful_count": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Create Review
**POST** `/reviews`

#### Request Body
```json
{
  "rating": 5,
  "comment": "string",
  "product_id": "string",
  "order_id": "string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "rating": 5,
    "comment": "string",
    "user_id": "string",
    "product_id": "string",
    "order_id": "string",
    "is_verified_purchase": true,
    "helpful_count": 0,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

### Get Reviews by Product
**GET** `/reviews/product/:productId`

#### Query Parameters
| Parameter | Type   | Description                          | Default  |
|-----------|--------|--------------------------------------|----------|
| page      | number | Page number                          | 1        |
| limit     | number | Number of items per page             | 10       |
| sort      | string | Sorting option                       | newest   |

Sorting options:
- `newest`
- `oldest`
- `highest_rating`
- `lowest_rating`
- `most_helpful`

#### Response
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "rating": 5,
        "comment": "string",
        "user_id": "string",
        "product_id": "string",
        "order_id": "string",
        "is_verified_purchase": true,
        "helpful_count": 0,
        "createdAt": "string",
        "updatedAt": "string",
        "user": {
          "name": "string",
          "username": "string"
        },
        "product": {
          "name": "string",
          "price": 0,
          "image": "string"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 0,
      "limit": 10
    },
    "statistics": {
      "averageRating": 0,
      "totalReviews": 0,
      "rating5": 0,
      "rating4": 0,
      "rating3": 0,
      "rating2": 0,
      "rating1": 0
    }
  }
}
```

### Get User Reviews
**GET** `/reviews/user`

#### Query Parameters
| Parameter | Type   | Description                          | Default  |
|-----------|--------|--------------------------------------|----------|
| page      | number | Page number                          | 1        |
| limit     | number | Number of items per page             | 10       |

#### Response
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "rating": 5,
        "comment": "string",
        "user_id": "string",
        "product_id": "string",
        "order_id": "string",
        "is_verified_purchase": true,
        "helpful_count": 0,
        "createdAt": "string",
        "updatedAt": "string",
        "user": {
          "name": "string",
          "username": "string"
        },
        "product": {
          "name": "string",
          "price": 0,
          "image": "string"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 0,
      "limit": 10
    }
  }
}
```

### Update Review
**PUT** `/reviews/:reviewId`

#### Request Body
```json
{
  "rating": 5,
  "comment": "string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "rating": 5,
    "comment": "string",
    "user_id": "string",
    "product_id": "string",
    "order_id": "string",
    "is_verified_purchase": true,
    "helpful_count": 0,
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

### Delete Review
**DELETE** `/reviews/:reviewId`

#### Response
```json
{
  "success": true,
  "message": "string"
}
```

### Mark Review as Helpful
**POST** `/reviews/:reviewId/helpful`

#### Response
```json
{
  "success": true,
  "message": "string"
}
```

### Get All Reviews
**GET** `/reviews`

#### Query Parameters
| Parameter | Type   | Description                          | Default  |
|-----------|--------|--------------------------------------|----------|
| page      | number | Page number                          | 1        |
| limit     | number | Number of items per page             | 10       |
| sort      | string | Sorting option                       | newest   |

Sorting options:
- `newest`
- `oldest`
- `highest_rating`
- `lowest_rating`

#### Response
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "rating": 5,
        "comment": "string",
        "user_id": "string",
        "product_id": "string",
        "order_id": "string",
        "is_verified_purchase": true,
        "helpful_count": 0,
        "createdAt": "string",
        "updatedAt": "string",
        "user": {
          "name": "string",
          "username": "string"
        },
        "product": {
          "name": "string",
          "price": 0,
          "image": "string"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 0,
      "limit": 10
    }
  }
}
```