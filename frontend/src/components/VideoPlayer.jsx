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
          backBufferLength: 60,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 8,
          liveDurationInfinity: true,
          maxBufferLength: 20,
          maxMaxBufferLength: 40,
          liveBackBufferLength: 0,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.2,
        });

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setError(null);

          video.volume = 0.5;
          video.muted = false;
          video.controls = true;

          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video started playing successfully");
                setMessage("");
              })
              .catch((error) => {
                console.log("Autoplay blocked, trying muted:", error);
                video.muted = true;
                video
                  .play()
                  .then(() => {
                    console.log("Video started playing muted");
                    setMessage("Click the video to unmute");
                  })
                  .catch((mutedError) => {
                    console.log("Even muted autoplay failed:", mutedError);
                    setMessage("Click the video to start playback");
                  });
              });
          }
        });

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover...");
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover...");
                hlsInstance.recoverMediaError();
                break;
              default:
                console.log("Fatal error, destroying and recreating...");
                setError(`Stream error: ${data.details}`);
                setIsLoading(false);
                break;
            }
          } else {
            console.warn("Non-fatal HLS error:", data);
          }
        });

        hlsInstance.on(Hls.Events.FRAG_LOAD_ERROR, (event, data) => {
          console.warn("Fragment load error:", data);
        });

        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log("Level switched to:", data.level);
        });

        hlsInstance.on(Hls.Events.BUFFER_STALLED, () => {
          console.warn("Buffer stalled - trying to recover");
          hlsInstance.startLoad();
        });

        hlsInstance.loadSource(`${API_BASE_URL}/stream/out.m3u8`);
        hlsInstance.attachMedia(video);

        hlsRef.current = hlsInstance;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = `${API_BASE_URL}/stream/out.m3u8`;
        video.volume = 0.5;
        video.muted = false;
        video.controls = true;
        setIsLoading(false);

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Safari video started playing successfully");
              setMessage("");
            })
            .catch((error) => {
              console.log("Safari autoplay blocked, trying muted:", error);
              video.muted = true;
              video
                .play()
                .then(() => {
                  console.log("Safari video started playing muted");
                  setMessage("Click the video to unmute");
                })
                .catch((mutedError) => {
                  console.log("Safari even muted autoplay failed:", mutedError);
                  setMessage("Click the video to start playback");
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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
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
        if (video.paused) {
          await video.play();
          setMessage("");
          console.log("Video started playing after user interaction");
        } else {
          video.pause();
          console.log("Video paused after user interaction");
        }

        if (video.muted) {
          video.muted = false;
          video.volume = 0.5;
          setMessage("");
          console.log("Video unmuted after user interaction");
        }
      } catch (error) {
        console.log("Error handling video click:", error);
        setMessage("Unable to start video playback");
      }
    }
  };

  const getOverlayType = (overlay) => {
    return overlay.type || (overlay.imageUrl ? "image" : "text");
  };

  const renderOverlay = (overlay) => {
    const overlayType = getOverlayType(overlay);

    if (overlayType === "image") {
      return (
        <div
          key={overlay._id}
          className="overlay-item"
          style={{
            top: overlay.top,
            left: overlay.left,
            padding: 0,
            backgroundColor: "transparent",
            border: "none",
          }}
          onMouseDown={(e) => handleOverlayMouseDown(e, overlay._id)}
          onMouseUp={(e) => handleOverlayMouseUp(e, overlay._id)}
          title={`Image Overlay`}
        >
          <img
            src={overlay.imageUrl}
            alt="Overlay"
            style={{
              width: overlay.width || "100px",
              height: overlay.height || "100px",
              opacity: overlay.opacity || 1,
              borderRadius: overlay.borderRadius || "0px",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      );
    }

    // Text overlay
    return (
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
    );
  };

  if (error) {
    return (
      <div className="video-container flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        <div className="text-center text-white p-6 lg:p-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-red-400">Stream Error</h3>
          <p className="text-sm text-gray-300 mb-4 max-w-sm mx-auto">{error}</p>
          <p className="text-xs text-gray-400">
            Please ensure the RTSP stream is running on the backend.
          </p>
        </div>
      </div>
    );
  }

  if (!isStreaming) {
    return (
      <div className="video-container flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        <div className="text-center text-white p-6 lg:p-8">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
              <span className="text-5xl">📹</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            No Stream Active
          </h3>
          <p className="text-sm text-gray-300/80 max-w-xs mx-auto">
            Enter an RTSP URL and start streaming to view the video feed
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></span>
            Waiting for stream connection...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-container relative" ref={containerRef}>
      <div className="relative w-full">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-black/95 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="relative">
                <div className="w-12 h-12 mx-auto mb-4 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-12 h-12 mx-auto border-3 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <p className="text-base font-medium bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Loading stream...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Connecting to video source
              </p>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          controls
          playsInline
          muted={false}
          className="w-full h-full object-cover rounded-xl cursor-pointer shadow-2xl"
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              video.volume = 0.5;
              video.muted = false;
            }
          }}
        />

        {/* User Interaction Message */}
        {message && (
          <div
            className="absolute bottom-14 left-1/2 transform -translate-x-1/2 
                       bg-gradient-to-r from-gray-900/90 to-gray-800/90 
                       text-white px-5 py-2.5 rounded-xl text-sm 
                       backdrop-blur-md border border-white/10 
                       cursor-pointer hover:bg-gray-800/95 
                       transition-all duration-300 hover:scale-105
                       shadow-xl"
            onClick={handleVideoClick}
          >
            <p className="m-0 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              {message}
            </p>
          </div>
        )}

        {/* LIVE Indicator */}
        {isStreaming && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-red-400/30">
            <div className="relative">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            <span className="tracking-widest">LIVE</span>
          </div>
        )}

        {/* Overlay Count Badge */}
        {overlays.length > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg backdrop-blur-sm border border-purple-400/30">
            <span>🎨</span>
            <span>
              {overlays.length} Overlay{overlays.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Overlays Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {overlays.map(renderOverlay)}
      </div>
    </div>
  );
};

export default VideoPlayer;
