/**
 * API Helper Functions
 * Handles all communication with the Flask backend.
 */

import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout
});

/**
 * Send an image to the backend for YOLOv5 detection.
 * @param {string} imageUri - Local URI of the captured image
 * @param {object} location - { latitude, longitude } or null
 * @returns {object} - { success, detections, count, image_filename }
 */
export async function detectDamage(imageUri, location = null) {
  const formData = new FormData();

  // Append image file
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "capture.jpg",
  });

  // Append GPS coordinates if available
  if (location) {
    formData.append("latitude", location.latitude.toString());
    formData.append("longitude", location.longitude.toString());
  }

  formData.append("save", "true");

  const response = await api.post("/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

/**
 * Get detection history from the backend.
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Offset for pagination
 * @returns {object} - { success, records, total }
 */
export async function getHistory(limit = 50, offset = 0) {
  const response = await api.get("/history", { params: { limit, offset } });
  return response.data;
}

/**
 * Get map markers (detections with GPS coordinates).
 * @returns {object} - { success, markers, total }
 */
export async function getMapData() {
  const response = await api.get("/history/map");
  return response.data;
}

/**
 * Get detection statistics summary.
 * @returns {object} - { success, total_detections, by_type, average_confidence }
 */
export async function getStats() {
  const response = await api.get("/history/stats");
  return response.data;
}

/**
 * Delete a detection record.
 * @param {string} id - Detection ID
 */
export async function deleteDetection(id) {
  const response = await api.delete(`/history/${id}`);
  return response.data;
}

/**
 * Check if the backend server is reachable.
 * @returns {boolean}
 */
export async function checkConnection() {
  try {
    const response = await api.get("/", { timeout: 5000 });
    return response.data.status === "running";
  } catch {
    return false;
  }
}

/**
 * Get the full URL for an uploaded image.
 * @param {string} filename - Image filename from detection result
 * @returns {string} - Full URL
 */
export function getImageUrl(filename) {
  return `${API_URL}/uploads/${filename}`;
}
