
import { getLocales } from "expo-localization";

// Ngôn ngữ thiết bị
export const currentLanguage =
  getLocales()[0]?.languageCode?.toLowerCase() === "vi"
    ? "vi"
    : "en";

const translations = {
  vi: {
    appName: "Quản lý sinh viên",
    subtitle: "Bài tập buổi 4 - BIT240205",

    studentList: "Danh sách sinh viên",
    search: "Tìm kiếm sinh viên...",
    noStudents: "Chưa có sinh viên nào",
    addFirstStudent: "Hãy thêm sinh viên mới!",
    noResults: "Không tìm thấy sinh viên",

    fullName: "Họ và tên",
    studentCode: "Mã số sinh viên",
    email: "Email",
    avatar: "Ảnh đại diện",
    avatarUrl: "Liên kết ảnh đại diện",

    addStudent: "Thêm sinh viên",
    editStudent: "Sửa sinh viên",
    deleteStudent: "Xóa sinh viên",
    studentDetail: "Chi tiết sinh viên",

    save: "Lưu sinh viên",
    saveChanges: "Lưu thay đổi",
    cancel: "Hủy",
    yes: "Có",
    no: "Không",
    back: "Quay lại",

    chooseImage: "Chọn ảnh từ thiết bị",
    changeImage: "Thay đổi ảnh",
    removeImage: "Xóa ảnh",

    confirmEditTitle: "Xác nhận chỉnh sửa",
    confirmEditMessage:
      "Bạn có muốn sửa thông tin sinh viên không?",

    confirmDeleteTitle: "Xác nhận xóa",
    confirmDeleteMessage:
      "Bạn có muốn xóa thông tin sinh viên không?",

    requiredName: "Vui lòng nhập họ tên sinh viên",
    requiredCode: "Vui lòng nhập mã số sinh viên",
    requiredEmail: "Vui lòng nhập email",
    invalidEmail: "Địa chỉ email không hợp lệ",
    duplicateCode: "Mã số sinh viên đã tồn tại",
    notFound: "Không tìm thấy sinh viên",

    invalidStudentCode:
      "MSSV không hợp lệ! Định dạng: B + 2 chữ cái + 6 chữ số (VD: BIT240205)",

    studentCodeHint:
      "B + 2 chữ cái + 6 chữ số. VD: BIT240205",

    invalidAvatarUrl:
      "Link ảnh phải bắt đầu bằng http:// hoặc https://",

    loading: "Đang tải dữ liệu...",
    saving: "Đang lưu...",
    deleting: "Đang xóa...",
    loadError: "Không thể tải dữ liệu sinh viên",
    saveError: "Không thể lưu sinh viên",
    deleteError: "Không thể xóa sinh viên",
    imageError: "Không thể chọn ảnh",
    imagePermission: "Vui lòng cấp quyền truy cập ảnh",
    success: "Thành công",
    error: "Lỗi",
  },

  en: {
    appName: "Student Management",
    subtitle: "Assignment 4 - BIT240205",

    studentList: "Student List",
    search: "Search students...",
    noStudents: "No students yet",
    addFirstStudent: "Add your first student!",
    noResults: "No students found",

    fullName: "Full Name",
    studentCode: "Student ID",
    email: "Email",
    avatar: "Profile Picture",
    avatarUrl: "Avatar Image URL",

    addStudent: "Add Student",
    editStudent: "Edit Student",
    deleteStudent: "Delete Student",
    studentDetail: "Student Details",

    save: "Save Student",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    back: "Back",

    chooseImage: "Choose Image from Device",
    changeImage: "Change Image",
    removeImage: "Remove Image",

    confirmEditTitle: "Confirm Edit",
    confirmEditMessage:
      "Do you want to edit this student's information?",

    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMessage:
      "Do you want to delete this student's information?",

    requiredName: "Please enter the student's full name",
    requiredCode: "Please enter the student ID",
    requiredEmail: "Please enter an email address",
    invalidEmail: "Invalid email address",
    duplicateCode: "Student ID already exists",
    notFound: "Student not found",

    invalidStudentCode:
      "Invalid student ID! Format: B + 2 letters + 6 digits (e.g. BIT240205)",

    studentCodeHint:
      "B + 2 letters + 6 digits. E.g. BIT240205",

    invalidAvatarUrl:
      "Image URL must start with http:// or https://",

    loading: "Loading data...",
    saving: "Saving...",
    deleting: "Deleting...",
    loadError: "Unable to load student data",
    saveError: "Unable to save student",
    deleteError: "Unable to delete student",
    imageError: "Unable to choose an image",
    imagePermission: "Please allow access to photos",
    success: "Success",
    error: "Error",
  },
};

export type TranslationKey = keyof typeof translations.vi;

// Hàm dịch theo ngôn ngữ thiết bị
export function t(key: TranslationKey): string {
  return translations[currentLanguage][key];
}
