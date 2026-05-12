# Subscriptions BD — Next.js 14 App

Bangladesh's #1 Digital Subscription Store — redesigned with Next.js 14, TypeScript, and Tailwind CSS.

---

## 🗂 Repository Structure

```
subscriptionsbd/
├── public/                          # Static assets (logos, favicons, images)
│
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── globals.css              # Global styles + Tailwind base
│   │   ├── layout.tsx               # Root layout (Navbar + Footer + WhatsApp)
│   │   ├── page.tsx                 # 🏠 Homepage
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx             # 🛍 Products listing (filter + sort)
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # 📦 Product detail page
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx             # 🛒 Cart + Checkout + Order success
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx             # 📝 Blog listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # 📄 Blog post detail page
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx             # ℹ️ About page (timeline, team values, reviews)
│   │   │
│   │   ├── contact/
│   │   │   └── page.tsx             # 📞 Contact page (form + FAQ accordion)
│   │   │
│   │   └── not-found.tsx            # 404 page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.tsx           # Promo bar + contact info (auto-hide on scroll)
│   │   │   ├── Navbar.tsx           # Sticky navbar + mobile menu + cart badge
│   │   │   └── Footer.tsx           # Full footer with links, trust badges, socials
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.tsx      # Full-screen hero with stats + CTAs
│   │   │   ├── CategoriesSection.tsx # Category icon grid
│   │   │   ├── AboutSection.tsx     # Website info + 6-feature grid
│   │   │   ├── FeaturedProducts.tsx # Swiper slider — 3 product cards at a time
│   │   │   ├── FeaturedBlogs.tsx    # Swiper slider — 3 blog cards at a time
│   │   │   └── TestimonialsSection.tsx # Customer reviews slider
│   │   │
│   │   ├── products/
│   │   │   └── ProductCard.tsx      # Reusable product card (image, price, add to cart)
│   │   │
│   │   ├── blog/
│   │   │   └── BlogCard.tsx         # Reusable blog post card
│   │   │
│   │   └── ui/
│   │       └── WhatsAppWidget.tsx   # Floating WhatsApp button + chat popup
│   │
│   ├── hooks/
│   │   └── useCart.tsx              # Cart context + reducer (add, remove, update qty)
│   │
│   ├── lib/
│   │   └── data.ts                  # Mock data (products, blogs, categories, siteConfig)
│   │
│   └── types/
│       └── index.ts                 # TypeScript interfaces (Product, BlogPost, CartItem...)
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## ✨ Features

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, Categories, About, Featured Products slider, Testimonials, Featured Blogs slider, Footer |
| Products | `/products` | Grid with search, category filter, sort |
| Product Detail | `/products/[slug]` | Image, plans, features, add to cart, WhatsApp order |
| Cart | `/cart` | Cart management, coupon, checkout form, order confirmation |
| Blog | `/blog` | Featured post hero + grid listing |
| Blog Post | `/blog/[slug]` | Full post with related posts |
| About | `/about` | Stats, mission, values, timeline, reviews |
| Contact | `/contact` | Contact form, FAQ accordion, quick contact cards |

### Components
- **Topbar** — Promo banner + phone/email, hides on scroll
- **Navbar** — Sticky with logo, nav links, cart badge, mobile hamburger menu
- **WhatsApp Widget** — Floating button + mini chat window (sends to actual WhatsApp)
- **Product Slider** — Swiper.js with 3 cards visible, auto-play, nav buttons
- **Blog Slider** — Swiper.js with 3 cards visible, auto-play
- **Cart System** — Context API + localStorage persistence, coupon support
- **Checkout Flow** — 3-step: Cart → Checkout form → Success screen

### Design System
- **Fonts** — `Syne` (headings) + `DM Sans` (body)
- **Color** — Dark theme (`#0a0a0f`) with orange brand (`#f97316`) accents
- **Animations** — CSS hover effects, float animation, fade-up keyframes
- **Responsive** — Fully mobile-first, tested for Android phones and desktop

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd subscriptionsbd
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for production

```bash
npm run build
npm start
```

---

## 🔧 Customization

### Update site info
Edit `src/lib/data.ts` → `siteConfig` object:
```ts
export const siteConfig = {
  name: "Subscriptions BD",
  whatsapp: "+8801700000000",  // ← your WhatsApp number
  email: "support@subscriptionsbd.net",
  // ...
};
```

### Add / edit products
Edit the `products` array in `src/lib/data.ts`:
```ts
{
  id: "9",
  name: "Your Product",
  slug: "your-product",
  category: "streaming",
  price: 299,
  originalPrice: 599,
  // ...
}
```

### Add / edit blog posts
Edit the `blogPosts` array in `src/lib/data.ts`.

### Connect to a real backend
Replace the mock data in `src/lib/data.ts` with API calls (WooCommerce REST API, custom Node.js backend, Supabase, etc.)

---

## 📦 Tech Stack

| Tech | Version | Usage |
|------|---------|-------|
| Next.js | 14.x | App Router, SSR/SSG |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Swiper.js | 11.x | Product & blog sliders |
| Lucide React | 0.383 | Icons |
| React Context | Built-in | Cart state management |

---

## 📱 WhatsApp Integration

The WhatsApp widget sends users directly to your WhatsApp number. Update the number in `siteConfig.whatsapp`.

When a user clicks the floating button:
1. A mini chat window opens in the bottom-right corner
2. User can type a custom message or press Enter with the default message
3. Clicking "Send" opens `https://wa.me/YOUR_NUMBER?text=MESSAGE` in a new tab

---

## 🛒 Cart & Checkout Flow

1. **Cart Page** — Users see all added items, can change quantity, remove items, apply coupon
2. **Checkout** — Users enter name, phone, payment method (bKash/Nagad/Rocket), and transaction ID
3. **Success** — Order confirmation with WhatsApp follow-up link

> To connect to a real payment gateway, integrate the checkout form with your preferred BD payment API (SSLCommerz, ShurjoPay, SSLWIRELESS, etc.)

---

## 🌐 Deployment

Deploy to Vercel (recommended for Next.js):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# or connect GitHub repo to vercel.com for auto-deploy
```

---

Made with ❤️ for Bangladesh's digital community.
