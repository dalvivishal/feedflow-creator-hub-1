
# FeedFlow Backend Server

This is the backend server for the FeedFlow Creator Hub application.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example` and fill in your MongoDB connection string and JWT secret.

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/credits` - Get user credit transactions
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:userId/credits` - Update user credits (admin only)

### Feed
- `GET /api/feed` - Get feed items
- `POST /api/feed/save/:itemId` - Save/unsave feed item
- `POST /api/feed/report/:itemId` - Report feed item
- `GET /api/feed/saved` - Get saved items
- `POST /api/feed/share/:itemId` - Record share action
- `GET /api/feed/reported` - Get reported items (admin only)

## Deployment

This server is designed to be deployed to Google Cloud Run. Follow these steps:

1. Install Google Cloud CLI
2. Build the Docker container:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/feedflow-backend
   ```
3. Deploy to Cloud Run:
   ```
   gcloud run deploy --image gcr.io/YOUR_PROJECT_ID/feedflow-backend --platform managed
   ```

Make sure to set up the required environment variables in the Cloud Run console.
