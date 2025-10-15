import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer";
import OverlayControls from "../components/OverlayControls";
import OverlayManager from "../components/OverlayManager";
import StreamControls from "../components/StreamControls";
import { API_BASE_URL } from "../config";

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

  const tabs = [
    { id: "stream", label: "Stream Control", icon: "" },
    { id: "overlays", label: "Add Overlay", icon: "" },
    { id: "manage", label: "Manage Overlays", icon: "" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-pink-800 to-pink-700 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>


      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-white">
          <div className="mb-2 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 gradient-text animate-pulse bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              LiveSitter
            </h1>
            <span className="text-sm sm:text-base lg:text-lg font-light tracking-widest uppercase opacity-80">
              RTSP Professional
            </span>
          </div>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-2xl mx-auto px-4">
            Real-time video streaming with dynamic text overlays
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 sm:gap-6 lg:gap-8">
          {/* Controls Section */}
          <div className="glass-card-inset rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden order-2 xl:order-1">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-6 sm:mb-8 p-2 bg-gray-100/50 rounded-xl sm:rounded-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button flex-1 cursor-pointer ${
                    activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-base sm:text-lg">{tab.icon}</span>
                  <span className="text-xs sm:text-sm lg:text-base">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === "stream" && (
                <StreamControls onStreamStatusChange={handleStreamStatusChange} />
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

          {/* Video Section */}
          <div className="video-container order-1 xl:order-2">
            <VideoPlayer
              overlays={overlays}
              isStreaming={isStreaming}
              onOverlayMove={(overlayId, isDragging) => {
                console.log("Overlay drag:", overlayId, isDragging);
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-xl border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center text-white">
          <p className="text-xs sm:text-sm opacity-80">
            &copy; 2025 LiveSitter RTSP Professional
          </p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a 
              href="https://github.com/rooter09/rtspoverplay" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm opacity-80 hover:opacity-100 transition-opacity duration-200 hover:text-pink-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
