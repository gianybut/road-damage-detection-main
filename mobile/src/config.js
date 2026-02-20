/**
 * API Configuration
 *
 * IMPORTANT: Change this to your computer's local IP address.
 * Both your phone and computer must be on the SAME WiFi network.
 *
 * To find your IP:
 *   Mac:    System Settings → Network → WiFi → Details → IP Address
 *   Windows: ipconfig → IPv4 Address
 *   Linux:  hostname -I
 *
 * Example: "http://192.168.1.100:5000"
 */

// ⚠️ CHANGE THIS to your computer's IP address
export const API_URL = "http://192.168.1.100:5000";

// Detection settings
export const DETECTION_INTERVAL = 2000; // milliseconds between captures (2 seconds)
export const CONFIDENCE_THRESHOLD = 0.4; // minimum confidence to show (40%)

// Damage type colors (matching backend)
export const DAMAGE_COLORS = {
  D00: { name: "Longitudinal Crack", color: "#FF6B6B", icon: "minus" },
  D10: { name: "Transverse Crack", color: "#FFA500", icon: "more-horizontal" },
  D20: { name: "Alligator Crack", color: "#FF4444", icon: "grid" },
  D40: { name: "Pothole", color: "#CC0000", icon: "alert-circle" },
};
