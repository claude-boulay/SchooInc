import {
  getGradeStatsForClass,
  getGradeStatsForCourse,
  getGradeStatsForStudent,
  listGradesByClass,
  listGradesByCourse,
  listGradesByStudent,
} from "../../db/models/grades.model.js";

const ensureAuthenticated = (context) => {
  if (!context.currentUser?.id) {
    throw new Error("Authentication required");
  }
};

const ensureProfessor = (context) => {
  if (!context.currentUser?.id) {
    throw new Error("Authentication required");
  }

  if (context.currentUser.role !== "PROFESSOR") {
    throw new Error("Professor role required");
  }
};

// Helper to group grades by course
const groupGradesByCourse = (grades) => {
  const grouped = {};

  grades.forEach((grade) => {
    if (!grouped[grade.courseId]) {
      grouped[grade.courseId] = [];
    }
    grouped[grade.courseId].push(grade);
  });

  return Object.entries(grouped).map(([courseId, courseGrades]) => ({
    courseId,
    courseName: null, // Could be enriched from Course service
    grades: courseGrades,
  }));
};

export const queries = {
  myGrades: async (_, __, context) => {
    ensureAuthenticated(context);

    const grades = await listGradesByStudent(context.currentUser.id);
    return groupGradesByCourse(grades);
  },

  gradesByCourse: async (_, { courseId }) => {
    const grades = await listGradesByCourse(courseId);
    return grades;
  },

  gradesByStudent: async (_, { studentId }, context) => {
    ensureProfessor(context);

    const grades = await listGradesByStudent(studentId);
    return grades;
  },

  gradesByClass: async (_, { classId }, context) => {
    ensureProfessor(context);

    const grades = await listGradesByClass(classId);
    return grades;
  },

  studentStats: async (_, { studentId, courseId }, context) => {
    ensureProfessor(context);

    return getGradeStatsForStudent(studentId, courseId);
  },

  courseStats: async (_, { courseId }) => {
    return getGradeStatsForCourse(courseId);
  },

  classStats: async (_, { classId }, context) => {
    ensureProfessor(context);

    return getGradeStatsForClass(classId);
  },
};
