/**
 * DamageLabel Component
 * A colored badge showing the damage type.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DAMAGE_COLORS } from "../config";

export default function DamageLabel({ damageCode, confidence, size = "medium" }) {
  const info = DAMAGE_COLORS[damageCode] || {
    name: damageCode,
    color: "#888",
    icon: "❓",
  };

  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: info.color }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.icon, isSmall && styles.iconSmall]}>{info.icon}</Text>
      <Text style={[styles.label, isSmall && styles.labelSmall]}>{info.name}</Text>
      {confidence !== undefined && (
        <Text style={[styles.confidence, isSmall && styles.confidenceSmall]}>
          {Math.round(confidence * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  iconSmall: {
    fontSize: 12,
    marginRight: 3,
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  labelSmall: {
    fontSize: 11,
  },
  confidence: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
  },
  confidenceSmall: {
    fontSize: 10,
    marginLeft: 4,
  },
});
