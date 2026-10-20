
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  addStudent,
  getStudentById,
  updateStudent,
} from "../lib/storage";
import { t, currentLanguage } from "../lib/i18n";
import type { StudentInput } from "../types/student";

export default function FormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const isEditing = typeof id === "string" && id.length > 0;

  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Thông báo theo ngôn ngữ thiết bị
  const invalidCodeMessage =
    currentLanguage === "vi"
      ? "MSSV không hợp lệ! Định dạng: B + 2 chữ cái + 6 chữ số (VD: BIT240205)"
      : "Invalid student ID! Format: B + 2 letters + 6 digits (e.g. BIT240205)";

  const invalidAvatarMessage =
    currentLanguage === "vi"
      ? "Link ảnh phải bắt đầu bằng http:// hoặc https://"
      : "Image URL must start with http:// or https://";

  // ==========================================
  // 1. TẢI THÔNG TIN KHI CHỈNH SỬA
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadStudent() {
      if (!isEditing) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const student = await getStudentById(id!);

        if (!student) {
          throw new Error("STUDENT_NOT_FOUND");
        }

        if (active) {
          setFullName(student.fullName);
          setStudentCode(student.studentCode);
          setEmail(student.email);
          setAvatar(student.avatar);
          setAvatarUrl(
            /^https?:\/\//i.test(student.avatar)
              ? student.avatar
              : ""
          );
        }
      } catch (err) {
        console.error("Load student:", err);
        if (active) {
          setError(t("notFound"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadStudent();

    return () => {
      active = false;
    };
  }, [id, isEditing]);

  // ==========================================
  // 2. CHỌN ẢNH ĐẠI DIỆN
  // ==========================================

  const chooseImage = async () => {
    if (saving) return;

    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setError(t("imagePermission"));
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: Platform.OS !== "web",
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selected = result.assets[0];

        const imageValue = selected.base64
          ? `data:${selected.mimeType || "image/jpeg"};base64,${selected.base64}`
          : selected.uri;

        setAvatar(imageValue);
        setAvatarUrl("");
        setError("");
      }
    } catch (err) {
      console.error("Choose image:", err);
      setError(t("imageError"));
    }
  };

  // Nhập link avatar
  const handleAvatarUrl = (value: string) => {
    setAvatarUrl(value);
    setAvatar(value.trim());
  };

  // Xóa avatar
  const removeAvatar = () => {
    setAvatar("");
    setAvatarUrl("");
  };

  // ==========================================
  // 3. VALIDATE BIỂU MẪU
  // ==========================================

  const validateForm = (): boolean => {
    const name = fullName.trim();
    const code = studentCode.trim();
    const mail = email.trim();

    // Kiểm tra họ tên
    if (!name) {
      setError(t("requiredName"));
      return false;
    }

    // Kiểm tra MSSV không để trống
    if (!code) {
      setError(t("requiredCode"));
      return false;
    }

    // Regex: B cố định + 2 chữ cái + 6 chữ số
    const studentCodeRegex = /^B[a-zA-Z]{2}[0-9]{6}$/;

    if (!studentCodeRegex.test(code)) {
      setError(invalidCodeMessage);
      return false;
    }

    // Kiểm tra email
    if (!mail) {
      setError(t("requiredEmail"));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(mail)) {
      setError(t("invalidEmail"));
      return false;
    }

    // Kiểm tra link ảnh nếu người dùng nhập URL
    if (
      avatarUrl.trim() &&
      !/^https?:\/\/\S+$/i.test(avatarUrl.trim())
    ) {
      setError(invalidAvatarMessage);
      return false;
    }

    setError("");
    return true;
  };

  // ==========================================
  // 4. LƯU VÀO ASYNCSTORAGE
  // ==========================================

  const saveStudent = async () => {
    if (saving) return;

    setConfirmVisible(false);
    setSaving(true);
    setError("");

    const data: StudentInput = {
      fullName: fullName.trim(),
      studentCode: studentCode.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
    };

    try {
      if (isEditing) {
        await updateStudent(id!, data);
        router.dismissTo("/");
      } else {
        await addStudent(data);
        router.replace("/");
      }
    } catch (err) {
      console.error("Save student:", err);

      if (
        err instanceof Error &&
        err.message === "DUPLICATE_STUDENT_CODE"
      ) {
        setError(t("duplicateCode"));
      } else if (
        err instanceof Error &&
        err.message === "STUDENT_NOT_FOUND"
      ) {
        setError(t("notFound"));
      } else {
        setError(t("saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  // Thêm mới lưu trực tiếp, sửa phải xác nhận
  const handleSave = () => {
    if (saving || !validateForm()) return;

    if (isEditing) {
      setConfirmVisible(true);
    } else {
      void saveStudent();
    }
  };

  // ==========================================
  // 5. GIAO DIỆN
  // ==========================================

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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditing ? t("editStudent") : t("addStudent")}
        </Text>

        <Text style={styles.subtitle}>
          {t("subtitle")}
        </Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {fullName.trim().charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.imageButton}
          onPress={chooseImage}
          disabled={saving}
        >
          <Text style={styles.imageButtonText}>
            📷 {t("chooseImage")}
          </Text>
        </TouchableOpacity>

        {/* Link avatar */}
        <Text style={styles.label}>
          {t("avatarUrl")}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="https://example.com/avatar.jpg"
          placeholderTextColor="#9ca3af"
          value={avatarUrl}
          onChangeText={handleAvatarUrl}
          autoCapitalize="none"
          keyboardType="url"
          editable={!saving}
        />

        {avatar ? (
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={removeAvatar}
            disabled={saving}
          >
            <Text style={styles.removeImageText}>
              {t("removeImage")}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Họ tên */}
        <Text style={styles.label}>
          {t("fullName")} *
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t("fullName")}
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={setFullName}
          editable={!saving}
        />

        {/* MSSV */}
        <Text style={styles.label}>
          {t("studentCode")} *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="BIT240205"
          placeholderTextColor="#9ca3af"
          value={studentCode}
          onChangeText={setStudentCode}
          autoCapitalize="characters"
          maxLength={9}
          editable={!saving}
        />

        <Text style={styles.hint}>
          {currentLanguage === "vi"
            ? "B + 2 chữ cái + 6 chữ số. VD: BIT240205"
            : "B + 2 letters + 6 digits. E.g. BIT240205"}
        </Text>

        {/* Email */}
        <Text style={styles.label}>
          {t("email")} *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="student@example.com"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!saving}
        />

        {/* Lỗi validate */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Nút lưu */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? t("saveChanges") : t("save")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Nút hủy */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>
            {t("cancel")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hộp thoại xác nhận sửa */}
      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("confirmEditTitle")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("confirmEditMessage")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.noText}>
                  {t("no")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yesButton}
                onPress={() => void saveStudent()}
                disabled={saving}
              >
                <Text style={styles.yesText}>
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

// ==========================================
// 6. STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 40,
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  imageButton: {
    backgroundColor: "#dbeafe",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  imageButtonText: {
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },

  hint: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 18,
    marginTop: -4,
  },

  removeImageButton: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },

  removeImageText: {
    color: "#dc2626",
    fontSize: 14,
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  cancelButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 10,
  },

  cancelText: {
    color: "#6b7280",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 380,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  noText: {
    color: "#374151",
    fontWeight: "600",
  },

  yesButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  yesText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
