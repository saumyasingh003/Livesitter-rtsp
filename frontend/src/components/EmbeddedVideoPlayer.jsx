import React from "react";

const EmbeddedVideoPlayer = ({ overlays = [] }) => {
  return (
    <div className="video-player-container">
      <div className="video-wrapper" style={{ position: "relative" }}>
        <iframe
          width="800"
          height="600"
          src="https://rtsp.me/embed/iHD6RikF/"
          frameBorder="0"
          title="RTSP Stream Player"
          allowFullScreen
          style={{
            width: "100%",
            height: "600px",
            borderRadius: "8px"
          }}
        />
        
        {/* Render overlays */}
        <div className="overlays-container" style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none"
        }}>
          {overlays.map((overlay) => (
            <div
              key={overlay._id}
              className="overlay-item"
              style={{
                position: "absolute",
                top: overlay.top,
                left: overlay.left,
                fontSize: overlay.fontSize,
                color: overlay.color,
                backgroundColor: overlay.backgroundColor || "rgba(0,0,0,0.5)",
                padding: "4px 8px",
                borderRadius: "4px",
                userSelect: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                zIndex: 1000,
                pointerEvents: "auto"
              }}
              title={`Overlay: ${overlay.text}`}
            >
              {overlay.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmbeddedVideoPlayer;
