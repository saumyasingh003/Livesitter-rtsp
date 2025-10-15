from flask import Flask, jsonify, send_from_directory, Response
from flask_cors import CORS
from routes.overlays import overlays_bp
from routes.stream import stream_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure CORS to support both localhost and production deployments
# Get allowed origins from environment variable (comma-separated)
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
# Strip whitespace from each origin
cors_origins = [origin.strip() for origin in cors_origins]
CORS(app, origins=cors_origins, supports_credentials=True)

app.register_blueprint(overlays_bp, url_prefix="/api/overlays")
app.register_blueprint(stream_bp, url_prefix="/api/stream")

@app.route("/stream/<path:filename>")
def serve_stream(filename):
    stream_dir = os.path.join(os.getcwd(), "stream")
    
    if filename.endswith('.m3u8'):
        # Serve playlist with live streaming headers
        def generate():
            playlist_path = os.path.join(stream_dir, filename)
            if os.path.exists(playlist_path):
                try:
                    with open(playlist_path, 'r') as f:
                        content = f.read()
                    # Ensure no ENDLIST marker for live streams
                    content = content.replace('#EXT-X-ENDLIST', '')
                    # Add live streaming headers if not present
                    if '#EXT-X-VERSION:3' not in content:
                        content = '#EXTM3U\n#EXT-X-VERSION:3\n' + content
                    yield content
                except Exception as e:
                    print(f"Error reading playlist: {e}")
                    yield '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n'
            else:
                yield '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n'
        
        return Response(generate(), 
                       mimetype='application/vnd.apple.mpegurl',
                       headers={
                           'Cache-Control': 'no-cache, no-store, must-revalidate',
                           'Pragma': 'no-cache',
                           'Expires': '0'
                       })
    else:
        # Serve segments with appropriate headers
        response = send_from_directory(stream_dir, filename, mimetype='video/mp2t')
        response.headers['Cache-Control'] = 'public, max-age=10'
        return response

@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "message": "RTSP Overlay API is running"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
