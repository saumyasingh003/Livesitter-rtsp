# RTSP Overlay API Documentation

## Overview
The RTSP Overlay API provides endpoints for managing video overlays and streaming RTSP content. The API supports creating, reading, updating, and deleting text overlays that can be positioned on video streams.

## Base URL
```
http://localhost:5000
```

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

## Endpoints

### Health Check
Check if the API is running and healthy.

**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "message": "RTSP Overlay API is running"
}
```

---

### Stream Management

#### Start RTSP Stream
Start streaming from an RTSP URL and convert it to HLS format for browser playback.

**POST** `/api/stream/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "rtsp_url": "rtsp://your-camera-ip:port/stream"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Stream started successfully",
  "stream_url": "/stream/out.m3u8",
  "rtsp_url": "rtsp://your-camera-ip:port/stream"
}
```

**Response (Error):**
```json
{
  "error": "RTSP URL is required"
}
```

#### Stop RTSP Stream
Stop the currently running RTSP stream.

**DELETE** `/api/stream/`

**Response (Success):**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

**Response (Error):**
```json
{
  "error": "No active stream to stop"
}
```

#### Get Stream Status
Get the current status of the RTSP stream.

**GET** `/api/stream/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "is_streaming": true,
    "rtsp_url": "rtsp://your-camera-ip:port/stream",
    "stream_url": "/stream/out.m3u8",
    "start_time": "2024-01-01T12:00:00.000Z",
    "uptime": "01:23:45"
  }
}
```

---

### Overlay Management

#### Create Overlay
Create a new text overlay for the video stream.

**POST** `/api/overlays/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Hello World",
  "top": "20px",
  "left": "30px",
  "color": "#ffffff",
  "fontSize": "16px",
  "backgroundColor": "rgba(0,0,0,0.5)"
}
```

**Required Fields:**
- `text` (string): The text content of the overlay
- `top` (string): CSS top position (e.g., "20px", "10%")
- `left` (string): CSS left position (e.g., "30px", "50%")
- `color` (string): Text color in hex format (e.g., "#ffffff")
- `fontSize` (string): Font size with CSS unit (e.g., "16px")

**Optional Fields:**
- `backgroundColor` (string): Background color (default: "rgba(0,0,0,0.5)")

**Response (Success):**
```json
{
  "success": true,
  "message": "Overlay created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "text": "Hello World",
    "top": "20px",
    "left": "30px",
    "color": "#ffffff",
    "fontSize": "16px",
    "backgroundColor": "rgba(0,0,0,0.5)"
  }
}
```

**Response (Error):**
```json
{
  "error": "Missing required field: text"
}
```

#### Get All Overlays
Retrieve all overlays.

**GET** `/api/overlays/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "text": "Hello World",
      "top": "20px",
      "left": "30px",
      "color": "#ffffff",
      "fontSize": "16px"
    }
  ],
  "count": 1
}
```

#### Update Overlay
Update an existing overlay by ID.

**PUT** `/api/overlays/{overlay_id}`

**Parameters:**
- `overlay_id` (string): The MongoDB ObjectId of the overlay

**Headers:**
```
Content-Type: application/json
```

**Request Body:** (partial update supported)
```json
{
  "text": "Updated Text",
  "top": "50px",
  "color": "#ff0000"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Overlay updated successfully"
}
```

**Response (Error):**
```json
{
  "error": "Overlay not found"
}
```

#### Delete Overlay
Delete an overlay by ID.

**DELETE** `/api/overlays/{overlay_id}`

**Parameters:**
- `overlay_id` (string): The MongoDB ObjectId of the overlay

**Response (Success):**
```json
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Overlay not found"
}
```

---

### Stream Files
Serve HLS stream files for video playback.

**GET** `/stream/{filename}`

**Parameters:**
- `filename` (string): The name of the HLS file (e.g., "out.m3u8", "segment_001.ts")

**Usage:**
The HLS stream can be played in browsers using the URL:
```
http://localhost:5000/stream/out.m3u8
```

---

## Data Types

### Overlay Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "text": "Hello World",
  "top": "20px",
  "left": "30px",
  "color": "#ffffff",
  "fontSize": "16px",
  "backgroundColor": "rgba(0,0,0,0.5)"
}
```

**Fields:**
- `_id` (string): MongoDB ObjectId
- `text` (string): The overlay text content
- `top` (string): CSS top position
- `left` (string): CSS left position
- `color` (string): Text color (hex format)
- `fontSize` (string): Font size with CSS unit
- `backgroundColor` (string): Background color (optional)

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid data)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error description message"
}
```

Success responses (except GET requests) follow this format:
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

---

## Rate Limiting
Currently, no rate limiting is implemented.

## CORS
The API supports CORS for cross-origin requests from `http://localhost:3000` (React development server).

---

## Examples

### Using curl

#### Create an overlay:
```bash
curl -X POST http://localhost:5000/api/overlays/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Live Stream",
    "top": "10px",
    "left": "10px",
    "color": "#ffffff",
    "fontSize": "24px"
  }'
```

#### Start a stream:
```bash
curl -X POST http://localhost:5000/api/stream/ \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://admin:password@192.168.1.100:554/stream"
  }'
```

#### Get all overlays:
```bash
curl http://localhost:5000/api/overlays/
```

---

## Dependencies
- Flask 2.3.3
- Flask-CORS 4.0.0
- PyMongo 4.5.0
- FFmpeg (for RTSP to HLS conversion)

## Notes
- MongoDB must be running on `mongodb://localhost:27017`
- FFmpeg must be installed and accessible in the system PATH
- The API serves HLS streams that can be played in modern browsers
- Overlays are stored in MongoDB and rendered client-side
