# VF-TryOn Backend Setup Guide

## 🚀 Quick Start

This guide will help you set up the backend server with MongoDB Atlas integration.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

## 🔧 MongoDB Atlas Setup
## 🔐 Firebase Admin Credentials (Optional)

Do NOT commit service account JSON to git. Instead:

1. Save your service account JSON locally outside the repo (or in this folder but ignored).
2. Set an environment variable pointing to it in `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
```

3. Ensure `.gitignore` contains `backend/firebase-service-account.json` so it never gets committed.

Your code should read the path from `process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH` and load it at runtime.


### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project

### 2. Create a Cluster
1. Click \"Build a Database\"
2. Choose \"FREE\" shared cluster
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., \"vf-tryon-cluster\")
5. Click \"Create Cluster\"

### 3. Configure Database Access
1. Go to \"Database Access\" in the left sidebar
2. Click \"Add New Database User\"
3. Choose \"Password\" authentication
4. Create username and password (save these!)
5. Set user privileges to \"Read and write to any database\"
6. Click \"Add User\"

### 4. Configure Network Access
1. Go to \"Network Access\" in the left sidebar
2. Click \"Add IP Address\"
3. For development, click \"Allow Access from Anywhere\" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click \"Confirm\"

### 5. Get Connection String
1. Go to \"Database\" in the left sidebar
2. Click \"Connect\" on your cluster
3. Choose \"Connect your application\"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<database>` with your database name (e.g., \"vf-tryon\")

## 💻 Backend Installation

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vf-tryon?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 🧪 Testing the Setup

### 1. Health Check
Open your browser and visit:
```
http://localhost:5000/health
```

You should see a JSON response with server status.

### 2. Database Connection Test
Visit:
```
http://localhost:5000/api/test-db
```

You should see a success message if MongoDB is connected.

### 3. API Endpoints Test
Test the products endpoint:
```
http://localhost:5000/api/v1/products
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Products API
│   ├── wishlist.js          # Wishlist management
│   ├── looks.js             # User looks/outfits
│   ├── upload.js            # File upload handling
│   └── tryOn.js             # Try-on sessions
├── services/
│   └── DatabaseService.js   # MongoDB connection service
├── uploads/                 # File upload directory
├── .env.example             # Environment template
├── .env                     # Your environment config
├── package.json             # Dependencies
└── server.js                # Main server file
```

## 🔌 API Endpoints

### Health & Testing
- `GET /health` - Server health check
- `GET /api/test-db` - Database connection test

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `GET /api/v1/products/meta/categories` - Get categories
- `GET /api/v1/products/search/:query` - Search products
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Other Endpoints
- `GET /api/v1/auth/test` - Auth routes test
- `GET /api/v1/wishlist/test` - Wishlist routes test
- `GET /api/v1/looks/test` - Looks routes test
- `GET /api/v1/upload/test` - Upload routes test
- `GET /api/v1/try-on/test` - Try-on routes test

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔒 Security Features

- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- Error handling
- Environment-based configuration

## 📊 Database Collections

The backend automatically creates and indexes these collections:

- **users** - User profiles and authentication
- **products** - Fashion items and clothing
- **wishlist** - User favorite items
- **looks** - User-created outfit combinations
- **tryOnSessions** - Virtual try-on session data

## 🚨 Troubleshooting

### Common Issues

**1. \"MongoServerError: bad auth\"**
- Check your username and password in the connection string
- Ensure the database user has proper permissions

**2. \"MongooseTimeoutError\"**
- Check your network access settings in MongoDB Atlas
- Ensure your IP address is whitelisted

**3. \"Port already in use\"**
- Change the PORT in your .env file
- Or kill the process using the port

**4. \"Cannot connect to MongoDB\"**
- Verify your connection string format
- Check if MongoDB Atlas is accessible from your network
- Ensure the cluster is running

### Getting Help

- Check the server logs for detailed error messages
- Visit `/health` endpoint to check server status
- Visit `/api/test-db` to test database connectivity

## 🎉 Next Steps

1. **Add Sample Data**: Use MongoDB Compass or the Atlas web interface to add sample products
2. **Implement Authentication**: Extend the auth routes with JWT authentication
3. **File Upload**: Configure multer for image uploads
4. **API Documentation**: Use tools like Swagger for API documentation
5. **Testing**: Add comprehensive test suites
6. **Deployment**: Deploy to cloud platforms like Heroku, Vercel, or AWS

## 📞 Support

If you encounter any issues:
1. Check this README
2. Review the error logs
3. Test individual endpoints
4. Verify your MongoDB Atlas configuration

Happy coding! 🚀"