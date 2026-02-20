/**
 * CameraScreen — THE CORE SCREEN
 *
 * Uses expo-camera to capture frames, sends them to the Flask backend
 * every DETECTION_INTERVAL ms, and overlays bounding boxes on the preview.
 *
 * Flow:
 *   1. User presses "Start Detecting"
 *   2. Every 2s, a photo is captured and POST-ed to /detect
 *   3. Results (bounding boxes) are drawn on screen
 *   4. GPS is also captured via expo-location
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { detectDamage } from "../utils/api";
import { DETECTION_INTERVAL, CONFIDENCE_THRESHOLD, DAMAGE_COLORS } from "../config";
import BoundingBox from "../components/BoundingBox";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAMERA_HEIGHT = SCREEN_WIDTH * (4 / 3); // 4:3 aspect ratio

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 640, height: 480 });
  const [statusText, setStatusText] = useState("Ready");
  const [location, setLocation] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);

  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(loc.coords);
        } catch (err) {
          console.warn("Could not get location:", err.message);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Continuously update location while detecting
  useEffect(() => {
    let locWatcher;
    if (detecting) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          locWatcher = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 5,
              timeInterval: 5000,
            },
            (loc) => {
              if (isMountedRef.current) setLocation(loc.coords);
            }
          );
        }
      })();
    }
    return () => {
      if (locWatcher) locWatcher.remove();
    };
  }, [detecting]);

  // Capture + detect loop
  const captureAndDetect = async () => {
    if (!cameraRef.current || !isMountedRef.current) return;

    try {
      setStatusText("Capturing...");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (!isMountedRef.current) return;
      setStatusText("Analyzing...");

      const result = await detectDamage(photo.uri, location);

      if (!isMountedRef.current) return;

      if (result.success) {
        // Filter by confidence threshold
        const filtered = (result.detections || []).filter(
          (d) => d.confidence >= CONFIDENCE_THRESHOLD
        );
        setDetections(filtered);
        setImageSize(result.image_size || { width: 640, height: 480 });
        setDetectionCount((prev) => prev + filtered.length);

        if (filtered.length > 0) {
          setStatusText(`Found ${filtered.length} damage(s)`);
        } else {
          setStatusText("No damage detected");
        }
      } else {
        setStatusText("Detection failed");
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn("Detection error:", err.message);
        setStatusText("Error — check connection");
      }
    }
  };

  const startDetecting = () => {
    setDetecting(true);
    setDetectionCount(0);
    setStatusText("Starting...");
    // Run immediately, then repeat
    captureAndDetect();
    intervalRef.current = setInterval(captureAndDetect, DETECTION_INTERVAL);
  };

  const stopDetecting = () => {
    setDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatusText("Stopped");
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8ab4f8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color="#555" />
        <Text style={styles.permText}>Camera access is required</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          {/* Bounding Box Overlays */}
          {detections.map((det, idx) => (
            <BoundingBox
              key={idx}
              bbox={det.bbox}
              damageCode={det.damage_code}
              confidence={det.confidence}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              displayWidth={SCREEN_WIDTH}
              displayHeight={CAMERA_HEIGHT}
            />
          ))}
        </CameraView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, detecting && styles.statusDotActive]} />
          <Text style={styles.statusLabel}>{statusText}</Text>
          {detecting && (
            <Text style={styles.countBadge}>
              {detectionCount} found
            </Text>
          )}
        </View>

        {/* Location info */}
        {location && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4CAF50" />
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Detection Legend */}
        <View style={styles.legend}>
          {Object.entries(DAMAGE_COLORS).map(([code, info]) => (
            <View key={code} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: info.color }]} />
              <Text style={styles.legendText}>{code}</Text>
            </View>
          ))}
        </View>

        {/* Start / Stop Button */}
        <TouchableOpacity
          style={[styles.actionButton, detecting && styles.stopButton]}
          onPress={detecting ? stopDetecting : startDetecting}
          activeOpacity={0.8}
        >
          <Ionicons
            name={detecting ? "stop-circle" : "play-circle"}
            size={28}
            color="#fff"
          />
          <Text style={styles.actionText}>
            {detecting ? "Stop Detecting" : "Start Detecting"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  centered: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  permButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  permButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cameraContainer: {
    width: SCREEN_WIDTH,
    height: CAMERA_HEIGHT,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  controls: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#555",
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: "#4CAF50",
  },
  statusLabel: {
    color: "#ddd",
    fontSize: 15,
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#e94560",
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    color: "#888",
    fontSize: 12,
    marginLeft: 5,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: "#aaa",
    fontSize: 11,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stopButton: {
    backgroundColor: "#e94560",
  },
  actionText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
