import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { API_BASE_URL } from "../config";

const VideoPlayer = ({ overlays = [], isStreaming = false, onOverlayMove }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      // Cleanup previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // If not streaming, don't load any video
      if (!isStreaming) {
        setIsLoading(false);
        setError(null);
        return;
      }

      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hlsInstance = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 60,  // Reduced buffer for stability
          liveSyncDurationCount: 3,  // Live stream settings
          liveMaxLatencyDurationCount: 8,  // Reduced for stability
          liveDurationInfinity: true,  // Treat as infinite live stream
          maxBufferLength: 20,  // Smaller buffer for live streaming
          maxMaxBufferLength: 40,  // Reduced max buffer
          liveBackBufferLength: 0,  // Don't keep old segments
          maxBufferSize: 60 * 1000 * 1000,  // 60MB max buffer
          maxBufferHole: 0.5,  // Smaller buffer hole tolerance
          highBufferWatchdogPeriod: 2,  // Check buffer every 2 seconds
          nudgeOffset: 0.1,  // Nudge offset for live sync
          nudgeMaxRetry: 3,  // Max retry attempts
          maxFragLookUpTolerance: 0.2,  // Fragment lookup tolerance
 
        });

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setError(null);
          
          // Ensure video controls are properly initialized
          video.volume = 0.5; // Set to 50% volume
          video.muted = false; // Ensure not muted
          video.controls = true; // Ensure controls are enabled
          
          // Try to play with proper error handling
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('Video started playing successfully');
              setMessage(""); // Clear any previous messages
            }).catch((error) => {
              console.log('Autoplay blocked, trying muted:', error);
              // If autoplay is blocked, try muted
              video.muted = true;
              video.play().then(() => {
                console.log('Video started playing muted');
                // Show user a message to click to unmute
                setMessage('Click the video to unmute');
              }).catch((mutedError) => {
                console.log('Even muted autoplay failed:', mutedError);
                setMessage('Click the video to start playback');
              });
            });
          }
        });

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error, trying to recover...');
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error, trying to recover...');
                hlsInstance.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying and recreating...');
                setError(`Stream error: ${data.details}`);
                setIsLoading(false);
                break;
            }
          } else {
            // Non-fatal errors - log but don't show to user
            console.warn('Non-fatal HLS error:', data);
          }
        });

        // Add fragment loading error handler
        hlsInstance.on(Hls.Events.FRAG_LOAD_ERROR, (event, data) => {
          console.warn('Fragment load error:', data);
          // Don't treat as fatal - let HLS.js handle retry
        });

        // Add level switching handler
        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log('Level switched to:', data.level);
        });

        // Add buffer stalled handler
        hlsInstance.on(Hls.Events.BUFFER_STALLED, () => {
          console.warn('Buffer stalled - trying to recover');
          hlsInstance.startLoad();
        });

        // Load the stream
        hlsInstance.loadSource(`${API_BASE_URL}/stream/out.m3u8`);
        hlsInstance.attachMedia(video);

        hlsRef.current = hlsInstance;

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = `${API_BASE_URL}/stream/out.m3u8`;
        video.volume = 0.5; // Set to 50% volume
        video.muted = false; // Ensure not muted
        video.controls = true; // Ensure controls are enabled
        setIsLoading(false);
        
        // Try to play with proper error handling for Safari
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Safari video started playing successfully');
            setMessage(""); // Clear any previous messages
          }).catch((error) => {
            console.log('Safari autoplay blocked, trying muted:', error);
            video.muted = true;
            video.play().then(() => {
              console.log('Safari video started playing muted');
              setMessage('Click the video to unmute');
            }).catch((mutedError) => {
              console.log('Safari even muted autoplay failed:', mutedError);
              setMessage('Click the video to start playback');
            });
          });
        }
      } else {
        setError("HLS playback not supported in this browser");
        setIsLoading(false);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [isStreaming]);

  // Ensure controls are always visible
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Simply ensure controls attribute is set, let browser handle the rest
      video.controls = true;
    }
  }, []);

  const handleOverlayMouseDown = (e, overlayId) => {
    e.preventDefault();
    if (onOverlayMove) {
      onOverlayMove(overlayId, true);
    }
  };

  const handleOverlayMouseUp = (e, overlayId) => {
    e.preventDefault();
    if (onOverlayMove) {
      onOverlayMove(overlayId, false);
    }
  };

  const handleVideoClick = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        // Toggle play/pause
        if (video.paused) {
          await video.play();
          setMessage("");
          console.log('Video started playing after user interaction');
        } else {
          video.pause();
          console.log('Video paused after user interaction');
        }
        
       
        if (video.muted) {
          video.muted = false;
          video.volume = 0.5; 
          setMessage("");
          console.log('Video unmuted after user interaction');
        }
      } catch (error) {
        console.log('Error handling video click:', error);
        setMessage('Unable to start video playback');
      }
    }
  };


  if (error) {
    return (
      <div className="video-container flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        <div className="text-center text-white p-4 sm:p-6 lg:p-8">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-red-400">Stream Error</h3>
          <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">{error}</p>
          <p className="text-xs sm:text-sm text-gray-400">Please ensure the RTSP stream is running on the backend.</p>
        </div>
      </div>
    );
  }

  if (!isStreaming) {
    return (
      <div className="video-container flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        <div className="text-center text-white p-4 sm:p-6 lg:p-8">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📹</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No Stream Active</h3>
          <p className="text-sm sm:text-base text-gray-300">Please add the URL and start streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-container relative" ref={containerRef}>
      <div className="relative w-full">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 rounded-lg sm:rounded-xl">
            <div className="text-center text-white">
              <div className="loading-spinner w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base lg:text-lg font-medium">Loading stream...</p>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          controls
          playsInline
          muted={false}
          className="w-full h-full object-cover rounded-lg sm:rounded-xl cursor-pointer"
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              video.volume = 0.5;
              video.muted = false;
              // Let browser handle controls naturally
            }
          }}
        />

        {/* User Interaction Message */}
        {message && (
          <div 
            className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-black/90 transition-colors duration-200"
            onClick={handleVideoClick}
          >
            <p className="m-0 font-medium">{message}</p>
          </div>
        )}
        
        {/* LIVE Indicator */}
        {isStreaming && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 sm:gap-2 shadow-lg backdrop-blur-sm">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
            <span className="tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      {/* Overlays Container */}
      <div className="absolute inset-0 pointer-events-none">
        {overlays.map((overlay) => (
          <div
            key={overlay._id}
            className="overlay-item"
            style={{
              top: overlay.top,
              left: overlay.left,
              fontSize: overlay.fontSize,
              color: overlay.color,
              backgroundColor: overlay.backgroundColor || "rgba(0,0,0,0.5)",
            }}
            onMouseDown={(e) => handleOverlayMouseDown(e, overlay._id)}
            onMouseUp={(e) => handleOverlayMouseUp(e, overlay._id)}
            title={`Overlay: ${overlay.text}`}
          >
            {overlay.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
