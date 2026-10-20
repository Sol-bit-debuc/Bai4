
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  deleteStudent,
  getStudentById,
} from "../lib/storage";
import { t } from "../lib/i18n";
import type { Student } from "../types/student";

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Tải lại thông tin khi quay về từ màn hình sửa
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStudent() {
        try {
          if (!id) {
            throw new Error("STUDENT_NOT_FOUND");
          }

          if (active) {
            setLoading(true);
            setError("");
          }

          const data = await getStudentById(id);

          if (active) {
            setStudent(data ?? null);
            if (!data) setError(t("notFound"));
          }
        } catch (err) {
          console.error("Load student error:", err);

          if (active) {
            setStudent(null);
            setError(t("loadError"));
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadStudent();

      return () => {
        active = false;
      };
    }, [id])
  );

  // Mở màn hình chỉnh sửa
  const handleEdit = () => {
    if (!student || deleting) return;

    router.push({
      pathname: "/form",
      params: { id: student.id },
    });
  };

  // Xóa sinh viên sau khi nhấn Có
  const handleDelete = async () => {
    if (!student || deleting) return;

    setConfirmVisible(false);
    setDeleting(true);
    setError("");

    try {
      await deleteStudent(student.id);

      // Quay về danh sách sinh viên
      router.dismissTo("/");
    } catch (err) {
      console.error("Delete student error:", err);
      setError(t("deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          {t("loading")}
        </Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundIcon}>🔎</Text>

        <Text style={styles.notFoundText}>
          {error || t("notFound")}
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.dismissTo("/")}
        >
          <Text style={styles.backButtonText}>
            {t("back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {t("studentDetail")}
        </Text>

        <Text style={styles.subtitle}>
          {t("subtitle")}
        </Text>

        {/* Thẻ thông tin sinh viên */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            {student.avatar ? (
              <Image
                source={{ uri: student.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>
                  {student.fullName
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.studentName}>
            {student.fullName}
          </Text>

          <Text style={styles.studentCode}>
            {student.studentCode}
          </Text>

          <View style={styles.divider} />

          {/* Thông tin chi tiết */}
          <InfoRow
            label={t("fullName")}
            value={student.fullName}
          />

          <InfoRow
            label={t("studentCode")}
            value={student.studentCode}
          />

          <InfoRow
            label={t("email")}
            value={student.email}
          />
        </View>

        {/* Thông báo lỗi */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Nút sửa */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          disabled={deleting}
        >
          <Text style={styles.actionText}>
            ✏️ {t("editStudent")}
          </Text>
        </TouchableOpacity>

        {/* Nút xóa */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleting && styles.disabledButton,
          ]}
          onPress={() => setConfirmVisible(true)}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.actionText}>
              🗑️ {t("deleteStudent")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Nút quay về danh sách */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.dismissTo("/")}
          disabled={deleting}
        >
          <Text style={styles.cancelText}>
            {t("back")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hộp thoại xác nhận xóa */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("confirmDeleteTitle")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("confirmDeleteMessage")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.noButtonText}>
                  {t("no")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yesButton}
                onPress={() => void handleDelete()}
                disabled={deleting}
              >
                <Text style={styles.yesButtonText}>
                  {t("yes")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Component hiển thị từng dòng thông tin
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value || "-"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  avatarContainer: {
    marginBottom: 15,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLetter: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  studentName: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },

  studentCode: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 6,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 22,
  },

  infoRow: {
    width: "100%",
    marginBottom: 18,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  editButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  actionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#6b7280",
    fontSize: 16,
  },

  backButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },

  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  notFoundIcon: {
    fontSize: 46,
    marginBottom: 12,
  },

  notFoundText: {
    fontSize: 17,
    color: "#6b7280",
    textAlign: "center",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  errorText: {
    color: "#b91c1c",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 24,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  noButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  noButtonText: {
    color: "#374151",
    fontWeight: "600",
  },

  yesButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  yesButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
