import {
  createGrade,
  deleteGradeById,
  findGradeById,
  updateGradeById,
} from "../../db/models/grades.model.js";

const ensureProfessor = (context) => {
  if (!context.currentUser?.id) {
    throw new Error("Authentication required");
  }

  if (context.currentUser.role !== "PROFESSOR") {
    throw new Error("Professor role required");
  }
};

const validateGradeValue = (value) => {
  if (typeof value !== "number" || value < 0 || value > 20) {
    throw new Error("Grade must be between 0 and 20");
  }
};

export const mutations = {
  createGrade: async (_, { input }, context) => {
    ensureProfessor(context);

    const { value, studentId, courseId, comment } = input;
    validateGradeValue(value);

    return createGrade({
      value,
      studentId,
      courseId,
      professorId: context.currentUser.id,
      comment,
    });
  },

  updateGrade: async (_, { input }, context) => {
    ensureProfessor(context);

    const { id, value, comment } = input;
    validateGradeValue(value);

    const grade = await findGradeById(id);
    if (!grade) {
      throw new Error("Grade not found");
    }

    if (grade.professorId !== context.currentUser.id) {
      throw new Error("You can only update your own grades");
    }

    return updateGradeById(id, { value, comment });
  },

  deleteGrade: async (_, { id }, context) => {
    ensureProfessor(context);

    const grade = await findGradeById(id);
    if (!grade) {
      throw new Error("Grade not found");
    }

    if (grade.professorId !== context.currentUser.id) {
      throw new Error("You can only delete your own grades");
    }

    const deleted = await deleteGradeById(id);
    return Boolean(deleted);
  },
};
