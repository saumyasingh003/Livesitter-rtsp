import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

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
    setEditForm(prev => ({
      ...prev,
      [field]: value
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

  if (overlays.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Overlay Manager</h3>
        </div>
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
          <p className="text-base sm:text-lg font-medium">No overlays created yet</p>
          <p className="text-xs sm:text-sm">Add some overlays using the controls above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pb-3 sm:pb-4 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Overlay Manager</h3>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
          {overlays.length} overlay{overlays.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className={`message ${message.includes('success') ? 'message-success' : 'message-error'} text-xs sm:text-sm`}>
          {message}
        </div>
      )}

      {/* Overlays List */}
      <div className="space-y-3 sm:space-y-4">
        {overlays.map((overlay) => (
          <div key={overlay._id} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-pink-500">
            {editingId === overlay._id ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Edit Form */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Text:</label>
                  <input
                    type="text"
                    value={editForm.text || ""}
                    onChange={(e) => handleInputChange("text", e.target.value)}
                    placeholder="Overlay text"
                    className="input-field text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Top:</label>
                    <input
                      type="text"
                      value={editForm.top || ""}
                      onChange={(e) => handleInputChange("top", e.target.value)}
                      placeholder="10px"
                      className="input-field text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Left:</label>
                    <input
                      type="text"
                      value={editForm.left || ""}
                      onChange={(e) => handleInputChange("left", e.target.value)}
                      placeholder="10px"
                      className="input-field text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Font Size:</label>
                    <select
                      value={editForm.fontSize || ""}
                      onChange={(e) => handleInputChange("fontSize", e.target.value)}
                      className="input-field text-sm sm:text-base"
                    >
                      <option value="12px">Small (12px)</option>
                      <option value="16px">Medium (16px)</option>
                      <option value="20px">Large (20px)</option>
                      <option value="24px">Extra Large (24px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Color:</label>
                    <input
                      type="color"
                      value={editForm.color || "#ffffff"}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-full h-8 sm:h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Background:</label>
                  <input
                    type="color"
                    value={editForm.backgroundColor || "rgba(0,0,0,0.5)"}
                    onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                    className="w-full h-8 sm:h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Edit Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleUpdate}
                    className="btn-success px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                {/* Overlay Preview */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div
                      className="text-xs sm:text-sm px-2 py-1 rounded border border-white/30 inline-block"
                      style={{
                        fontSize: overlay.fontSize,
                        color: overlay.color,
                        backgroundColor: overlay.backgroundColor || "rgba(0,0,0,0.5)",
                      }}
                    >
                      {overlay.text}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Position: {overlay.top}, {overlay.left}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleEdit(overlay)}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors duration-200"
                    title="Edit overlay"
                  >
                    <span className="text-sm sm:text-base">✏️</span>
                  </button>
                  <button
                    onClick={() => handleDelete(overlay._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors duration-200"
                    title="Delete overlay"
                  >
                    <span className="text-sm sm:text-base">🗑️</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverlayManager;
