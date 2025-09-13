# Marcel Expenses Project - Development Setup

A full-stack expense management application with React frontend, Node.js backend, and cloud MongoDB database, containerized with Docker for development.

## 🛠️ Tools Required

### 1. Docker Desktop (Required)

**Option A: Download from Official Website**

1. Visit [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Download the installer for your Mac (Intel or Apple Silicon)
3. Open the downloaded .dmg file and drag Docker to Applications
4. Launch Docker Desktop from Applications

**Option B: Install via Homebrew**

```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop
open /Applications/Docker.app
```

**Verify Installation:**

```bash
docker --version
docker compose version
```

### 2. Git (Required)

```bash
# Check if Git is installed
git --version

# Install Git if needed (via Homebrew)
brew install git
```

### 3. Code Editor (Recommended)

- **VS Code**: `brew install --cask visual-studio-code`
- **WebStorm**: `brew install --cask webstorm`
- **Sublime Text**: `brew install --cask sublime-text`

## 🚀 How to Use - Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Marcel-Expense-Project
```

### 2. Environment Configuration

The project is pre-configured with a cloud MongoDB database. The `.env` file already contains the necessary configuration:

```env
# Cloud Database (Pre-configured)
MONGO_URI=mongodb+srv://malekurt53:c2W5wfGYQovils7v@attend-wise.w8wfxrd.mongodb.net/attend-wise

# Backend Configuration
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

**Note**: No additional environment setup is required as the cloud database is already configured.

### 3. Build and Run the Development Environment

```bash
# Build and start all services in development mode
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

### 4. Access the Application

- **Frontend (Vite Dev Server)**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: Cloud MongoDB Atlas (no local access needed)

### 5. Development Features

✅ **Hot Reloading**: Both frontend and backend automatically restart when you make code changes  
✅ **Cloud Database**: No local MongoDB setup required  
✅ **Development Mode**: Optimized for development with detailed logging  
✅ **Volume Mounting**: Source code changes are immediately reflected in containers

## 🔧 Development Commands

### Running Services

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Rebuild and start (after code changes)
docker compose up --build

# Start specific service
docker compose up backend
docker compose up frontend
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f

# View last 50 lines
docker compose logs --tail=50
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (if needed)
docker compose down -v

# Stop and remove everything (containers, networks, images)
docker compose down --rmi all

# Force stop all services immediately
docker compose kill

# Stop specific service
docker compose stop backend
docker compose stop frontend

# Restart services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

## 💻 Development Workflow

### Making Code Changes

1. **Frontend Changes**:

   - Edit files in `./frontend/src/`
   - Changes are automatically reflected (hot reloading)
   - Vite dev server rebuilds instantly

2. **Backend Changes**:

   - Edit files in `./backend/src/`
   - Nodemon automatically restarts the server
   - API changes are immediately available

3. **Testing Changes**:

   ```bash
   # Check if services are running
   docker compose ps

   # Test backend API
   curl http://localhost:5000/

   # Access frontend
   open http://localhost:5173
   ```

### Database Management

The project uses a cloud MongoDB database, so no local database management is required. The database is automatically connected when the backend starts.

## 📁 Project Structure

```
Marcel-Expense-Project/
├── backend/
│   ├── src/                    # Backend source code (Node.js/Express)
│   │   ├── controllers/        # API controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration files
│   │   └── server.js          # Main server file
│   ├── Dockerfile             # Development container config
│   ├── package.json           # Backend dependencies
│   └── logs/                  # Application logs
├── frontend/
│   ├── src/                   # Frontend source code (React/Vite)
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # React context
│   │   ├── api/              # API service functions
│   │   └── App.jsx           # Main App component
│   ├── Dockerfile            # Development container config
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── docker-compose.yml        # Development configuration
├── .env                      # Environment variables
└── README.md                 # This documentation
```

## 🔧 Development Services

### Backend (Node.js API)

- **Framework**: Express.js with Node.js
- **Port**: 5000
- **Environment**: Development mode with nodemon
- **Features**: Hot reloading, detailed logging, cloud database connection
- **Database**: Cloud MongoDB Atlas

### Frontend (React App)

- **Framework**: React with Vite
- **Port**: 5173
- **Environment**: Development mode with Vite dev server
- **Features**: Hot module replacement (HMR), fast refresh, instant rebuilds

## 🛠️ Useful Development Commands

### Docker Management

```bash
# Stop all services
docker compose down

# Rebuild specific service
docker compose build backend
docker compose build frontend

# Rebuild everything
docker compose build --no-cache

# Execute commands in running containers
docker compose exec backend npm install
docker compose exec frontend npm install

# View container status
docker compose ps

# Remove unused Docker resources
docker system prune -a
```

### Development Helpers

```bash
# Install new backend dependencies
docker compose exec backend npm install <package-name>

# Install new frontend dependencies
docker compose exec frontend npm install <package-name>

# Run backend tests (if available)
docker compose exec backend npm test

# Run frontend tests (if available)
docker compose exec frontend npm test

# Access backend shell
docker compose exec backend sh

# Access frontend shell
docker compose exec frontend sh
```

## 🐛 Troubleshooting

### Common Issues

1. **Docker Not Running**:

   ```bash
   # Start Docker Desktop
   open /Applications/Docker.app

   # Verify Docker is running
   docker --version
   ```

2. **Port Already in Use**:

   ```bash
   # Check what's using the ports
   lsof -i :5173  # Frontend
   lsof -i :5000  # Backend

   # Kill the process
   lsof -ti:5000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

3. **Database Connection Issues**:

   ```bash
   # Check backend logs for database connection
   docker compose logs backend

   # Look for "Connected to database" message
   # If connection fails, check internet connectivity
   ```

4. **Frontend Not Loading**:

   ```bash
   # Rebuild frontend
   docker compose build --no-cache frontend
   docker compose up frontend

   # Check frontend logs
   docker compose logs frontend
   ```

5. **Backend API Not Responding**:

   ```bash
   # Check backend status
   docker compose logs backend

   # Test API endpoint
   curl http://localhost:5000/

   # Restart backend
   docker compose restart backend
   ```

6. **Code Changes Not Reflecting**:

   ```bash
   # Ensure volume mounts are working
   docker compose down
   docker compose up

   # Check if files are mounted correctly
   docker compose exec backend ls -la /app/src
   docker compose exec frontend ls -la /app/src
   ```

### Quick Health Checks

```bash
# Check all services status
docker compose ps

# Test backend API
curl http://localhost:5000/

# Test frontend
open http://localhost:5173

# Monitor resource usage
docker stats
```

### Performance Tips

```bash
# Clean up unused Docker resources
docker system prune -a

# Restart Docker Desktop if slow
# Docker Desktop > Troubleshoot > Restart

# Allocate more resources to Docker
# Docker Desktop > Settings > Resources
# Recommended: 4GB RAM, 2 CPUs minimum
```

## 📝 Environment Configuration

### Pre-configured Variables

The following variables are already set up in the `.env` file:

| Variable       | Description              | Value                                  |
| -------------- | ------------------------ | -------------------------------------- |
| `MONGO_URI`    | Cloud MongoDB connection | Pre-configured cloud database          |
| `PORT`         | Backend server port      | 5000                                   |
| `JWT_SECRET`   | JWT signing secret       | Pre-configured (change for production) |
| `JWT_EXPIRE`   | JWT expiration time      | 30d                                    |
| `VITE_API_URL` | Frontend API URL         | http://localhost:5000/api              |

### Optional Variables (Already Configured)

| Variable              | Description             | Usage                   |
| --------------------- | ----------------------- | ----------------------- |
| `GOOGLE_MAPS_API_KEY` | Google Maps integration | For location features   |
| `GEMINI_API_KEY`      | AI integration          | For AI-powered features |
| `EMAIL_*`             | Email configuration     | For notifications       |

**Note**: All essential variables are pre-configured. No manual setup required for development.

## 🚀 Getting Started Summary

### Quick Start (3 Steps)

1. **Install Docker Desktop**:

   ```bash
   brew install --cask docker
   open /Applications/Docker.app
   ```

2. **Clone and Start**:

   ```bash
   git clone <repository-url>
   cd Marcel-Expense-Project
   docker compose up --build
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Development Features

✅ **No Database Setup**: Uses cloud MongoDB  
✅ **Hot Reloading**: Instant code changes  
✅ **Pre-configured**: Ready to use out of the box  
✅ **Modern Stack**: React + Vite + Node.js + Express  
✅ **Docker Optimized**: Fast development containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test with Docker: `docker compose up --build`
5. Commit your changes: `git commit -m 'Add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Docker logs: `docker compose logs`
3. Verify services are running: `docker compose ps`
4. Test API endpoints: `curl http://localhost:5000/`
5. Create an issue in the repository

## 🎯 Next Steps After Setup

1. **Explore the Application**: Navigate through the frontend at http://localhost:5173
2. **Check API Endpoints**: Test the backend at http://localhost:5000
3. **Make Code Changes**: Edit files and see instant updates
4. **Review Logs**: Monitor `docker compose logs -f` for debugging
5. **Start Development**: Begin building your expense management features!

## 📄 License

This project is licensed under the ISC License.
