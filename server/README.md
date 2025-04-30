# Gym Management System - Backend

This is the backend server for the Gym Management System, built with Node.js and Express.

## Features

- RESTful API architecture
- MongoDB database with Mongoose ODM
- JWT authentication
- Environment variable configuration
- Security middleware (helmet, cors, rate limiting)
- Request logging
- Error handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gym-management
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. For production:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── app.js         # Express application setup
└── server.js      # Server entry point
```

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## License

MIT 