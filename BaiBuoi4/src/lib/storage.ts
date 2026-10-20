
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Student, StudentInput } from "../types/student";

const STORAGE_KEY = "BIT240205_STUDENTS";

// Lấy danh sách sinh viên
export async function getStudents(): Promise<Student[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data) as Student[];
}

// Lưu toàn bộ danh sách
async function saveStudents(students: Student[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(students)
  );
}

// Lấy sinh viên theo ID
export async function getStudentById(
  id: string
): Promise<Student | undefined> {
  const students = await getStudents();

  return students.find((student) => student.id === id);
}

// Thêm sinh viên
export async function addStudent(
  data: StudentInput
): Promise<Student> {
  const students = await getStudents();

  // Kiểm tra mã sinh viên đã tồn tại
  if (
    students.some(
      (student) => student.studentCode === data.studentCode
    )
  ) {
    throw new Error("DUPLICATE_STUDENT_CODE");
  }

  const newStudent: Student = {
    ...data,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
  };

  await saveStudents([...students, newStudent]);

  return newStudent;
}

// Sửa thông tin sinh viên
export async function updateStudent(
  id: string,
  data: StudentInput
): Promise<void> {
  const students = await getStudents();

  if (!students.some((student) => student.id === id)) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  if (
    students.some(
      (student) =>
        student.studentCode === data.studentCode &&
        student.id !== id
    )
  ) {
    throw new Error("DUPLICATE_STUDENT_CODE");
  }

  const updatedStudents = students.map((student) =>
    student.id === id ? { ...student, ...data } : student
  );

  await saveStudents(updatedStudents);
}

// Xóa sinh viên
export async function deleteStudent(id: string): Promise<void> {
  const students = await getStudents();

  const remainingStudents = students.filter(
    (student) => student.id !== id
  );

  await saveStudents(remainingStudents);
}
