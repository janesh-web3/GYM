# Gym Management Platform

A comprehensive gym management system built with modern web technologies.

## Tech Stack

- **Frontend**: React (Vite + TailwindCSS + TypeScript)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Storage**: Cloudinary
- **Payment**: Stripe (Optional)
- **Mobile**: React Native (Optional)

## Features

### Backend
- Gym registration & login (JWT auth)
- Member management
- Trainer assignment
- Workout and diet plans
- Attendance tracking
- Payment APIs (Stripe/Razorpay)
- E-commerce endpoints (products, cart, orders)

### Frontend
- Admin dashboard (manage gyms, trainers, members)
- Gym dashboard (portfolio, schedule, media upload)
- Member portal (fitness data, diet, attendance)
- Product storefront + cart
- Media gallery (photos/videos)

## Project Structure

```
.
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── tailwind.config.ts
│
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── .env
│
├── mobile/ (optional)      # React Native app
│   └── ...
│
├── .gitignore
├── README.md
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd gym-management-platform
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env` in both client and server directories
- Fill in the required environment variables

4. Start the development servers
```bash
# Start the backend server
cd server
npm run dev

# Start the frontend development server
cd ../client
npm run dev
```

## Deployment

- Frontend: Deploy to Vercel
- Backend: Deploy to Render/Railway/DigitalOcean
- Database: MongoDB Atlas
- Storage: Cloudinary
- Payment: Stripe Dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 