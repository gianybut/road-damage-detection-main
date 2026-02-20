/**
 * MapScreen
 * Displays all GPS-tagged detections on a map with color-coded markers.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { getMapData } from "../utils/api";
import { DAMAGE_COLORS } from "../config";
import DamageLabel from "../components/DamageLabel";

const { width, height } = Dimensions.get("window");

// Default region (Philippines — DLSU-D area)
const DEFAULT_REGION = {
  latitude: 14.2833,
  longitude: 120.9567,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const loadMarkers = async () => {
    try {
      const data = await getMapData();
      if (data.success && data.markers && data.markers.length > 0) {
        setMarkers(data.markers);

        // Center map on first marker
        setRegion({
          latitude: data.markers[0].lat,
          longitude: data.markers[0].lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } catch (err) {
      console.warn("Failed to load map markers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMarkers();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8ab4f8" />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Damage Map</Text>
        <Text style={styles.count}>{markers.length} locations</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(DAMAGE_COLORS).map(([code, info]) => (
          <View key={code} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: info.color }]} />
            <Text style={styles.legendText}>{code}</Text>
          </View>
        ))}
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {markers.map((marker, idx) => {
          const info = DAMAGE_COLORS[marker.damage_code] || {
            name: marker.damage_code,
            color: "#888",
          };

          return (
            <Marker
              key={idx}
              coordinate={{
                latitude: marker.lat,
                longitude: marker.lng,
              }}
              pinColor={info.color}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    {info.icon || "📍"} {info.name || marker.damage_code}
                  </Text>
                  <Text style={styles.calloutText}>
                    Confidence: {Math.round(marker.confidence * 100)}%
                  </Text>
                  <Text style={styles.calloutText}>
                    {new Date(marker.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>No GPS-tagged detections yet.</Text>
          <Text style={styles.emptyHint}>
            Detections with GPS coordinates will appear here as map markers.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  centered: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  count: {
    color: "#888",
    fontSize: 14,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    color: "#aaa",
    fontSize: 12,
  },
  map: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: "#555",
  },
  emptyOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyHint: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
