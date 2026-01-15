from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os

overlays_bp = Blueprint("overlays", __name__)

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["rtsp_overlay_app"]
collection = db["overlays"]

@overlays_bp.route("/", methods=["POST"])
def create_overlay():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Determine overlay type (default to text)
        overlay_type = data.get("type", "text")
        
        if overlay_type == "image":
            # Image overlay validation
            if not data.get("imageUrl"):
                return jsonify({"error": "Missing required field: imageUrl"}), 400
            if "top" not in data or "left" not in data:
                return jsonify({"error": "Missing required position fields: top, left"}), 400
            
            overlay = {
                "type": "image",
                "imageUrl": data["imageUrl"],
                "top": data["top"],
                "left": data["left"],
                "width": data.get("width", "100px"),
                "height": data.get("height", "100px"),
                "opacity": data.get("opacity", 1),
                "borderRadius": data.get("borderRadius", "0px")
            }
        else:
            # Text overlay validation
            required_fields = ["text", "top", "left", "color", "fontSize"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
        
            overlay = {
                "type": "text",
                "text": data["text"],
                "top": data["top"],
                "left": data["left"],
                "color": data["color"],
                "fontSize": data["fontSize"],
                "backgroundColor": data.get("backgroundColor", "rgba(0,0,0,0.5)")
            }

        result = collection.insert_one(overlay)
        overlay["_id"] = str(result.inserted_id)

        return jsonify({
            "success": True,
            "message": "Overlay created successfully",
            "data": overlay
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlays_bp.route("/", methods=["GET"])
def get_overlays():
    try:
        overlays = []
        for overlay in collection.find():
            overlay["_id"] = str(overlay["_id"])
            overlays.append(overlay)

        return jsonify({
            "success": True,
            "data": overlays,
            "count": len(overlays)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlays_bp.route("/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate ObjectId
        if not ObjectId.is_valid(overlay_id):
            return jsonify({"error": "Invalid overlay ID"}), 400

        update_data = {}
        allowed_fields = ["text", "top", "left", "color", "fontSize", "backgroundColor", 
                          "imageUrl", "width", "height", "opacity", "borderRadius", "type"]

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        result = collection.update_one(
            {"_id": ObjectId(overlay_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Overlay not found"}), 404

        return jsonify({
            "success": True,
            "message": "Overlay updated successfully"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlays_bp.route("/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(overlay_id):
            return jsonify({"error": "Invalid overlay ID"}), 400

        result = collection.delete_one({"_id": ObjectId(overlay_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Overlay not found"}), 404

        return jsonify({
            "success": True,
            "message": "Overlay deleted successfully"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
