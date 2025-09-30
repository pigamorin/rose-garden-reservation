# 🚀 Deployment Guide - Rose Garden Reservation System

## Step-by-Step Free Deployment

### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Rose Garden Reservation System"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/rose-garden-reservation.git

# Push to GitHub
git push -u origin main
```

### 2. Set Up Supabase (Free Database)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with GitHub
3. **Create New Project**
   - Name: `rose-garden-reservation`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your location
4. **Wait for setup** (2-3 minutes)
5. **Get your credentials:**
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

### 3. Set Up EmailJS (Free Email Service)

1. **Go to [emailjs.com](https://emailjs.com)**
2. **Create account** (free)
3. **Add Email Service:**
   - Go to Email Services
   - Click "Add New Service"
   - Choose Gmail/Outlook/Yahoo
   - Connect your email account
4. **Create Email Template:**
   - Go to Email Templates
   - Click "Create New Template"
   - Use this template:
   ```
   Subject: {{subject}}
   
   Dear {{customer_name}},
   
   {{message_body}}
   
   Best regards,
   Rose Garden Team
   ```
5. **Get your credentials:**
   - Service ID, Template ID, Public Key

### 4. Deploy to Vercel (Free Hosting)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up** with GitHub
3. **Import Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Framework: Vite
   - Root Directory: `./`
4. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```
5. **Deploy!** (takes 2-3 minutes)

### 5. Configure Database Tables (Supabase)

1. **Go to your Supabase project**
2. **SQL Editor** → New Query
3. **Run this SQL:**

```sql
-- Create reservations table
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  communication_preference TEXT DEFAULT 'email',
  attendance TEXT,
  attendance_marked_at TIMESTAMP,
  attendance_marked_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create blocked_slots table
CREATE TABLE blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  blocked_by TEXT NOT NULL,
  blocked_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (username, password_hash, full_name, role, permissions) VALUES
('admin', '$2b$10$hash_for_admin123', 'Restaurant Manager', 'manager', '["view_reservations", "manage_reservations", "view_analytics", "manage_users", "mark_attendance"]'),
('staff', '$2b$10$hash_for_staff123', 'Restaurant Staff', 'staff', '["view_reservations", "manage_reservations", "mark_attendance"]');

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, customize later)
CREATE POLICY "Allow all operations" ON reservations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blocked_slots FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
```

### 6. Test Your Deployment

1. **Visit your Vercel URL**
2. **Test customer booking:**
   - Fill out reservation form
   - Submit reservation
3. **Test staff dashboard:**
   - Login with: `admin` / `admin123`
   - View reservations
   - Confirm/decline a reservation
   - Check browser console for notification logs

### 7. Custom Domain (Optional)

1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **In Vercel:**
   - Go to your project
   - Settings → Domains
   - Add your domain
   - Follow DNS setup instructions

## 🎉 You're Live!

Your Rose Garden Reservation System is now live and accessible worldwide!

### Next Steps:
- **Real Email Integration**: Replace console logs with actual EmailJS calls
- **SMS Integration**: Add Twilio for text messages
- **WhatsApp Integration**: Connect WhatsApp Business API
- **Analytics**: Add Google Analytics
- **Monitoring**: Set up uptime monitoring

### Support:
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **EmailJS Docs**: [emailjs.com/docs](https://emailjs.com/docs)

**🚀 Congratulations! Your restaurant reservation system is now live!**