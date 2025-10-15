from flask import Blueprint, jsonify, request
import os
import subprocess
import threading
import time
from datetime import datetime

stream_bp = Blueprint("stream", __name__)

streaming_status = {
    "is_streaming": False,
    "rtsp_url": None,
    "stream_url": "/stream/out.m3u8",
    "start_time": None,
    "process": None
}

@stream_bp.route("/", methods=["POST"])
def start_stream():
    global streaming_status

    try:
        data = request.get_json()

        if not data or "rtsp_url" not in data:
            return jsonify({"error": "RTSP URL is required"}), 400

        rtsp_url = data["rtsp_url"]

        if streaming_status["is_streaming"]:
            return jsonify({"error": "Stream is already running"}), 400

        success = start_ffmpeg_stream(rtsp_url)

        if success:
            streaming_status.update({
                "is_streaming": True,
                "rtsp_url": rtsp_url,
                "start_time": datetime.now().isoformat()
            })

            return jsonify({
                "success": True,
                "message": "Stream started successfully",
                "stream_url": streaming_status["stream_url"],
                "rtsp_url": rtsp_url
            })
        else:
            return jsonify({"error": "Failed to start stream"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stream_bp.route("/", methods=["DELETE"])
def stop_stream():
    global streaming_status

    try:
        if not streaming_status["is_streaming"]:
            return jsonify({"error": "No active stream to stop"}), 400

        success = stop_ffmpeg_stream()

        if success:
            streaming_status.update({
                "is_streaming": False,
                "rtsp_url": None,
                "start_time": None,
                "process": None
            })

            return jsonify({
                "success": True,
                "message": "Stream stopped successfully"
            })
        else:
            return jsonify({"error": "Failed to stop stream"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stream_bp.route("/status", methods=["GET"])
def get_stream_status():
    global streaming_status

    return jsonify({
        "success": True,
        "data": {
            "is_streaming": streaming_status["is_streaming"],
            "rtsp_url": streaming_status["rtsp_url"],
            "stream_url": streaming_status["stream_url"],
            "start_time": streaming_status["start_time"],
            "uptime": calculate_uptime() if streaming_status["is_streaming"] else None
        }
    })

@stream_bp.route("/test", methods=["POST"])
def test_rtsp_connection():
    """Test RTSP connection without starting a full stream"""
    try:
        data = request.get_json()
        if not data or "rtsp_url" not in data:
            return jsonify({"error": "RTSP URL is required"}), 400
        
        rtsp_url = data["rtsp_url"]
        
        # Test connection with a short probe
        test_command = [
            "ffprobe",
            "-rtsp_transport", "tcp",
            "-timeout", "10000000",  # 10 second timeout
            "-i", rtsp_url,
            "-show_entries", "format=duration",
            "-v", "quiet",
            "-of", "csv=p=0"
        ]
        
        result = subprocess.run(test_command, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            return jsonify({
                "success": True,
                "message": "RTSP connection successful",
                "rtsp_url": rtsp_url
            })
        else:
            return jsonify({
                "success": False,
                "error": f"RTSP connection failed: {result.stderr}",
                "rtsp_url": rtsp_url
            }), 400
            
    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "error": "RTSP connection timeout",
            "rtsp_url": rtsp_url
        }), 408
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def start_ffmpeg_stream(rtsp_url):
    try:
        stream_dir = os.path.join(os.getcwd(), "stream")
        os.makedirs(stream_dir, exist_ok=True)
        
        # Enhanced FFmpeg command for stable live streaming (compatible version)
        command = [
            "ffmpeg",
            "-rtsp_transport", "tcp",  # Use TCP for more reliable connection
            "-rtsp_flags", "prefer_tcp",
            "-timeout", "5000000",  # 5 second timeout
            "-i", rtsp_url,
            "-c:v", "libx264",  # Re-encode video for compatibility
            "-preset", "veryfast",  # Balanced speed vs quality
            "-tune", "zerolatency",
            "-g", "50",  # GOP size (keyframe every 50 frames for stability)
            "-sc_threshold", "0",  # Disable scene change detection
            "-b:v", "1000k",  # Lower bitrate for stability
            "-maxrate", "1200k",
            "-bufsize", "2000k",
            "-r", "25",  # Force frame rate for consistency
            "-c:a", "aac",  # Audio codec
            "-b:a", "96k",  # Lower audio bitrate
            "-ar", "44100",  # Audio sample rate
            "-ac", "2",  # Stereo audio
            "-shortest",  # End when shortest stream ends
            "-f", "hls",
            "-hls_time", "3",  # 3 second segments for stability
            "-hls_list_size", "6",  # Keep 6 segments (18 seconds buffer)
            "-hls_flags", "delete_segments+append_list+omit_endlist",  # Live streaming flags
            "-hls_segment_type", "mpegts",
            "-hls_segment_filename", os.path.join(stream_dir, "segment_%03d.ts"),
            "-start_number", "0",
            "-loglevel", "warning",  # Reduce log verbosity
            "-y",  # Overwrite output files
            os.path.join(stream_dir, "out.m3u8")
        ]

        print(f"Starting FFmpeg stream for: {rtsp_url}")
        
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid if os.name != 'nt' else None
        )

        streaming_status["process"] = process

        # Wait for stream to initialize
        time.sleep(4)

        if process.poll() is None:
            # Ensure the playlist is configured for live streaming
            playlist_path = os.path.join(stream_dir, "out.m3u8")
            if os.path.exists(playlist_path):
                # Read and modify the playlist to ensure it's live
                with open(playlist_path, 'r') as f:
                    content = f.read()
                
                # Ensure it has live streaming markers
                if '#EXT-X-ENDLIST' in content:
                    content = content.replace('#EXT-X-ENDLIST', '')
                    with open(playlist_path, 'w') as f:
                        f.write(content)
                    print("✅ Removed ENDLIST marker for live streaming")
            
            print(f"✅ FFmpeg stream started successfully")
            return True
        else:
            stdout, stderr = process.communicate()
            error_msg = stderr.decode() if stderr else "Unknown error"
            print(f"❌ FFmpeg failed: {error_msg}")
            return False

    except Exception as e:
        print(f"❌ Error starting FFmpeg: {str(e)}")
        return False

def stop_ffmpeg_stream():
    try:
        if streaming_status["process"]:
            if os.name == 'nt':
                streaming_status["process"].terminate()
            else:
                os.killpg(os.getpgid(streaming_status["process"].pid), 9)

            streaming_status["process"].wait(timeout=10)

        return True

    except Exception as e:
        print(f"Error stopping FFmpeg: {str(e)}")
        return False

def calculate_uptime():
    if not streaming_status["start_time"]:
        return None

    try:
        start_time = datetime.fromisoformat(streaming_status["start_time"])
        delta = datetime.now() - start_time
        hours, remainder = divmod(int(delta.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    except Exception:
        return None
