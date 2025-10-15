from flask import Flask, jsonify, send_from_directory, Response
from flask_cors import CORS
from flask_cors import cross_origin
from routes.overlays import overlays_bp
from routes.stream import stream_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# cors_origins = [origin.strip() for origin in cors_origins]

app.register_blueprint(overlays_bp, url_prefix="/api/overlays")
app.register_blueprint(stream_bp, url_prefix="/api/stream")

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
@app.route("/stream/<path:filename>")
def serve_stream(filename):
    stream_dir = os.path.join(os.getcwd(), "stream")
    os.makedirs(stream_dir, exist_ok=True)

    if filename.endswith('.m3u8'):
        def generate():
            path = os.path.join(stream_dir, filename)
            if os.path.exists(path):
                with open(path, 'r') as f:
                    content = f.read()
                content = content.replace('#EXT-X-ENDLIST', '')
                if '#EXT-X-VERSION:3' not in content:
                    content = '#EXTM3U\n#EXT-X-VERSION:3\n' + content
                yield content
            else:
                yield '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n'

        resp = Response(generate(), mimetype='application/vnd.apple.mpegurl')
    else:  # .ts segments
        resp = send_from_directory(stream_dir, filename, mimetype='video/mp2t')

    # Always add CORS for HLS
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "message": "RTSP Overlay API is running"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
