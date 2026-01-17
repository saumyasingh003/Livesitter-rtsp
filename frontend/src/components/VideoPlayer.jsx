import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { API_BASE_URL } from "../config";

const VideoPlayer = ({
  overlays = [],
  isStreaming = false,
  onOverlayUpdate,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const overlayContainerRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Drag and resize state
  const [dragState, setDragState] = useState({
    isDragging: false,
    isResizing: false,
    overlayId: null,
    resizeHandle: null,
    startX: 0,
    startY: 0,
    startTop: 0,
    startLeft: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // Local overlay positions for smooth dragging
  const [localPositions, setLocalPositions] = useState({});

  // Parse CSS value to number (handles px, %, etc.)
  const parseValue = (value, containerSize = 0) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    if (value.includes("%")) {
      return (parseFloat(value) / 100) * containerSize;
    }
    return parseFloat(value) || 0;
  };

  // Convert pixel value to percentage
  const toPercentage = (pixelValue, containerSize) => {
    if (containerSize === 0) return "0%";
    return `${((pixelValue / containerSize) * 100).toFixed(2)}%`;
  };

  // Get container dimensions
  const getContainerDimensions = useCallback(() => {
    if (overlayContainerRef.current) {
      const rect = overlayContainerRef.current.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 0, height: 0 };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback(
    (e, overlayId) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const overlay = overlays.find((o) => o._id === overlayId);
      if (!overlay) return;

      const { width: containerWidth, height: containerHeight } =
        getContainerDimensions();

      setDragState({
        isDragging: true,
        isResizing: false,
        overlayId,
        resizeHandle: null,
        startX: clientX,
        startY: clientY,
        startTop: parseValue(
          localPositions[overlayId]?.top || overlay.top,
          containerHeight,
        ),
        startLeft: parseValue(
          localPositions[overlayId]?.left || overlay.left,
          containerWidth,
        ),
        startWidth: 0,
        startHeight: 0,
      });
    },
    [overlays, localPositions, getContainerDimensions],
  );

  // Handle resize start
  const handleResizeStart = useCallback(
    (e, overlayId, handle) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const overlay = overlays.find((o) => o._id === overlayId);
      if (!overlay) return;

      const { width: containerWidth, height: containerHeight } =
        getContainerDimensions();

      setDragState({
        isDragging: false,
        isResizing: true,
        overlayId,
        resizeHandle: handle,
        startX: clientX,
        startY: clientY,
        startTop: parseValue(
          localPositions[overlayId]?.top || overlay.top,
          containerHeight,
        ),
        startLeft: parseValue(
          localPositions[overlayId]?.left || overlay.left,
          containerWidth,
        ),
        startWidth: parseValue(
          localPositions[overlayId]?.width || overlay.width || "100px",
          containerWidth,
        ),
        startHeight: parseValue(
          localPositions[overlayId]?.height || overlay.height || "100px",
          containerHeight,
        ),
      });
    },
    [overlays, localPositions, getContainerDimensions],
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (e) => {
      if (!dragState.isDragging && !dragState.isResizing) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      const { width: containerWidth, height: containerHeight } =
        getContainerDimensions();

      if (dragState.isDragging) {
        // Calculate new position
        let newLeft = dragState.startLeft + deltaX;
        let newTop = dragState.startTop + deltaY;

        // Constrain to container bounds
        newLeft = Math.max(0, Math.min(newLeft, containerWidth - 50));
        newTop = Math.max(0, Math.min(newTop, containerHeight - 30));

        setLocalPositions((prev) => ({
          ...prev,
          [dragState.overlayId]: {
            ...prev[dragState.overlayId],
            top: `${newTop}px`,
            left: `${newLeft}px`,
          },
        }));
      } else if (dragState.isResizing) {
        let newWidth = dragState.startWidth;
        let newHeight = dragState.startHeight;
        let newLeft = dragState.startLeft;
        let newTop = dragState.startTop;

        const handle = dragState.resizeHandle;

        // Calculate new dimensions based on resize handle
        if (handle.includes("e")) {
          newWidth = Math.max(30, dragState.startWidth + deltaX);
        }
        if (handle.includes("w")) {
          const widthDelta = -deltaX;
          newWidth = Math.max(30, dragState.startWidth + widthDelta);
          newLeft = dragState.startLeft - widthDelta;
        }
        if (handle.includes("s")) {
          newHeight = Math.max(20, dragState.startHeight + deltaY);
        }
        if (handle.includes("n")) {
          const heightDelta = -deltaY;
          newHeight = Math.max(20, dragState.startHeight + heightDelta);
          newTop = dragState.startTop - heightDelta;
        }

        // Constrain to container bounds
        newLeft = Math.max(0, newLeft);
        newTop = Math.max(0, newTop);
        newWidth = Math.min(newWidth, containerWidth - newLeft);
        newHeight = Math.min(newHeight, containerHeight - newTop);

        setLocalPositions((prev) => ({
          ...prev,
          [dragState.overlayId]: {
            ...prev[dragState.overlayId],
            top: `${newTop}px`,
            left: `${newLeft}px`,
            width: `${newWidth}px`,
            height: `${newHeight}px`,
          },
        }));
      }
    },
    [dragState, getContainerDimensions],
  );

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    if (
      (dragState.isDragging || dragState.isResizing) &&
      dragState.overlayId &&
      onOverlayUpdate
    ) {
      const position = localPositions[dragState.overlayId];
      if (position) {
        const overlay = overlays.find((o) => o._id === dragState.overlayId);
        if (overlay) {
          const updatedOverlay = {
            ...overlay,
            top: position.top || overlay.top,
            left: position.left || overlay.left,
          };

          // Include width/height only for image overlays or if resizing
          if (position.width) updatedOverlay.width = position.width;
          if (position.height) updatedOverlay.height = position.height;

          onOverlayUpdate(dragState.overlayId, updatedOverlay);
        }
      }
    }

    setDragState({
      isDragging: false,
      isResizing: false,
      overlayId: null,
      resizeHandle: null,
      startX: 0,
      startY: 0,
      startTop: 0,
      startLeft: 0,
      startWidth: 0,
      startHeight: 0,
    });
  }, [dragState, localPositions, overlays, onOverlayUpdate]);

  // Add global event listeners for drag/resize
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);

      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
      };
    }
  }, [dragState.isDragging, dragState.isResizing, handleMove, handleEnd]);

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

  // Resize handles component
  const ResizeHandles = ({ overlayId, overlayType }) => {
    const handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

    return (
      <>
        {handles.map((handle) => (
          <div
            key={handle}
            className={`resize-handle resize-handle-${handle}`}
            onMouseDown={(e) => handleResizeStart(e, overlayId, handle)}
            onTouchStart={(e) => handleResizeStart(e, overlayId, handle)}
          />
        ))}
      </>
    );
  };

  const renderOverlay = (overlay) => {
    const overlayType = getOverlayType(overlay);
    const isActive = dragState.overlayId === overlay._id;
    const localPos = localPositions[overlay._id] || {};

    if (overlayType === "image") {
      return (
        <div
          key={overlay._id}
          className={`overlay-item overlay-draggable ${isActive ? "overlay-active" : ""}`}
          style={{
            top: localPos.top || overlay.top,
            left: localPos.left || overlay.left,
            width: localPos.width || overlay.width || "100px",
            height: localPos.height || overlay.height || "100px",
            padding: 0,
            backgroundColor: "transparent",
            cursor: dragState.isDragging && isActive ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => handleDragStart(e, overlay._id)}
          onTouchStart={(e) => handleDragStart(e, overlay._id)}
          title="Drag to move, use handles to resize"
        >
          <img
            src={overlay.imageUrl}
            alt="Overlay"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              opacity: overlay.opacity || 1,
              borderRadius: overlay.borderRadius || "0px",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <ResizeHandles overlayId={overlay._id} overlayType={overlayType} />
        </div>
      );
    }

    // Text overlay
    return (
      <div
        key={overlay._id}
        className={`overlay-item overlay-draggable ${isActive ? "overlay-active" : ""}`}
        style={{
          top: localPos.top || overlay.top,
          left: localPos.left || overlay.left,
          width: localPos.width || "auto",
          height: localPos.height || "auto",
          minWidth: "50px",
          minHeight: "20px",
          fontSize: overlay.fontSize,
          color: overlay.color,
          backgroundColor: overlay.backgroundColor || "rgba(0,0,0,0.5)",
          cursor: dragState.isDragging && isActive ? "grabbing" : "grab",
        }}
        onMouseDown={(e) => handleDragStart(e, overlay._id)}
        onTouchStart={(e) => handleDragStart(e, overlay._id)}
        title="Drag to move, use handles to resize"
      >
        <span style={{ pointerEvents: "none", userSelect: "none" }}>
          {overlay.text}
        </span>
        <ResizeHandles overlayId={overlay._id} overlayType={overlayType} />
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
      <div
        ref={overlayContainerRef}
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          pointerEvents:
            dragState.isDragging || dragState.isResizing ? "auto" : "none",
        }}
      >
        {overlays.map(renderOverlay)}

        {/* Drag/Resize Instructions */}
        {overlays.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/80 px-3 py-1.5 rounded-lg text-xs pointer-events-none">
            <span className="flex items-center gap-2">
              <span>✋</span>
              <span>Drag overlays to move • Use corners to resize</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
