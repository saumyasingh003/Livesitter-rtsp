# RTSP Overlay Stream Application

A full-stack web application for streaming RTSP video feeds with customizable text overlays. Built with React frontend and Flask backend, featuring real-time overlay management and HLS video streaming.

## 🚀 Features

- **RTSP Streaming**: Convert RTSP streams to HLS for browser playback
- **Dynamic Overlays**: Add, edit, and delete text overlays in real-time
- **Customizable UI**: Position, color, font size, and background customization
- **Responsive Design**: Works on desktop and mobile devices
- **RESTful API**: Complete API for overlay and stream management
- **Real-time Updates**: Live overlay positioning and editing
- **Dual Environment Support**: Seamlessly works with localhost and production

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Testing RTSP URLs](#-testing-rtsp-urls)
- [Features in Detail](#-features-in-detail)
- [Installation Verification](#-installation-verification)
- [Performance Tips](#-performance-tips)
- [Browser Compatibility](#-browser-compatibility)
- [Security Considerations](#-security-considerations)
- [Reporting Issues](#-reporting-issues)
- [Contributing](#-contributing)

## 🚀 Quick Start

### Running Locally

**Terminal 1: Start Backend (Flask API)**
   ```bash
cd backend
venv\Scripts\activate  # Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
python app.py
```

**Terminal 2: Start Frontend (React)**
   ```bash
cd frontend
npm start
```

**Access the application:**
   Open `http://localhost:3000` in your browser

### Quick Test

1. **Go to "Stream Control" tab** (📹)
2. **Enter test RTSP URL:** `rtsp://rtsp.me/abcd1234/`
3. **Click "▶️ Start Stream"**
4. **Wait 5-10 seconds** for HLS conversion
5. **Go to "Add Overlay" tab** (✏️)
6. **Add overlays** to your stream

## 📋 Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **Python** (v3.8+) - [Download](https://python.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **FFmpeg** - [Download](https://ffmpeg.org/download.html)

## 🛠 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/rooter09/rtspoverplay.git
cd rtspoverplay
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
Create `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/rtsp_overlay
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

The environment files are already configured:
- `.env.development` → Uses `http://localhost:5000`
- `.env.production` → Uses `https://rtspoverplay.onrender.com`

### 4. Database Setup
Ensure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod
```

## 🎯 Usage

### Starting a Stream

1. **Navigate to Stream Control tab** (📹)
2. **Enter RTSP URL** or use test URLs:
   - **Fast:** `rtsp://rtsp.me/abcd1234/`
   - **DevLine:** `rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0`
3. **Click "▶️ Start Stream"**
4. **Wait 10-15 seconds** for video to load

### Adding Overlays

1. **Go to "Add Overlay" tab** (✏️)
2. **Fill in the form:**
   - **Text:** "LIVE" or any text you want
   - **Position:** Use preset buttons or custom px/% values
   - **Font Size:** Choose from dropdown (12px to 24px)
   - **Color:** Pick text color
   - **Background:** Choose background color
3. **Click "Add Overlay"**
4. **Overlay appears on video immediately**

### Managing Overlays

1. **Switch to "Manage Overlays" tab** (⚙️)
2. **View all your overlays**
3. **Edit (✏️):** Modify text, position, colors
4. **Delete (🗑️):** Remove overlays

## ⚙ Configuration

### 🌐 Environment Configuration

This project supports **automatic environment detection**:

- **Development** (`npm start`): Uses `http://localhost:5000` automatically
- **Production** (`npm run build`): Uses `https://rtspoverplay.onrender.com`
- **No manual configuration needed** when switching environments!

### How It Works

The `frontend/src/config.js` file automatically detects the environment:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
export { API_BASE_URL };
```

### Backend Configuration

Create `backend/.env` for local development:
```env
CORS_ORIGINS=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/rtsp_overlay
```

For production deployment on Render:
```env
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Frontend Configuration

Environment files are pre-configured:
- `.env.development` → `http://localhost:5000`
- `.env.production` → `https://rtspoverplay.onrender.com`

All components automatically use the correct URL based on the build environment.

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Repository: Connect your GitHub repository
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

2. **Set Environment Variables on Render:**
   ```env
   CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
   MONGODB_URI=your_mongodb_connection_string
   ```
   
   **Important Notes:**
   - Replace `your-vercel-app` with your actual Vercel URL
   - **No wildcards**: Flask-CORS doesn't support `https://*.vercel.app`
   - **Explicit URLs only**: List each URL separately
   - **Preview deployments**: Add each preview URL to the list if needed

3. **Your Backend URL:**
   ```
   https://rtspoverplay.onrender.com
   ```

### Frontend Deployment (Vercel)

1. **Create a new Project on Vercel**
   - Import your GitHub repository
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

2. **Set Environment Variable on Vercel:**
   ```env
   REACT_APP_API_BASE_URL=https://rtspoverplay.onrender.com
   ```

3. **Deploy:**
   - Push to main branch to trigger automatic deployment
   - Vercel will build and deploy automatically

### Update CORS After Deployment

After deploying to Vercel, update the `CORS_ORIGINS` on Render:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CORS_ORIGINS`:
   ```
   http://localhost:3000,https://your-actual-vercel-url.vercel.app
   ```
3. Save changes (service will restart automatically)

### Verification

**Test Local Setup:**
1. Start both backend and frontend locally
2. Open http://localhost:3000
3. Check browser console - API calls should go to `http://localhost:5000`

**Test Production Setup:**
1. Visit your Vercel URL
2. Open DevTools → Network tab
3. Verify API calls go to `https://rtspoverplay.onrender.com`
4. Check for CORS errors (there should be none!)

## 📖 API Documentation

Complete API documentation available in [`API_DOCS.md`](API_DOCS.md)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/stream/` | Start RTSP stream |
| DELETE | `/api/stream/` | Stop RTSP stream |
| GET | `/api/stream/status` | Get stream status |
| GET | `/api/overlays/` | Get all overlays |
| POST | `/api/overlays/` | Create overlay |
| PUT | `/api/overlays/{id}` | Update overlay |
| DELETE | `/api/overlays/{id}` | Delete overlay |

### Example API Call

```bash
# Check API health
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "healthy",
  "message": "RTSP Overlay API is running"
}
```

## 🔧 Troubleshooting

### Backend Not Starting

**Problem:** Flask doesn't start or shows errors

**Solution:**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Shows Errors

**Problem:** "Cannot resolve 'axios'" or "Cannot resolve 'hls.js'"

**Solution:**
```bash
cd frontend
npm install axios hls.js
npm start
```

### Stream Not Loading

**Problem:** Video player shows "Stream Error"

**Possible Causes:**
1. **Backend not running** → Start Flask (see above)
2. **FFmpeg not in PATH** → Verify FFmpeg installation
3. **RTSP stream too slow** → Use `rtsp://rtsp.me/abcd1234/` instead
4. **Stream not started** → Click "Start Stream" button first

**Solution:**
- Ensure both backend (port 5000) and frontend (port 3000) are running
- Use the faster RTSP.ME test stream
- Wait 10-15 seconds after clicking "Start Stream"

### MongoDB Connection Error

**Problem:** Backend shows "Cannot connect to MongoDB"

**Solution:**
```bash
# Windows
net start MongoDB

# Or start manually
mongod
```

### CORS Errors in Production

**Problem:** Frontend can't connect to backend in production

**Solution:**
1. Verify `CORS_ORIGINS` on Render includes your Vercel URL
2. Restart Render service after updating environment variables
3. Clear browser cache and reload
4. Ensure URLs don't have trailing slashes

### Environment Variables Not Loading

**Frontend:**
- Environment variables MUST start with `REACT_APP_`
- Rebuild after changing `.env` files: `npm run build`
- On Vercel, redeploy after changing environment variables

**Backend:**
- Verify `.env` file exists in `backend/` directory
- On Render, check Environment tab in dashboard
- Restart service after updating variables

### Wrong Backend URL Being Used

**Check:**
```javascript
// In browser console
console.log(process.env.REACT_APP_API_BASE_URL)
```

**Fix:**
- **Local:** Check `frontend/.env.development`
- **Production:** Check Vercel environment variables

## 📁 Project Structure

```
rtspoverplay/
├── backend/                    # Flask API server
│   ├── routes/                # API route handlers
│   │   ├── overlays.py        # Overlay CRUD operations
│   │   └── stream.py          # RTSP streaming logic
│   ├── stream/                # HLS stream output directory
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (create this)
│
├── frontend/                   # React client application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── VideoPlayer.jsx        # HLS video player
│   │   │   ├── OverlayControls.jsx    # Add/edit overlays
│   │   │   ├── OverlayManager.jsx     # Manage overlays
│   │   │   └── StreamControls.jsx     # RTSP stream control
│   │   ├── pages/
│   │   │   └── LandingPage.jsx        # Main application page
│   │   ├── config.js          # API configuration
│   │   ├── App.js             # Root React component
│   │   └── index.js           # React entry point
│   ├── public/                # Static assets
│   ├── .env.development       # Development environment
│   ├── .env.production        # Production environment
│   ├── package.json           # Node dependencies
│   └── README.md              # Frontend docs
│
├── API_DOCS.md                # Complete API documentation
├── USER_GUIDE.md              # Detailed user guide
├── README.md                  # This file
├── start-backend.bat          # Windows backend starter
└── start-frontend.bat         # Windows frontend starter
```

## 🧪 Testing RTSP URLs

The application includes test RTSP URLs for development:

### 1. RTSP.ME Test Stream (Recommended)
   ```
   rtsp://rtsp.me/abcd1234/
   ```
- ✅ Public test stream
- ✅ Fast and reliable
- ✅ No authentication required

### 2. DevLine Test Stream (Slow)
   ```
   rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0
   ```
- ⚠️ Very slow (0.02x speed)
- ⚠️ Not suitable for real-time streaming
- ⚠️ Only use for testing connectivity

### 3. Your Own RTSP Camera
```
rtsp://username:password@camera-ip:port/stream
```
Example:
```
rtsp://admin:password123@192.168.1.100:554/stream1
```

## 🌟 Features in Detail

### Video Streaming
- RTSP to HLS conversion using FFmpeg
- Low-latency streaming configuration
- Browser-compatible video playback
- Real-time stream status monitoring
- Support for various RTSP formats

### Overlay System
- Dynamic text overlay creation
- Real-time positioning and editing
- Customizable styling options
- Persistent storage in MongoDB
- Multiple overlays support
- Preset position shortcuts

### User Interface
- Modern, responsive design
- Tabbed interface for easy navigation
- Real-time preview of overlays
- Mobile-friendly controls
- Intuitive overlay management

### Environment Management
- Automatic environment detection
- Seamless localhost/production switching
- No code changes needed between environments
- CORS properly configured
- Secure and scalable

## 🔍 Installation Verification

After installation, verify everything is working:

```bash
# Check Node.js
node --version

# Check Python
python --version

# Check MongoDB (should show version if running)
mongod --version

# Check FFmpeg
ffmpeg -version
```

## ⚡ Performance Tips

### For Better Streaming Performance:

1. **Use appropriate video resolutions**: Lower resolution streams use less bandwidth
2. **Optimize network**: Use wired connection for stable streaming
3. **Close unused applications**: Free up system resources
4. **Monitor FFmpeg**: Current settings are optimized for low latency
5. **Database optimization**: Ensure MongoDB is properly indexed

### FFmpeg Settings

Current FFmpeg configuration is optimized for:
- Low latency streaming (< 2 seconds)
- Browser compatibility (HLS format)
- Reasonable CPU usage
- Automatic quality adaptation

## 🌐 Browser Compatibility

**Recommended:**
- Chrome/Edge (best performance)
- Firefox (full support)
- Safari (native HLS support)

**Mobile:**
- iOS Safari (native HLS)
- Android Chrome (full support)
- Mobile Firefox (full support)

**Note:** All modern browsers are supported via HLS.js library.

## 🔐 Security Considerations

### For Production Deployment:

**Essential Security Measures:**

1. **Authentication**: Add API authentication for production
   ```python
   # Example: Add token-based authentication
   from flask_jwt_extended import JWTManager
   ```

2. **HTTPS**: Always use HTTPS in production
   - Configure SSL certificates on Render
   - Ensure Vercel uses HTTPS (automatic)

3. **Environment Variables**: Never commit sensitive data
   - Use `.env` files for local development
   - Use platform environment variables for production

4. **CORS**: Restrict allowed origins
   ```python
   # Production: Only allow your frontend domain
   CORS_ORIGINS=https://your-app.vercel.app
   ```

5. **Rate Limiting**: Implement rate limiting to prevent abuse
   ```python
   from flask_limiter import Limiter
   ```

6. **Input Validation**: Validate all RTSP URLs and overlay data
   - Prevent injection attacks
   - Sanitize user inputs

7. **MongoDB Security**:
   - Use authentication on MongoDB
   - Use MongoDB Atlas with proper access controls
   - Regularly backup your data

### Security Checklist:

- [ ] API authentication implemented
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] MongoDB secured with authentication
- [ ] Regular security updates

## 🚨 Reporting Issues

When reporting issues, please include:

- **Operating System**: Windows/macOS/Linux version
- **Browser**: Name and version
- **RTSP Source**: Camera/stream details (if applicable)
- **Error Messages**: From both backend logs and browser console
- **Steps to Reproduce**: How to recreate the issue
- **Screenshots**: If applicable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [HLS.js](https://github.com/video-dev/hls.js/) for browser video streaming
- [React](https://reactjs.org/) for the frontend framework
- [Flask](https://flask.palletsprojects.com/) for the backend API
- [MongoDB](https://www.mongodb.com/) for data storage
- [FFmpeg](https://ffmpeg.org/) for video processing

## 📞 Support

For support and questions:
- Review this comprehensive README
- Check the [API Documentation](API_DOCS.md) for technical details
- Create an issue in the repository for bugs or feature requests
- Review troubleshooting section above

## 🎯 Project URLs

- **Frontend (Local):** http://localhost:3000
- **Backend (Local):** http://localhost:5000
- **Backend (Production):** https://rtspoverplay.onrender.com
- **API Health:** http://localhost:5000/api/health
- **Stream Status:** http://localhost:5000/api/stream/status

## ✨ Summary

✅ **Dual environment support** - Works locally and in production  
✅ **Automatic configuration** - No manual URL changes needed  
✅ **Easy deployment** - Deploy to Vercel and Render  
✅ **Complete API** - Full REST API for all operations  
✅ **Real-time overlays** - Dynamic text overlay management  
✅ **Production ready** - Fully configured and tested  

---

**Built with ❤️ for real-time video streaming and overlay management**
