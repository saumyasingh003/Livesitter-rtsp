import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const OverlayControls = ({ refreshOverlays, isStreaming }) => {
  const [formData, setFormData] = useState({
    text: "",
    top: "20px",
    left: "20px",
    color: "#ffffff",
    fontSize: "16px",
    backgroundColor: "rgba(0,0,0,0.5)"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setMessage("Please enter overlay text");
      return;
    }

    if (!isStreaming) {
      setMessage("Please start the RTSP stream first");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/overlays/`, {
        text: formData.text.trim(),
        top: formData.top,
        left: formData.left,
        color: formData.color,
        fontSize: formData.fontSize,
        backgroundColor: formData.backgroundColor
      });

      if (response.data.success) {
        setMessage("Overlay added successfully!");
        setFormData({
          text: "",
          top: "20px",
          left: "20px",
          color: "#ffffff",
          fontSize: "16px",
          backgroundColor: "rgba(0,0,0,0.5)"
        });

        if (refreshOverlays) {
          refreshOverlays();
        }
      }
    } catch (error) {
      console.error("Error creating overlay:", error);
      setMessage(
        error.response?.data?.error ||
        "Failed to create overlay. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const presets = [
    { name: "Top Left", top: "10px", left: "10px" },
    { name: "Top Center", top: "10px", left: "50%", transform: "translateX(-50%)" },
    { name: "Top Right", top: "10px", right: "10px", left: "auto" },
    { name: "Bottom Left", bottom: "10px", left: "10px", top: "auto" },
    { name: "Bottom Center", bottom: "10px", left: "50%", top: "auto", transform: "translateX(-50%)" },
    { name: "Bottom Right", bottom: "10px", right: "10px", left: "auto", top: "auto" }
  ];

  const applyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      top: preset.top || "20px",
      left: preset.left || "20px"
    }));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pb-2 sm:pb-3 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Add New Overlay</h3>
        {!isStreaming && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-1 rounded-lg text-xs font-medium">
            ⚠️ Start the RTSP stream first to see overlays
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        {/* Text Input */}
        <div>
          <label htmlFor="overlay-text" className="block text-xs font-semibold text-gray-700 mb-1">
            Text:
          </label>
          <input
            id="overlay-text"
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange("text", e.target.value)}
            placeholder="Enter overlay text"
            maxLength={50}
            required
            className="input-field text-sm py-1.5 px-2"
          />
        </div>

        {/* Position Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label htmlFor="top-position" className="block text-xs font-semibold text-gray-700 mb-1">
              Top:
            </label>
            <input
              id="top-position"
              type="text"
              value={formData.top}
              onChange={(e) => handleInputChange("top", e.target.value)}
              placeholder="10px"
              className="input-field text-sm py-1.5 px-2"
            />
          </div>
          <div>
            <label htmlFor="left-position" className="block text-xs font-semibold text-gray-700 mb-1">
              Left:
            </label>
            <input
              id="left-position"
              type="text"
              value={formData.left}
              onChange={(e) => handleInputChange("left", e.target.value)}
              placeholder="10px"
              className="input-field text-sm py-1.5 px-2"
            />
          </div>
        </div>

        {/* Font Size and Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label htmlFor="font-size" className="block text-xs font-semibold text-gray-700 mb-1">
              Font Size:
            </label>
            <select
              id="font-size"
              value={formData.fontSize}
              onChange={(e) => handleInputChange("fontSize", e.target.value)}
              className="input-field text-sm py-1.5 px-2"
            >
              <option value="12px">Small (12px)</option>
              <option value="16px">Medium (16px)</option>
              <option value="20px">Large (20px)</option>
              <option value="24px">Extra Large (24px)</option>
            </select>
          </div>
          <div>
            <label htmlFor="text-color" className="block text-xs font-semibold text-gray-700 mb-1">
              Color:
            </label>
            <input
              id="text-color"
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              className="w-full h-7 sm:h-8 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label htmlFor="background-color" className="block text-xs font-semibold text-gray-700 mb-1">
            Background:
          </label>
          <input
            id="background-color"
            type="color"
            value={formData.backgroundColor}
            onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
            className="w-full h-7 sm:h-8 rounded-lg border border-gray-300 cursor-pointer"
          />
        </div>

        {/* Quick Positions */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quick Positions:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {presets.map((preset, index) => (
              <button
                key={index}
                type="button"
                className="px-2 py-1.5 text-xs border-2 border-gray-200 bg-white text-gray-600 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-200"
                onClick={() => applyPreset(preset)}
                title={`${preset.name}: ${preset.top || 'auto'}, ${preset.left || preset.right || 'auto'}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('success') ? 'message-success' : 'message-error'} text-xs py-2 px-3`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm py-2"
          disabled={isSubmitting || !isStreaming}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-spinner w-3 h-3"></div>
              <span className="text-xs">Adding...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm">✏️ Add Overlay</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default OverlayControls;
