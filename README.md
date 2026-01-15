# NeetCode 150 Tracker

A comprehensive, production-ready web application for tracking progress through 150 essential coding interview problems with multi-language solutions and personal notes.

![Home Page](https://img.shields.io/badge/Problems-150-blue) ![Languages-9](https://img.shields.io/badge/Languages-9-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Features

- **150 LeetCode Problems** organized across 18 categories
- **Monaco Editor** (VS Code's editor) with syntax highlighting for 9 languages
- **Multi-Language Solutions** - Python, JavaScript, TypeScript, Java, C++, Go, Rust, Swift, Kotlin
- **Markdown Notes** for each problem
- **Authentication System** - Read-only public access, protected edit mode
- **Search & Filter** - Real-time search and category filtering
- **Premium Dark Theme** - Glassmorphism design with smooth animations
- **Scalable Architecture** - Ready for multiple problem collections

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB connection (Railway provided)

### Installation

```bash
# Clone or navigate to the project
cd /Users/manishtiwari/Documents/Dev/neetcode-150

# Install dependencies
npm install

# Seed the database with 150 problems
npm run seed

# Start development server
npm run dev
```

Visit **http://localhost:3000**

### Default Login

- **Password**: `admin123`
- Change in `.env.local` (see Configuration section)

## 📁 Project Structure

```
neetcode-150/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth configuration
│   │   │   ├── collections/  # Collection endpoints
│   │   │   ├── problems/     # Problem endpoints
│   │   │   ├── solutions/    # Solution CRUD
│   │   │   └── notes/        # Notes CRUD
│   │   ├── problem/[id]/     # Problem detail pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Design system
│   ├── components/           # React components
│   ├── data/                 # Seed data
│   │   └── neetcode150.ts    # 150 problems
│   └── lib/
│       ├── mongodb.ts        # Database connection
│       ├── auth.ts           # Auth utilities
│       └── types.ts          # TypeScript interfaces
├── scripts/
│   └── seed.ts               # Database seeding script
└── .env.local                # Environment variables
```

## 🔧 Configuration

### Environment Variables

Create/edit `.env.local`:

```env
# MongoDB (Railway)
MONGODB_URI=mongodb://mongo:***@nozomi.proxy.rlwy.net:12346
MONGODB_DB=neetcode_tracker

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Admin Password
ADMIN_PASSWORD_HASH=$2a$10$...
```

### Change Admin Password

```bash
# Generate new password hash
node -e "console.log(require('bcryptjs').hashSync('your-new-password', 10))"

# Copy the output to ADMIN_PASSWORD_HASH in .env.local
```

## 📊 Database Schema

### Collections
- Stores metadata for problem sets (NeetCode 150, Blind 75, etc.)

### Problems (150 documents)
- Problem details, difficulty, category, description

### Solutions (user-created)
- Multi-language code solutions with complexity analysis

### Notes (user-created)
- Markdown notes for each problem

## 🎯 Usage

### Browse Problems
1. Visit home page
2. Use search or category filter
3. Click any problem card

### Add Solutions
1. Login with admin password
2. Navigate to problem detail page
3. Click "Solutions" tab
4. Select language
5. Write code in Monaco Editor
6. Add time/space complexity (optional)
7. Click "Save Solution"

### Add Notes
1. Login (if not already)
2. Go to "Notes" tab
3. Write markdown notes
4. Click "Save Note"

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Editor** | Monaco Editor |
| **Styling** | Vanilla CSS |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB (Railway) |
| **Auth** | NextAuth.js v5 |

## 🎨 Design System

- **Dark Theme** with glassmorphism effects
- **Color Palette**: Purple/Indigo gradients
- **Difficulty Colors**: Easy (green), Medium (amber), Hard (red)
- **Typography**: Inter font family
- **Animations**: Smooth 250ms transitions

## 📈 Performance

- **MongoDB Indexes** on all frequently queried fields
- **Connection Pooling** for database efficiency
- **Code Splitting** - Monaco Editor lazy loaded
- **Optimistic UI** for instant feedback

## 🔐 Security

- **Password-based authentication** with bcrypt hashing
- **Session management** via NextAuth.js (30-day sessions)
- **Read-only public access** - No login required to view
- **Protected writes** - Authentication required for edits

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

## 📝 Adding More Collections

1. Create seed data file in `src/data/`
2. Update `scripts/seed.ts`
3. Run `npm run seed`

Example: Blind 75, Grind 169, custom problem sets

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

MIT

## 🙏 Credits

- **NeetCode** for the curated problem list
- **LeetCode** for the problems
- **Monaco Editor** for the code editor
- **Next.js** team for the framework

---

**Built with ❤️ using Next.js, MongoDB, and Monaco Editor**
