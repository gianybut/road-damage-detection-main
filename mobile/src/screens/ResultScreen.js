/**
 * ResultScreen
 * Shows detection results with bounding boxes overlaid on the captured image.
 * Navigated to from CameraScreen or HistoryScreen.
 *
 * Expected route.params:
 *   - imageUri: string (local or remote URL)
 *   - detections: array of detection objects
 *   - imageSize: { width, height }
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoundingBox from "../components/BoundingBox";
import DamageLabel from "../components/DamageLabel";
import { DAMAGE_COLORS } from "../config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * (4 / 3);

export default function ResultScreen({ route, navigation }) {
  const { imageUri, detections = [], imageSize = { width: 640, height: 480 } } =
    route.params || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Detection Results</Text>

      {/* Image with bounding boxes */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}

        {/* Bounding box overlays */}
        {detections.map((det, idx) => (
          <BoundingBox
            key={idx}
            bbox={det.bbox}
            damageCode={det.damage_code}
            confidence={det.confidence}
            imageWidth={imageSize.width}
            imageHeight={imageSize.height}
            displayWidth={SCREEN_WIDTH - 32} // accounting for padding
            displayHeight={IMAGE_HEIGHT}
          />
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {detections.length > 0
            ? `${detections.length} Damage${detections.length > 1 ? "s" : ""} Detected`
            : "No Damage Detected"}
        </Text>
      </View>

      {/* Detection details */}
      {detections.map((det, idx) => {
        const info = DAMAGE_COLORS[det.damage_code] || {
          name: det.damage_code,
          color: "#888",
          icon: "❓",
        };

        return (
          <View key={idx} style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <DamageLabel damageCode={det.damage_code} confidence={det.confidence} />
            </View>
            <View style={styles.detailBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{info.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Code:</Text>
                <Text style={styles.detailValue}>{det.damage_code}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confidence:</Text>
                <Text style={styles.detailValue}>
                  {Math.round(det.confidence * 100)}%
                </Text>
              </View>
              {det.severity && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Severity:</Text>
                  <Text style={styles.detailValue}>{det.severity}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 32,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#16213e",
  },
  noImageText: {
    color: "#666",
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  summaryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  detailCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  detailHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  detailBody: {
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: {
    color: "#888",
    fontSize: 13,
  },
  detailValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
