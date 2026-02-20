/**
 * HomeScreen
 * Dashboard showing detection statistics and a "Start Survey" button.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getStats, checkConnection } from "../utils/api";
import { DAMAGE_COLORS } from "../config";

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(null); // null = checking
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const isConnected = await checkConnection();
    setConnected(isConnected);

    if (isConnected) {
      try {
        const data = await getStats();
        if (data.success) setStats(data);
      } catch (err) {
        console.warn("Failed to load stats:", err.message);
      }
    }
  };

  // Reload data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {/* Header */}
      <Text style={styles.title}>🛣️ Road Damage</Text>
      <Text style={styles.subtitle}>Detection System</Text>

      {/* Connection Status */}
      <View style={[styles.statusCard, connected === false && styles.statusError]}>
        <Ionicons
          name={connected ? "cloud-done" : connected === null ? "hourglass" : "cloud-offline"}
          size={20}
          color={connected ? "#4CAF50" : connected === null ? "#FFA500" : "#FF4444"}
        />
        <Text style={styles.statusText}>
          {connected ? "Server connected" : connected === null ? "Checking..." : "Server offline"}
        </Text>
        {connected === false && (
          <Text style={styles.statusHint}>
            Make sure the Flask backend is running and your phone is on the same WiFi network.
          </Text>
        )}
      </View>

      {/* Stats Cards */}
      {stats && (
        <>
          <Text style={styles.sectionTitle}>Survey Summary</Text>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total_detections || 0}</Text>
              <Text style={styles.statLabel}>Total Detections</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats.average_confidence ? Math.round(stats.average_confidence * 100) + "%" : "—"}
              </Text>
              <Text style={styles.statLabel}>Avg Confidence</Text>
            </View>
          </View>

          {/* Breakdown by type */}
          <Text style={styles.sectionTitle}>By Damage Type</Text>
          {stats.by_type && Object.keys(stats.by_type).length > 0 ? (
            Object.entries(stats.by_type).map(([code, count]) => {
              const info = DAMAGE_COLORS[code] || { name: code, color: "#888", icon: "❓" };
              return (
                <View key={code} style={styles.typeRow}>
                  <View style={[styles.typeDot, { backgroundColor: info.color }]} />
                  <Text style={styles.typeName}>
                    {info.icon} {info.name}
                  </Text>
                  <Text style={styles.typeCount}>{count}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No detections recorded yet.</Text>
          )}
        </>
      )}

      {/* Start Survey Button */}
      <TouchableOpacity
        style={[styles.startButton, !connected && styles.startButtonDisabled]}
        onPress={() => navigation.navigate("Camera")}
        disabled={!connected}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.startButtonText}>Start Survey</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate("History")}
        >
          <Ionicons name="time-outline" size={22} color="#8ab4f8" />
          <Text style={styles.quickLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate("Map")}
        >
          <Ionicons name="map-outline" size={22} color="#8ab4f8" />
          <Text style={styles.quickLabel}>Map View</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#8ab4f8",
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  statusError: {
    borderWidth: 1,
    borderColor: "#FF444444",
  },
  statusText: {
    color: "#ccc",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  statusHint: {
    color: "#FF8888",
    fontSize: 12,
    marginTop: 8,
    width: "100%",
  },
  sectionTitle: {
    color: "#8ab4f8",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  typeName: {
    color: "#ddd",
    fontSize: 14,
    flex: 1,
  },
  typeCount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#e94560",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 10,
  },
  startButtonDisabled: {
    backgroundColor: "#555",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 20,
  },
  quickBtn: {
    alignItems: "center",
    padding: 12,
  },
  quickLabel: {
    color: "#8ab4f8",
    fontSize: 12,
    marginTop: 4,
  },
});
