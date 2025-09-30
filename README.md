# 🌹 Rose Garden Reservation System

A complete restaurant reservation management system with automatic notifications and slot blocking capabilities.

## ✨ Features

- **Customer Reservations** - Easy-to-use booking form with validation
- **Staff Dashboard** - Manage reservations, users, and analytics
- **Automatic Notifications** - Email, SMS, and WhatsApp messaging
- **Slot Blocking** - Prevent bookings on specific dates/times
- **User Management** - Role-based access control (Manager/Staff)
- **Attendance Tracking** - Mark customers as attended or no-show
- **Analytics Dashboard** - Comprehensive booking insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account (free)
- EmailJS account (free)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd rose-garden-reservation
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Fill in your Supabase and EmailJS credentials.

4. **Run development server**
```bash
pnpm run dev
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy!

### Deploy to Netlify

1. **Build the project**
```bash
pnpm run build
```

2. **Deploy to Netlify**
- Drag and drop the `dist` folder to [netlify.com](https://netlify.com)
- Or connect your GitHub repository

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Add them to your `.env.local` file

### EmailJS Setup

1. Create account at [emailjs.com](https://emailjs.com)
2. Create email service and template
3. Add credentials to `.env.local`

### Default Login Credentials

**Manager Account:**
- Username: `admin`
- Password: `admin123`

**Staff Account:**
- Username: `staff`
- Password: `staff123`

## 📱 Communication Services

### Email Notifications
- **Free**: EmailJS (200 emails/month)
- **Paid**: SendGrid, Mailgun, AWS SES

### SMS Notifications
- **Twilio**: $0.0075 per SMS
- **AWS SNS**: $0.006 per SMS

### WhatsApp Business API
- **Twilio WhatsApp**: $0.005-0.04 per message
- **360Dialog**: €0.016-0.068 per message

## 💰 Hosting Costs

### Free Tier (Perfect for Small Restaurants)
- **Vercel**: Free hosting
- **Supabase**: Free database (500MB)
- **EmailJS**: Free emails (200/month)
- **Total**: $0/month

### Professional Setup
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Email Service**: $20/month
- **SMS/WhatsApp**: $20-50/month
- **Total**: $85-115/month

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel/Netlify
- **Notifications**: EmailJS, Twilio

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ReservationForm.tsx
│   ├── ReservationCard.tsx
│   ├── SlotManagement.tsx
│   └── UserManagement.tsx
├── pages/              # Main pages
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # Staff dashboard
│   └── Login.tsx       # Staff login
├── lib/                # Utilities and storage
│   ├── storage.ts      # Local storage management
│   └── userStorage.ts  # User management
└── types/              # TypeScript definitions
    ├── reservation.ts
    └── user.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@rosegarden.com or create an issue on GitHub.

---

**Built with ❤️ for Rose Garden Restaurant**