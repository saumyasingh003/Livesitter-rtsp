import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer";
import OverlayControls from "../components/OverlayControls";
import OverlayManager from "../components/OverlayManager";
import StreamControls from "../components/StreamControls";
import { API_BASE_URL } from "../config";
import { FaPlay, FaLayerGroup, FaCog, FaGithub, FaVideo } from "react-icons/fa";

const LandingPage = () => {
  const [overlays, setOverlays] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState("stream");

  useEffect(() => {
    fetchOverlays();
  }, []);

  const fetchOverlays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/overlays/`);
      if (response.data.success) {
        setOverlays(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching overlays:", error);
    }
  };

  const handleStreamStatusChange = (streaming) => {
    setIsStreaming(streaming);
  };

  // Handle overlay position/size updates from drag and resize
  const handleOverlayUpdate = async (overlayId, updatedOverlay) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/overlays/${overlayId}`,
        {
          top: updatedOverlay.top,
          left: updatedOverlay.left,
          width: updatedOverlay.width,
          height: updatedOverlay.height,
        },
      );

      if (response.data.success) {
        // Update local state with new positions
        setOverlays((prevOverlays) =>
          prevOverlays.map((overlay) =>
            overlay._id === overlayId
              ? { ...overlay, ...updatedOverlay }
              : overlay,
          ),
        );
        console.log("Overlay position updated successfully");
      }
    } catch (error) {
      console.error("Error updating overlay position:", error);
    }
  };

  const tabs = [
    { id: "stream", label: "Stream", icon: FaPlay },
    { id: "overlays", label: "Overlays", icon: FaLayerGroup },
    { id: "manage", label: "Manage", icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <FaVideo className="text-white text-lg sm:text-xl" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl blur opacity-40 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                  LiveSitter
                </h1>
                <span className="text-[10px] sm:text-xs font-medium text-gray-400 tracking-widest uppercase">
                  RTSP Professional
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm border ${
                isStreaming
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-gray-500/10 border-gray-500/30 text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
                }`}
              ></span>
              {isStreaming ? "Stream Active" : "No Active Stream"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 lg:gap-8">
          {/* Controls Section */}
          <div className="order-2 xl:order-1">
            <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-black/20 p-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-pink-500/90 to-purple-500/90 text-white shadow-lg shadow-purple-500/20 transform scale-[0.98]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon
                      size={14}
                      className={
                        activeTab === tab.id ? "text-white" : "text-gray-500"
                      }
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-5 sm:p-6">
                <div className="animate-fade-in">
                  {activeTab === "stream" && (
                    <StreamControls
                      onStreamStatusChange={handleStreamStatusChange}
                    />
                  )}

                  {activeTab === "overlays" && (
                    <OverlayControls
                      refreshOverlays={fetchOverlays}
                      isStreaming={isStreaming}
                    />
                  )}

                  {activeTab === "manage" && (
                    <OverlayManager
                      overlays={overlays}
                      refreshOverlays={fetchOverlays}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">
                  {overlays.length}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Active Overlays
                </div>
              </div>
              <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">
                  {
                    overlays.filter((o) => o.type === "image" || o.imageUrl)
                      .length
                  }
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Image Overlays
                </div>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="order-1 xl:order-2">
            <div className="relative">
              {/* Glow effect behind video */}
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50"></div>

              <div className="relative">
                <VideoPlayer
                  overlays={overlays}
                  isStreaming={isStreaming}
                  onOverlayUpdate={handleOverlayUpdate}
                />
              </div>
            </div>

            {/* Video Info Bar */}
            {isStreaming && (
              <div className="mt-4 bg-white/[0.05] backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <FaVideo className="text-pink-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Live Stream
                    </div>
                    <div className="text-xs text-gray-400">
                      HLS Streaming via RTSP
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            © 2025 LiveSitter RTSP Professional. Built with ❤️
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/saumyasingh003/Livesitter-rtsp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors duration-200 group"
            >
              <FaGithub className="group-hover:text-pink-400 transition-colors" />
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
