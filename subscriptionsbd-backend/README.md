# Subscriptions BD — Backend API v2.0

Express.js + MySQL (Aiven) + Sequelize + Firebase Auth + SSLCommerz

---

## 📁 Project Structure

```
subscriptionsbd-backend/
├── server.js                          ← Express entry point
├── .env                               ← Your environment variables
├── .gitignore
├── .sequelizerc                       ← Sequelize CLI paths
│
├── certs/
│   └── ca.pem                         ← Aiven SSL certificate (you place this here)
│
├── config/
│   └── database.js                    ← Aiven SSL connection config
│
├── firebase/
│   └── admin.js                       ← Firebase Admin SDK init + token verification
│
├── middleware/
│   └── auth.js                        ← Firebase token + JWT auth middleware
│
├── models/
│   ├── index.js                       ← Model loader + associations
│   ├── User.js                        ← Firebase UID + email/password users
│   ├── Category.js
│   ├── Product.js
│   ├── ProductPlan.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Payment.js
│   ├── Review.js
│   ├── Coupon.js
│   ├── BlogPost.js                    ← Full blog system
│   └── Wishlist.js
│
├── migrations/
│   └── 20240101000001-create-all-tables.js   ← All 11 tables
│
├── seeders/
│   └── 20240101000001-seed-all-data.js       ← Full seed data
│
├── controllers/
│   ├── authController.js              ← Firebase login, admin login, profile
│   ├── productController.js           ← Products + categories CRUD
│   ├── orderController.js             ← Order placement + management
│   ├── paymentController.js           ← SSLCommerz + manual payment verification
│   ├── blogController.js              ← Full blog CRUD + related posts
│   ├── reviewController.js            ← Reviews with admin approval
│   ├── couponController.js            ← Coupon validation + CRUD
│   └── adminController.js             ← Dashboard stats + user management
│
├── routes/
│   └── index.js                       ← All API routes
│
├── sslcommerz/
│   └── index.js                       ← SSLCommerz payment gateway
│
└── utils/
    └── testConnection.js              ← Aiven connection test script
```

---

## 🚀 Setup (5 Steps)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure .env
Open `.env` and fill in:
- `DB_PASSWORD` — from Aiven console (click eye icon next to Password)
- `FIREBASE_PRIVATE_KEY` — from Firebase service account JSON
- `FIREBASE_CLIENT_EMAIL` — from Firebase service account JSON

### Step 3 — Place Aiven CA certificate
```bash
mkdir -p certs
# Download ca.pem from Aiven Console → your MySQL service → Overview → CA certificate → Download
mv ~/Downloads/ca.pem ./certs/ca.pem
```

### Step 4 — Test connection + run migrations
```bash
npm run test:connection    # verify Aiven connection works

npm run db:migrate         # create all 11 tables
npm run db:seed            # insert all sample data
```

### Step 5 — Start the server
```bash
npm run dev                # development (nodemon auto-restart)
npm start                  # production
```

---

## 🔐 Default Admin Credentials

- **Email:** `admin@subscriptionsbd.net`
- **Password:** `Admin@123`
- **⚠️ Change this immediately in production!**

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/firebase-login     → Firebase Google/Email login → syncs to MySQL
POST /api/auth/admin-login        → Email/password admin login
GET  /api/auth/me                 → Get current user profile
PUT  /api/auth/profile            → Update profile
POST /api/auth/change-password    → Change password
```

### Products
```
GET    /api/categories            → All active categories with product count
GET    /api/products              → List products (filter, sort, paginate)
GET    /api/products/:slug        → Single product with plans + reviews
POST   /api/products              → Create product [ADMIN]
PUT    /api/products/:id          → Update product [ADMIN]
DELETE /api/products/:id          → Soft delete product [SUPER ADMIN]
```

### Orders
```
POST /api/orders                  → Place order (guest or logged in)
GET  /api/orders                  → My orders (customer) / All orders (admin)
GET  /api/orders/:orderNumber     → Order detail
PUT  /api/orders/:id/status       → Update status + delivery data [ADMIN]
POST /api/orders/:id/cancel       → Cancel order
```

### Payments
```
POST /api/payments/sslcommerz/initiate  → Start SSLCommerz payment
POST /api/payments/sslcommerz/success   → SSLCommerz success callback
POST /api/payments/sslcommerz/fail      → SSLCommerz fail callback
POST /api/payments/sslcommerz/cancel    → SSLCommerz cancel callback
POST /api/payments/sslcommerz/ipn       → SSLCommerz background webhook
POST /api/payments/verify-manual        → Verify bKash/Nagad payment [ADMIN]
```

### Blog ✅
```
GET    /api/blog                  → List published posts (filter, paginate)
GET    /api/blog/categories       → Blog categories with post counts
GET    /api/blog/related/:slug    → 3 related posts by same category
GET    /api/blog/:slug            → Full post (auto-increments view count)
POST   /api/blog                  → Create post [ADMIN]
PUT    /api/blog/:id              → Update post [ADMIN]
DELETE /api/blog/:id              → Soft delete post [ADMIN]
```

### Reviews
```
GET    /api/reviews/product/:id   → Approved reviews for a product
GET    /api/reviews/pending       → Unapproved reviews [ADMIN]
POST   /api/reviews               → Submit review (verified purchase auto-detected)
PUT    /api/reviews/:id/approve   → Approve review + update avg rating [ADMIN]
DELETE /api/reviews/:id           → Delete review [ADMIN]
```

### Coupons
```
POST   /api/coupons/validate      → Validate coupon + calculate discount (public)
GET    /api/coupons               → All coupons [ADMIN]
POST   /api/coupons               → Create coupon [ADMIN]
PUT    /api/coupons/:id           → Update coupon [ADMIN]
DELETE /api/coupons/:id           → Delete coupon [ADMIN]
```

### Admin
```
GET /api/admin/stats                       → Dashboard stats + recent orders + top products
GET /api/admin/users                       → All users (search, filter by role)
PUT /api/admin/users/:id/toggle-active     → Suspend/activate user
PUT /api/admin/users/:id/role             → Change user role [SUPER ADMIN]
```

---

## 🔗 Connecting to Next.js Frontend

Add this to your Next.js `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Call APIs from Next.js:
```ts
// Fetch products
const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
const data = await res.json();

// Fetch blog posts
const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`);
const data = await res.json();

// Place order (with Firebase token)
const idToken = await firebaseUser.getIdToken();
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
  method:  "POST",
  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
  body:    JSON.stringify(orderData),
});
```

---

## 🗄️ Database Commands

```bash
npm run test:connection    # test Aiven SSL connection
npm run db:migrate         # create all tables
npm run db:migrate:undo    # drop all tables
npm run db:seed            # insert seed data
npm run db:seed:undo       # remove seed data
npm run db:reset           # drop + migrate + seed (full reset)
```
