import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const StreamControls = ({ onStreamStatusChange }) => {
  const [rtspUrl, setRtspUrl] = useState("rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0");
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [streamStatus, setStreamStatus] = useState({
    is_streaming: false,
    rtsp_url: null,
    start_time: null,
    uptime: null
  });
  const [message, setMessage] = useState("");


  const rtspPresets = [
    { name: "RTSP.ME Test Stream", url: "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov" },
    { name: "DevLine Test Stream", url: "rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0" },
    { name: "Custom URL", url: "" }
  ];

  const checkStreamStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stream/status`);
      if (response.data.success) {
        setStreamStatus(response.data.data);
        if (onStreamStatusChange) {
          onStreamStatusChange(response.data.data.is_streaming);
        }
      }
    } catch (error) {
      console.error("Error checking stream status:", error);
    }
  }, [onStreamStatusChange]);

  useEffect(() => {

    checkStreamStatus();


    const interval = setInterval(checkStreamStatus, 5000);

    return () => clearInterval(interval);
  }, [checkStreamStatus]);

  const validateRtspUrl = (url) => {

    return url.toLowerCase().startsWith('rtsp://');
  };

  const handleStartStream = async () => {
    if (!rtspUrl.trim()) {
      setMessage("Please enter an RTSP URL");
      return;
    }

    if (!validateRtspUrl(rtspUrl)) {
      setMessage("Please enter a valid RTSP URL (must start with rtsp://)");
      return;
    }

    setIsStarting(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/stream/`, {
        rtsp_url: rtspUrl.trim()
      });

      if (response.data.success) {
        setMessage("Stream started successfully!");
        setStreamStatus({
          is_streaming: true,
          rtsp_url: rtspUrl,
          start_time: new Date().toISOString(),
          uptime: "00:00:00"
        });
        if (onStreamStatusChange) {
          onStreamStatusChange(true);
        }
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      setMessage(
        error.response?.data?.error ||
        "Failed to start stream. Please check the RTSP URL and try again."
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!rtspUrl.trim()) {
      setMessage("Please enter an RTSP URL to test");
      return;
    }

    if (!validateRtspUrl(rtspUrl)) {
      setMessage("Please enter a valid RTSP URL (must start with rtsp://)");
      return;
    }

    setIsTesting(true);
    setMessage("Testing connection...");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/stream/test`, {
        rtsp_url: rtspUrl.trim()
      });
      
      if (response.data.success) {
        setMessage(" Connection test successful! RTSP URL is valid.");
      } else {
        setMessage(` Connection test failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setMessage(`Connection test failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStopStream = async () => {
    setIsStopping(true);
    setMessage("");

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/stream/`);

      if (response.data.success) {
        setMessage("Stream stopped successfully!");
        setStreamStatus({
          is_streaming: false,
          rtsp_url: null,
          start_time: null,
          uptime: null
        });
        if (onStreamStatusChange) {
          onStreamStatusChange(false);
        }
      }
    } catch (error) {
      console.error("Error stopping stream:", error);
      setMessage(
        error.response?.data?.error ||
        "Failed to stop stream. Please try again."
      );
    } finally {
      setIsStopping(false);
    }
  };

  const handlePresetSelect = (presetUrl) => {
    setRtspUrl(presetUrl);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pb-2 sm:pb-3 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">RTSP Stream Control</h3>
        <div className={`status-indicator ${streamStatus.is_streaming ? 'status-active' : 'status-inactive'} self-start sm:self-auto text-xs`}>
          {streamStatus.is_streaming ? '🟢 Streaming' : '🔴 Stopped'}
        </div>
      </div>

      {/* Stream Info */}
      {streamStatus.is_streaming && (
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1">
          <div className="text-xs">
            <span className="font-semibold text-gray-700">RTSP:</span>
            <span className="ml-1 text-gray-600 break-all">{streamStatus.rtsp_url}</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gray-700">Stream:</span>
            <span className="ml-1 text-gray-600 break-all">{API_BASE_URL}{streamStatus.stream_url}</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gray-700">Started:</span>
            <span className="ml-1 text-gray-600">{new Date(streamStatus.start_time).toLocaleString()}</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gray-700">Uptime:</span>
            <span className="ml-1 text-gray-600">{streamStatus.uptime || "00:00:00"}</span>
          </div>
        </div>
      )}

    
      <div className="space-y-2 sm:space-y-3">
        <div>
          <label htmlFor="rtsp-url" className="block text-xs font-semibold text-gray-700 mb-1">
            RTSP URL:
          </label>
          <input
            id="rtsp-url"
            type="text"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://your-camera-ip:port/stream"
            className="input-field text-sm py-1.5 px-2"
          />
        </div>


        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Test URLs:</label>
          <div className="space-y-1">
            {rtspPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={`w-full text-left px-2 py-1.5 rounded-lg border-2 transition-all duration-200 text-xs ${
                  rtspUrl === preset.url 
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:bg-pink-50'
                }`}
                onClick={() => handlePresetSelect(preset.url)}
                title={preset.url}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>


      {message && (
        <div className={`message ${message.includes('success') || message.includes('✅') ? 'message-success' : 'message-error'} text-xs py-2 px-3`}>
          {message}
        </div>
      )}


      <div className="space-y-1.5 sm:space-y-2">
        {!streamStatus.is_streaming ? (
          <button
            onClick={handleStartStream}
            disabled={isStarting || !rtspUrl.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm py-2"
          >
            {isStarting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-3 h-3"></div>
                <span className="text-xs">Starting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">▶ Start Stream</span>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            disabled={isStopping}
            className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm py-2"
          >
            {isStopping ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-3 h-3"></div>
                <span className="text-xs">Stopping...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">⏹ Stop Stream</span>
              </div>
            )}
          </button>
        )}

        <button
          onClick={handleTestConnection}
          disabled={isTesting || !rtspUrl.trim()}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm py-2"
        >
          {isTesting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-spinner w-3 h-3"></div>
              <span className="text-xs">Testing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm">Test Connection</span>
            </div>
          )}
        </button>
      </div>


      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-gray-700 hover:text-pink-600 transition-colors duration-200">
          Need help with RTSP URLs?
        </summary>
        <div className="mt-2 p-2 sm:p-3 bg-pink-50 rounded-lg border border-pink-200">
          <p className="text-xs text-pink-800 mb-1">
            <strong>Format:</strong> rtsp://username:password@camera-ip:port/stream
          </p>
          <p className="text-xs text-pink-800 mb-1"><strong>Common issues:</strong></p>
          <ul className="text-xs text-pink-700 space-y-0.5 ml-2">
            <li>• Ensure the RTSP stream is accessible from this server</li>
            <li>• Check firewall settings and port forwarding</li>
            <li>• Verify camera credentials if authentication is required</li>
          </ul>
        </div>
      </details>
    </div>
  );
};

export default StreamControls;
