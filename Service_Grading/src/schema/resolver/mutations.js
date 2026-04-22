import {
  createGradesForEventBatch,
  createGrade,
  deleteGradeById,
  deleteGradesByCourseId,
  deleteGradesByProfessorId,
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

const mapDbError = (error) => {
  if (error?.code === "23505") {
    throw new Error("A grade already exists for this student and event");
  }

  throw error;
};

export const mutations = {
  createGrade: async (_, { input }, context) => {
    ensureProfessor(context);

    const { value, studentId, courseId, comment } = input;
    validateGradeValue(value);

    try {
      return await createGrade({
        value,
        studentId,
        courseId,
        eventId: input.eventId,
        professorId: context.currentUser.id,
        comment,
      });
    } catch (error) {
      mapDbError(error);
    }
  },

  createGradesForEvent: async (_, { input }, context) => {
    ensureProfessor(context);

    if (!Array.isArray(input.grades) || input.grades.length === 0) {
      throw new Error("At least one student grade is required");
    }

    input.grades.forEach((gradeItem) => validateGradeValue(gradeItem.value));

    try {
      return await createGradesForEventBatch({
        eventId: input.eventId,
        courseId: input.courseId,
        professorId: context.currentUser.id,
        grades: input.grades,
      });
    } catch (error) {
      mapDbError(error);
    }
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

    try {
      return await updateGradeById(id, {
        value,
        comment,
        eventId: input.eventId,
      });
    } catch (error) {
      mapDbError(error);
    }
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

  // Called from Service_School when a course is deleted
  deleteCourseGrades: async (_, { courseId }) => {
    const deleted = await deleteGradesByCourseId(courseId);
    return { success: true, deletedCount: deleted };
  },

  // Called from Service_School when a professor is deleted
  deleteProfessorGrades: async (_, { professorId }) => {
    const deleted = await deleteGradesByProfessorId(professorId);
    return { success: true, deletedCount: deleted };
  },
};
