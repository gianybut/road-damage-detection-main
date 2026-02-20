/**
 * BoundingBox Component
 * Draws a colored rectangle overlay on top of camera/image views.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DAMAGE_COLORS } from "../config";

/**
 * @param {object} props
 * @param {object} props.bbox - { x1, y1, x2, y2 } in original image pixels
 * @param {string} props.damageCode - e.g. "D00"
 * @param {number} props.confidence - 0.0 to 1.0
 * @param {number} props.imageWidth - Original image width in pixels
 * @param {number} props.imageHeight - Original image height in pixels
 * @param {number} props.displayWidth - Display container width
 * @param {number} props.displayHeight - Display container height
 */
export default function BoundingBox({
  bbox,
  damageCode,
  confidence,
  imageWidth,
  imageHeight,
  displayWidth,
  displayHeight,
}) {
  const info = DAMAGE_COLORS[damageCode] || { name: damageCode, color: "#888" };

  // Scale bounding box from original image coordinates to display coordinates
  const scaleX = displayWidth / imageWidth;
  const scaleY = displayHeight / imageHeight;

  const left = bbox.x1 * scaleX;
  const top = bbox.y1 * scaleY;
  const width = (bbox.x2 - bbox.x1) * scaleX;
  const height = (bbox.y2 - bbox.y1) * scaleY;

  return (
    <View
      style={[
        styles.box,
        {
          left,
          top,
          width,
          height,
          borderColor: info.color,
        },
      ]}
    >
      {/* Label above the box */}
      <View style={[styles.labelContainer, { backgroundColor: info.color }]}>
        <Text style={styles.labelText}>
          {info.name} {Math.round(confidence * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    borderWidth: 2.5,
    borderRadius: 4,
    zIndex: 10,
  },
  labelContainer: {
    position: "absolute",
    top: -22,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  labelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
