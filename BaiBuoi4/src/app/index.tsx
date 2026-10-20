
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { getStudents } from "../lib/storage";
import { t } from "../lib/i18n";
import type { Student } from "../types/student";

export default function HomeScreen() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Tải dữ liệu mỗi khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadData = async () => {
        try {
          setLoading(true);
          setError("");

          const data = await getStudents();

          if (active) {
            setStudents(data);
          }
        } catch (err) {
          console.error("Load students error:", err);
          if (active) {
            setError(t("loadError"));
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadData();

      return () => {
        active = false;
      };
    }, [])
  );

  // Kéo xuống để cập nhật danh sách
  const refreshStudents = async () => {
    setRefreshing(true);

    try {
      const data = await getStudents();
      setStudents(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(t("loadError"));
    } finally {
      setRefreshing(false);
    }
  };

  // Tìm kiếm theo họ tên và MSSV
  const filteredStudents = students.filter((student) => {
    const keyword = search.trim().toLowerCase();

    return (
      student.fullName.toLowerCase().includes(keyword) ||
      student.studentCode.toLowerCase().includes(keyword)
    );
  });

  // Mở màn hình chi tiết
  const openDetail = (id: string) => {
    router.push({
      pathname: "/detail",
      params: { id },
    });
  };

  // Mở màn hình thêm sinh viên
  const openAddStudent = () => {
    router.push("/form");
  };

  // Hiển thị một sinh viên
  const renderStudent = ({ item }: { item: Student }) => {
    const firstLetter =
      item.fullName.trim().charAt(0).toUpperCase() || "?";

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => openDetail(item.id)}
        activeOpacity={0.8}
      >
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>
              {firstLetter}
            </Text>
          </View>
        )}

        <View style={styles.studentInfo}>
          <Text
            style={styles.studentName}
            numberOfLines={1}
          >
            {item.fullName}
          </Text>

          <Text style={styles.studentCode}>
            {t("studentCode")}: {item.studentCode}
          </Text>

          <Text style={styles.email} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề ứng dụng */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("appName")}
        </Text>

        <Text style={styles.subtitle}>
          {t("subtitle")}
        </Text>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={t("search")}
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thống kê số sinh viên */}
      {!loading && !error && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {t("studentList")} ({filteredStudents.length})
          </Text>
        </View>
      )}

      {/* Danh sách */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />

          <Text style={styles.loadingText}>
            {t("loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={error ? [] : filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshStudents}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎓</Text>

              <Text style={styles.emptyText}>
                {error ||
                  (search
                    ? t("noResults")
                    : t("noStudents"))}
              </Text>

              {!search && !error && (
                <Text style={styles.emptyHint}>
                  {t("addFirstStudent")}
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* Nút thêm sinh viên */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddStudent}
        accessibilityLabel={t("addStudent")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
  },

  header: {
    backgroundColor: "#2563eb",
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
  },

  subtitle: {
    fontSize: 14,
    color: "#dbeafe",
    marginTop: 6,
  },

  searchBox: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchIcon: {
    fontSize: 27,
    color: "#9ca3af",
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#111827",
    outlineStyle: "none",
  } as any,

  clearText: {
    fontSize: 18,
    color: "#9ca3af",
    padding: 8,
  },

  countContainer: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  studentCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetter: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 14,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },

  studentCode: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 5,
  },

  email: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 5,
  },

  arrow: {
    fontSize: 28,
    color: "#9ca3af",
    marginLeft: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 15,
  },

  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },

  emptyHint: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },

  addButton: {
    position: "absolute",
    right: 25,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "bold",
  },
});
