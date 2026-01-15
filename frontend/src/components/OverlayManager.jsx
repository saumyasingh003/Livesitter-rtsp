import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaTrash,
  FaPen,
  FaCheck,
  FaTimes,
  FaImage,
  FaFont,
} from "react-icons/fa";

const OverlayManager = ({ overlays, refreshOverlays }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState("");

  const handleEdit = (overlay) => {
    setEditingId(overlay._id);
    setEditForm({ ...overlay });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/overlays/${editingId}`,
        editForm
      );

      if (response.data.success) {
        setMessage("Overlay updated successfully!");
        setEditingId(null);
        setEditForm({});
        if (refreshOverlays) {
          refreshOverlays();
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating overlay:", error);
      setMessage(
        error.response?.data?.error ||
          "Failed to update overlay. Please try again."
      );
    }
  };

  const handleDelete = async (overlayId) => {
    if (!window.confirm("Are you sure you want to delete this overlay?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/overlays/${overlayId}`
      );

      if (response.data.success) {
        setMessage("Overlay deleted successfully!");
        if (refreshOverlays) {
          refreshOverlays();
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting overlay:", error);
      setMessage(
        error.response?.data?.error ||
          "Failed to delete overlay. Please try again."
      );
    }
  };

  const getOverlayType = (overlay) => {
    return overlay.type || (overlay.imageUrl ? "image" : "text");
  };

  if (overlays.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1.5 rounded-lg">
              <FaImage size={14} />
            </span>
            Overlay Manager
          </h3>
        </div>
        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            No overlays yet
          </p>
          <p className="text-sm text-gray-500">
            Add some overlays using the controls above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-4 border-b border-gray-200/50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1.5 rounded-lg">
            <FaImage size={14} />
          </span>
          Overlay Manager
        </h3>
        <div className="flex gap-2">
          <span className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1.5 rounded-full font-semibold shadow-sm">
            {overlays.filter((o) => getOverlayType(o) === "text").length} Text
          </span>
          <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold shadow-sm">
            {overlays.filter((o) => getOverlayType(o) === "image").length} Image
          </span>
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

      {/* Overlays List */}
      <div className="space-y-3">
        {overlays.map((overlay) => {
          const overlayType = getOverlayType(overlay);

          return (
            <div
              key={overlay._id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                overlayType === "image" ? "border-blue-500" : "border-pink-500"
              }`}
            >
              {editingId === overlay._id ? (
                <div className="space-y-4">
                  {/* Edit Form Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span
                      className={`p-1.5 rounded-lg ${
                        overlayType === "image"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {overlayType === "image" ? (
                        <FaImage size={12} />
                      ) : (
                        <FaFont size={12} />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      Edit {overlayType === "image" ? "Image" : "Text"} Overlay
                    </span>
                  </div>

                  {overlayType === "text" ? (
                    /* Text Edit Form */
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Text
                        </label>
                        <input
                          type="text"
                          value={editForm.text || ""}
                          onChange={(e) =>
                            handleInputChange("text", e.target.value)
                          }
                          placeholder="Overlay text"
                          className="input-field text-sm py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Top
                          </label>
                          <input
                            type="text"
                            value={editForm.top || ""}
                            onChange={(e) =>
                              handleInputChange("top", e.target.value)
                            }
                            placeholder="10px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Left
                          </label>
                          <input
                            type="text"
                            value={editForm.left || ""}
                            onChange={(e) =>
                              handleInputChange("left", e.target.value)
                            }
                            placeholder="10px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Font Size
                          </label>
                          <select
                            value={editForm.fontSize || "16px"}
                            onChange={(e) =>
                              handleInputChange("fontSize", e.target.value)
                            }
                            className="input-field text-sm py-2"
                          >
                            <option value="12px">Small</option>
                            <option value="16px">Medium</option>
                            <option value="20px">Large</option>
                            <option value="24px">X-Large</option>
                            <option value="32px">Huge</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Color
                          </label>
                          <input
                            type="color"
                            value={editForm.color || "#ffffff"}
                            onChange={(e) =>
                              handleInputChange("color", e.target.value)
                            }
                            className="w-full h-9 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-pink-300 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Background
                        </label>
                        <input
                          type="color"
                          value={editForm.backgroundColor || "#000000"}
                          onChange={(e) =>
                            handleInputChange("backgroundColor", e.target.value)
                          }
                          className="w-full h-9 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-pink-300 transition-colors"
                        />
                      </div>
                    </>
                  ) : (
                    /* Image Edit Form */
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={editForm.imageUrl || ""}
                          onChange={(e) =>
                            handleInputChange("imageUrl", e.target.value)
                          }
                          placeholder="https://example.com/image.png"
                          className="input-field text-sm py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Top
                          </label>
                          <input
                            type="text"
                            value={editForm.top || ""}
                            onChange={(e) =>
                              handleInputChange("top", e.target.value)
                            }
                            placeholder="10px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Left
                          </label>
                          <input
                            type="text"
                            value={editForm.left || ""}
                            onChange={(e) =>
                              handleInputChange("left", e.target.value)
                            }
                            placeholder="10px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Width
                          </label>
                          <input
                            type="text"
                            value={editForm.width || "100px"}
                            onChange={(e) =>
                              handleInputChange("width", e.target.value)
                            }
                            placeholder="100px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Height
                          </label>
                          <input
                            type="text"
                            value={editForm.height || "100px"}
                            onChange={(e) =>
                              handleInputChange("height", e.target.value)
                            }
                            placeholder="100px"
                            className="input-field text-sm py-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Opacity ({Math.round((editForm.opacity || 1) * 100)}
                            %)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={editForm.opacity || 1}
                            onChange={(e) =>
                              handleInputChange(
                                "opacity",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Border Radius
                          </label>
                          <select
                            value={editForm.borderRadius || "0px"}
                            onChange={(e) =>
                              handleInputChange("borderRadius", e.target.value)
                            }
                            className="input-field text-sm py-2"
                          >
                            <option value="0px">None</option>
                            <option value="4px">Subtle</option>
                            <option value="8px">Small</option>
                            <option value="12px">Medium</option>
                            <option value="20px">Large</option>
                            <option value="50%">Circle</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Edit Buttons */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium
                               hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FaCheck size={12} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium
                               hover:bg-gray-200 transition-all duration-200"
                    >
                      <FaTimes size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Overlay Preview */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Type Badge & Preview */}
                    <div className="flex-shrink-0">
                      {overlayType === "image" ? (
                        <div className="relative">
                          <img
                            src={overlay.imageUrl}
                            alt="Overlay"
                            className="w-14 h-14 object-cover rounded-lg shadow-md"
                            style={{
                              borderRadius: overlay.borderRadius || "8px",
                              opacity: overlay.opacity || 1,
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="w-14 h-14 bg-gray-200 rounded-lg items-center justify-center text-gray-400 hidden">
                            <FaImage size={20} />
                          </div>
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                            <FaImage size={8} />
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            className="text-sm px-3 py-2 rounded-lg border border-white/30 min-w-[60px] text-center shadow-md"
                            style={{
                              fontSize: overlay.fontSize,
                              color: overlay.color,
                              backgroundColor:
                                overlay.backgroundColor || "rgba(0,0,0,0.5)",
                            }}
                          >
                            {overlay.text?.substring(0, 10)}
                            {overlay.text?.length > 10 ? "..." : ""}
                          </div>
                          <span className="absolute -top-1 -right-1 bg-pink-500 text-white p-1 rounded-full">
                            <FaFont size={8} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {overlayType === "image" ? (
                          <span className="text-blue-600">Image Overlay</span>
                        ) : (
                          <span className="text-pink-600">{overlay.text}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          📍 {overlay.top}, {overlay.left}
                        </span>
                        {overlayType === "image" && (
                          <span>
                            📐 {overlay.width} × {overlay.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleEdit(overlay)}
                      className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit overlay"
                    >
                      <FaPen size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(overlay._id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Delete overlay"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverlayManager;
