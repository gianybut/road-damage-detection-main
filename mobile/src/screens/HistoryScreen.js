/**
 * HistoryScreen
 * Shows a scrollable list of past detections.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getHistory, deleteDetection } from "../utils/api";
import DetectionCard from "../components/DetectionCard";

export default function HistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await getHistory(100, 0);
      if (data.success) {
        setRecords(data.records || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.warn("Failed to load history:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Detection", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDetection(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
            setTotal((prev) => prev - 1);
          } catch (err) {
            Alert.alert("Error", "Failed to delete record.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8ab4f8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Detection History</Text>
        <Text style={styles.count}>{total} records</Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No detections yet.</Text>
          <Text style={styles.emptyHint}>
            Start a survey from the Camera tab to begin detecting road damage.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DetectionCard
              detection={item}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyHint: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
