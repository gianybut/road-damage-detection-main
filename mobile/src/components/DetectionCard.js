/**
 * DetectionCard Component
 * Displays a single detection record in a styled card.
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DamageLabel from "./DamageLabel";
import { getImageUrl } from "../utils/api";

export default function DetectionCard({ detection, onPress, onDelete }) {
  const formattedDate = new Date(detection.timestamp).toLocaleString();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(detection)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      {detection.image_filename && (
        <Image
          source={{ uri: getImageUrl(detection.image_filename) }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}

      {/* Info */}
      <View style={styles.info}>
        <DamageLabel
          damageCode={detection.damage_code}
          confidence={detection.confidence}
          size="small"
        />

        <Text style={styles.timestamp}>{formattedDate}</Text>

        {detection.lat && detection.lng && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.locationText}>
              {detection.lat.toFixed(4)}, {detection.lng.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(detection.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#16213e",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 72,
    height: 72,
  },
  info: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timestamp: {
    color: "#999",
    fontSize: 11,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  locationText: {
    color: "#888",
    fontSize: 11,
    marginLeft: 3,
  },
  deleteBtn: {
    padding: 14,
  },
});
