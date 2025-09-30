# Restaurant Reservation System - MVP Implementation

## Core Features to Implement

### Customer-Facing Features:
1. **Home/Landing Page** - Welcome page with reservation form
2. **Reservation Form** - Date, time, party size, contact details
3. **Confirmation Page** - Show reservation details after booking

### Staff Dashboard Features:
1. **Login Page** - Simple authentication for staff
2. **Dashboard** - View all reservations with status management
3. **Reservation Management** - Accept/decline reservations

## Files to Create:

### Core Components:
1. `src/pages/Index.tsx` - Main landing page with reservation form
2. `src/pages/StaffLogin.tsx` - Staff login page
3. `src/pages/StaffDashboard.tsx` - Staff dashboard for managing reservations
4. `src/pages/Confirmation.tsx` - Reservation confirmation page

### Utility Components:
5. `src/components/ReservationForm.tsx` - Reusable reservation form component
6. `src/components/ReservationCard.tsx` - Display individual reservations
7. `src/lib/storage.ts` - Local storage utilities for data persistence
8. `src/types/reservation.ts` - TypeScript interfaces

## Data Structure:
- Reservations: id, customerName, email, phone, date, time, partySize, status, createdAt
- Status: 'pending', 'confirmed', 'declined'
- Simple localStorage for data persistence (no backend required)

## Navigation:
- Customer: Home → Confirmation
- Staff: Login → Dashboard
- Header navigation between sections

## Implementation Priority:
1. Set up types and storage utilities
2. Create reservation form and confirmation flow
3. Build staff login and dashboard
4. Add navigation and styling
5. Test all functionality