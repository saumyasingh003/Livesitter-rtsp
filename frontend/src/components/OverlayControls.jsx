import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { FaImage, FaFont, FaLink } from "react-icons/fa";

const OverlayControls = ({ refreshOverlays, isStreaming }) => {
  const [overlayType, setOverlayType] = useState("text");

  // Text overlay form data
  const [textFormData, setTextFormData] = useState({
    text: "",
    top: "20px",
    left: "20px",
    color: "#ffffff",
    fontSize: "16px",
    backgroundColor: "rgba(0,0,0,0.5)",
  });

  // Image overlay form data
  const [imageFormData, setImageFormData] = useState({
    imageUrl: "",
    top: "20px",
    left: "20px",
    width: "120px",
    height: "80px",
    opacity: 1,
    borderRadius: "8px",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const handleTextInputChange = (field, value) => {
    setTextFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageInputChange = (field, value) => {
    setImageFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "imageUrl") {
      setImagePreviewError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (overlayType === "text" && !textFormData.text.trim()) {
      setMessage("Please enter overlay text");
      return;
    }

    if (overlayType === "image" && !imageFormData.imageUrl.trim()) {
      setMessage("Please enter an image URL");
      return;
    }

    if (!isStreaming) {
      setMessage("Please start the RTSP stream first");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      let payload;

      if (overlayType === "text") {
        payload = {
          type: "text",
          text: textFormData.text.trim(),
          top: textFormData.top,
          left: textFormData.left,
          color: textFormData.color,
          fontSize: textFormData.fontSize,
          backgroundColor: textFormData.backgroundColor,
        };
      } else {
        payload = {
          type: "image",
          imageUrl: imageFormData.imageUrl.trim(),
          top: imageFormData.top,
          left: imageFormData.left,
          width: imageFormData.width,
          height: imageFormData.height,
          opacity: parseFloat(imageFormData.opacity),
          borderRadius: imageFormData.borderRadius,
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/overlays/`,
        payload
      );

      if (response.data.success) {
        setMessage(
          `${
            overlayType === "text" ? "Text" : "Image"
          } overlay added successfully!`
        );

        if (overlayType === "text") {
          setTextFormData({
            text: "",
            top: "20px",
            left: "20px",
            color: "#ffffff",
            fontSize: "16px",
            backgroundColor: "rgba(0,0,0,0.5)",
          });
        } else {
          setImageFormData({
            imageUrl: "",
            top: "20px",
            left: "20px",
            width: "120px",
            height: "80px",
            opacity: 1,
            borderRadius: "8px",
          });
          setImagePreviewError(false);
        }

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
    { name: "Top Center", top: "10px", left: "50%" },
    { name: "Top Right", top: "10px", left: "calc(100% - 130px)" },
    { name: "Bottom Left", top: "calc(100% - 100px)", left: "10px" },
    { name: "Bottom Center", top: "calc(100% - 100px)", left: "50%" },
    {
      name: "Bottom Right",
      top: "calc(100% - 100px)",
      left: "calc(100% - 130px)",
    },
  ];

  const applyPreset = (preset) => {
    if (overlayType === "text") {
      setTextFormData((prev) => ({
        ...prev,
        top: preset.top,
        left: preset.left,
      }));
    } else {
      setImageFormData((prev) => ({
        ...prev,
        top: preset.top,
        left: preset.left,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-3 border-b border-gray-200/50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-1.5 rounded-lg">
            {overlayType === "text" ? (
              <FaFont size={14} />
            ) : (
              <FaImage size={14} />
            )}
          </span>
          Add New Overlay
        </h3>
        {!isStreaming && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm">
            <span className="animate-pulse">⚠️</span>
            Start RTSP stream first
          </div>
        )}
      </div>

      {/* Overlay Type Toggle */}
      <div className="bg-gray-100/80 p-1.5 rounded-xl flex gap-1.5">
        <button
          type="button"
          onClick={() => setOverlayType("text")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            overlayType === "text"
              ? "bg-white text-gray-800 shadow-md transform scale-[1.02]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaFont size={12} />
          Text Overlay
        </button>
        <button
          type="button"
          onClick={() => setOverlayType("image")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            overlayType === "image"
              ? "bg-white text-gray-800 shadow-md transform scale-[1.02]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaImage size={12} />
          Image Overlay
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {overlayType === "text" ? (
          /* Text Overlay Form */
          <>
            {/* Text Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="overlay-text"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Overlay Text
              </label>
              <input
                id="overlay-text"
                type="text"
                value={textFormData.text}
                onChange={(e) => handleTextInputChange("text", e.target.value)}
                placeholder="Enter your overlay text..."
                maxLength={50}
                required
                className="input-field text-sm py-2.5 px-3 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-pink-400"
              />
              <div className="flex justify-end">
                <span className="text-xs text-gray-400">
                  {textFormData.text.length}/50
                </span>
              </div>
            </div>

            {/* Position Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="top-position"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Top Position
                </label>
                <input
                  id="top-position"
                  type="text"
                  value={textFormData.top}
                  onChange={(e) => handleTextInputChange("top", e.target.value)}
                  placeholder="10px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="left-position"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Left Position
                </label>
                <input
                  id="left-position"
                  type="text"
                  value={textFormData.left}
                  onChange={(e) =>
                    handleTextInputChange("left", e.target.value)
                  }
                  placeholder="10px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
            </div>

            {/* Font Size and Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="font-size"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Font Size
                </label>
                <select
                  id="font-size"
                  value={textFormData.fontSize}
                  onChange={(e) =>
                    handleTextInputChange("fontSize", e.target.value)
                  }
                  className="input-field text-sm py-2 px-3 appearance-none cursor-pointer"
                >
                  <option value="12px">Small (12px)</option>
                  <option value="16px">Medium (16px)</option>
                  <option value="20px">Large (20px)</option>
                  <option value="24px">Extra Large (24px)</option>
                  <option value="32px">Huge (32px)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="text-color"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Text Color
                </label>
                <div className="relative">
                  <input
                    id="text-color"
                    type="color"
                    value={textFormData.color}
                    onChange={(e) =>
                      handleTextInputChange("color", e.target.value)
                    }
                    className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-pink-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-1.5">
              <label
                htmlFor="background-color"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Background Color
              </label>
              <input
                id="background-color"
                type="color"
                value={
                  textFormData.backgroundColor.startsWith("rgba")
                    ? "#000000"
                    : textFormData.backgroundColor
                }
                onChange={(e) =>
                  handleTextInputChange("backgroundColor", e.target.value)
                }
                className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-pink-300 transition-colors"
              />
            </div>

            {/* Text Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Preview
              </label>
              <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[60px]">
                <span
                  className="px-3 py-1.5 rounded border border-white/20"
                  style={{
                    fontSize: textFormData.fontSize,
                    color: textFormData.color,
                    backgroundColor: textFormData.backgroundColor,
                  }}
                >
                  {textFormData.text || "Preview Text"}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Image Overlay Form */
          <>
            {/* Image URL Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="image-url"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2"
              >
                <FaLink size={10} />
                Image URL
              </label>
              <input
                id="image-url"
                type="url"
                value={imageFormData.imageUrl}
                onChange={(e) =>
                  handleImageInputChange("imageUrl", e.target.value)
                }
                placeholder="https://example.com/logo.png"
                required
                className="input-field text-sm py-2.5 px-3 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-pink-400"
              />
              <p className="text-xs text-gray-400">
                Supports PNG, JPG, GIF, SVG, and WebP formats
              </p>
            </div>

            {/* Image Preview */}
            {imageFormData.imageUrl && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image Preview
                </label>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                  {!imagePreviewError ? (
                    <img
                      src={imageFormData.imageUrl}
                      alt="Preview"
                      onError={() => setImagePreviewError(true)}
                      style={{
                        width: imageFormData.width,
                        height: imageFormData.height,
                        borderRadius: imageFormData.borderRadius,
                        opacity: imageFormData.opacity,
                        objectFit: "cover",
                      }}
                      className="shadow-lg"
                    />
                  ) : (
                    <div className="text-red-400 text-sm flex flex-col items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <span>Unable to load image</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Position Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="img-top-position"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Top Position
                </label>
                <input
                  id="img-top-position"
                  type="text"
                  value={imageFormData.top}
                  onChange={(e) =>
                    handleImageInputChange("top", e.target.value)
                  }
                  placeholder="10px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="img-left-position"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Left Position
                </label>
                <input
                  id="img-left-position"
                  type="text"
                  value={imageFormData.left}
                  onChange={(e) =>
                    handleImageInputChange("left", e.target.value)
                  }
                  placeholder="10px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
            </div>

            {/* Size Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="img-width"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Width
                </label>
                <input
                  id="img-width"
                  type="text"
                  value={imageFormData.width}
                  onChange={(e) =>
                    handleImageInputChange("width", e.target.value)
                  }
                  placeholder="100px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="img-height"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Height
                </label>
                <input
                  id="img-height"
                  type="text"
                  value={imageFormData.height}
                  onChange={(e) =>
                    handleImageInputChange("height", e.target.value)
                  }
                  placeholder="100px"
                  className="input-field text-sm py-2 px-3"
                />
              </div>
            </div>

            {/* Opacity and Border Radius */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="img-opacity"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Opacity ({Math.round(imageFormData.opacity * 100)}%)
                </label>
                <input
                  id="img-opacity"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={imageFormData.opacity}
                  onChange={(e) =>
                    handleImageInputChange("opacity", e.target.value)
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-pink-500"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="img-border-radius"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Border Radius
                </label>
                <select
                  id="img-border-radius"
                  value={imageFormData.borderRadius}
                  onChange={(e) =>
                    handleImageInputChange("borderRadius", e.target.value)
                  }
                  className="input-field text-sm py-2 px-3 appearance-none cursor-pointer"
                >
                  <option value="0px">None</option>
                  <option value="4px">Subtle (4px)</option>
                  <option value="8px">Small (8px)</option>
                  <option value="12px">Medium (12px)</option>
                  <option value="20px">Large (20px)</option>
                  <option value="50%">Circle</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Quick Positions */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Quick Positions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                type="button"
                className="px-2 py-2 text-xs border-2 border-gray-200/80 bg-white/50 text-gray-600 rounded-lg 
                         hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 
                         transition-all duration-200 font-medium
                         active:scale-95"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              message.includes("success")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span>{message.includes("success") ? "✅" : "❌"}</span>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl font-semibold text-white 
                     bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 
                     hover:from-pink-600 hover:via-pink-700 hover:to-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-pink-500/25
                     transform hover:-translate-y-0.5 active:translate-y-0
                     flex items-center justify-center gap-2"
          disabled={isSubmitting || !isStreaming}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              {overlayType === "text" ? (
                <FaFont size={14} />
              ) : (
                <FaImage size={14} />
              )}
              <span>
                Add {overlayType === "text" ? "Text" : "Image"} Overlay
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OverlayControls;
