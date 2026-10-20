
export interface Student {
  id: string;
  fullName: string;
  studentCode: string;
  email: string;
  avatar: string;
}

export type StudentInput = Omit<Student, "id">;
