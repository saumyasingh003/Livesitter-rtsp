import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaPlay,
  FaStop,
  FaPlug,
  FaQuestionCircle,
  FaClock,
  FaLink,
} from "react-icons/fa";

const StreamControls = ({ onStreamStatusChange }) => {
  const [rtspUrl, setRtspUrl] = useState(
    "rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0"
  );
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [streamStatus, setStreamStatus] = useState({
    is_streaming: false,
    rtsp_url: null,
    start_time: null,
    uptime: null,
  });
  const [message, setMessage] = useState("");

  const rtspPresets = [
    {
      name: "RTSP.ME Demo",
      url: "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov",
      icon: "🎬",
    },
    {
      name: "DevLine Camera",
      url: "rtsp://8.devline.ru:9784/cameras/18/streaming/sub?authorization=Basic%20YWRtaW46&audio=0",
      icon: "📹",
    },
    { name: "Custom URL", url: "", icon: "✏️" },
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
    return url.toLowerCase().startsWith("rtsp://");
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
        rtsp_url: rtspUrl.trim(),
      });

      if (response.data.success) {
        setMessage("Stream started successfully!");
        setStreamStatus({
          is_streaming: true,
          rtsp_url: rtspUrl,
          start_time: new Date().toISOString(),
          uptime: "00:00:00",
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
        rtsp_url: rtspUrl.trim(),
      });

      if (response.data.success) {
        setMessage("✅ Connection test successful! RTSP URL is valid.");
      } else {
        setMessage(`❌ Connection test failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setMessage(
        `❌ Connection test failed: ${
          error.response?.data?.error || error.message
        }`
      );
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
          uptime: null,
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-4 border-b border-gray-200/50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-1.5 rounded-lg">
            <FaPlay size={14} />
          </span>
          Stream Control
        </h3>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            streamStatus.is_streaming
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              streamStatus.is_streaming
                ? "bg-emerald-500 animate-pulse"
                : "bg-gray-400"
            }`}
          ></span>
          {streamStatus.is_streaming ? "Live" : "Offline"}
        </div>
      </div>

      {/* Stream Info */}
      {streamStatus.is_streaming && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 space-y-2 border border-emerald-100">
          <div className="flex items-start gap-2 text-xs">
            <FaLink className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-700">
                RTSP Source:
              </span>
              <p className="text-emerald-600 break-all mt-0.5">
                {streamStatus.rtsp_url}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaClock className="text-emerald-500 flex-shrink-0" />
            <span className="font-semibold text-emerald-700">Started:</span>
            <span className="text-emerald-600">
              {new Date(streamStatus.start_time).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-700">⏱️ Uptime:</span>
            <span className="text-emerald-600 font-mono">
              {streamStatus.uptime || "00:00:00"}
            </span>
          </div>
        </div>
      )}

      {/* RTSP URL Input */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="rtsp-url"
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            RTSP URL
          </label>
          <input
            id="rtsp-url"
            type="text"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://your-camera-ip:port/stream"
            className="input-field text-sm py-2.5 px-3 bg-white/50 border-gray-200 focus:border-pink-400"
          />
        </div>

        {/* Preset URLs */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Quick Select
          </label>
          <div className="space-y-1.5">
            {rtspPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm flex items-center gap-2 ${
                  rtspUrl === preset.url
                    ? "border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 font-semibold shadow-sm"
                    : "border-gray-200 bg-white/50 text-gray-600 hover:border-pink-300 hover:bg-pink-50/50"
                }`}
                onClick={() => handlePresetSelect(preset.url)}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
                {rtspUrl === preset.url && (
                  <span className="ml-auto text-pink-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            message.includes("success") || message.includes("✅")
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : message.includes("Testing")
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.includes("Testing") && (
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          )}
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!streamStatus.is_streaming ? (
          <button
            onClick={handleStartStream}
            disabled={isStarting || !rtspUrl.trim()}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white 
                       bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 
                       hover:from-pink-600 hover:via-pink-700 hover:to-purple-700
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-pink-500/25
                       transform hover:-translate-y-0.5 active:translate-y-0
                       flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Starting Stream...</span>
              </>
            ) : (
              <>
                <FaPlay size={12} />
                <span>Start Stream</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            disabled={isStopping}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white 
                       bg-gradient-to-r from-red-500 to-red-600 
                       hover:from-red-600 hover:to-red-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25
                       transform hover:-translate-y-0.5 active:translate-y-0
                       flex items-center justify-center gap-2"
          >
            {isStopping ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Stopping...</span>
              </>
            ) : (
              <>
                <FaStop size={12} />
                <span>Stop Stream</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={handleTestConnection}
          disabled={isTesting || !rtspUrl.trim()}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-gray-700 
                     bg-gray-100 hover:bg-gray-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200
                     flex items-center justify-center gap-2 border border-gray-200"
        >
          {isTesting ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <FaPlug size={12} />
              <span>Test Connection</span>
            </>
          )}
        </button>
      </div>

      {/* Help Section */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-pink-600 transition-colors duration-200 flex items-center gap-2">
          <FaQuestionCircle />
          Need help with RTSP URLs?
        </summary>
        <div className="mt-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          <p className="text-xs text-gray-700 mb-2">
            <strong className="text-pink-700">Format:</strong>{" "}
            rtsp://username:password@camera-ip:port/stream
          </p>
          <p className="text-xs text-gray-700 mb-2">
            <strong className="text-pink-700">Common issues:</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1 ml-2">
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              Ensure the RTSP stream is accessible from this server
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              Check firewall settings and port forwarding
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              Verify camera credentials if authentication is required
            </li>
          </ul>
        </div>
      </details>
    </div>
  );
};

export default StreamControls;
