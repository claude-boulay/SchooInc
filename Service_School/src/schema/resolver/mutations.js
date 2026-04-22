import {
  countStudentsInClass,
  createClass,
  deleteClassById,
  findClassById,
  updateClassById,
} from "../../db/models/classes.model.js";
import {
  addStudentToClass,
  removeStudentFromClass,
} from "../../db/models/classes_enrollments.model.js";
import { addCourseToClass } from "../../db/models/classes_courses.model.js";
import {
  createCourse,
  deleteCourseById,
  findCourseById,
  updateCourseById,
} from "../../db/models/courses.model.js";
import {
  deleteCourseGradesInGradingService,
  deleteProfessorGradesInGradingService,
} from "../../integrations/gradingService.js";

const ensureProfessorAuthenticated = (context) => {
  if (!context.currentUser?.id) {
    throw new Error("Authentication required");
  }

  if (context.currentUser.role !== "PROFESSOR") {
    throw new Error("Professor role required");
  }
};

const ensureClassOwnedByProfessor = (schoolClass, professorId) => {
  if (!schoolClass) {
    throw new Error("Class not found");
  }

  if (schoolClass.professorId !== professorId) {
    throw new Error("You can only modify your own classes");
  }
};

const ensureCourseOwnedByProfessor = (course, professorId) => {
  if (!course) {
    throw new Error("Course not found");
  }

  if (course.professorId !== professorId) {
    throw new Error("You can only modify your own courses");
  }
};

const mapDbError = (error) => {
  if (error?.code === "23505") {
    if (String(error.constraint).includes("classes_name")) {
      throw new Error("Class name already exists");
    }

    if (String(error.constraint).includes("class_enrollments_student_id")) {
      throw new Error("This student is already enrolled in another class");
    }

    throw new Error("Unique constraint violation");
  }

  throw error;
};

export const mutations = {
  createClass: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    try {
      return await createClass({
        name: input.name,
        professorId: context.currentUser.id,
      });
    } catch (error) {
      mapDbError(error);
    }
  },

  updateClass: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const schoolClass = await findClassById(input.id);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    try {
      return await updateClassById({ id: input.id, name: input.name });
    } catch (error) {
      mapDbError(error);
    }
  },

  deleteClass: async (_, { id }, context) => {
    ensureProfessorAuthenticated(context);

    const schoolClass = await findClassById(id);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    const studentCount = await countStudentsInClass(id);
    if (studentCount > 0) {
      throw new Error("Cannot delete class with enrolled students");
    }

    const deleted = await deleteClassById(id);
    return Boolean(deleted);
  },

  addStudentToClass: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const schoolClass = await findClassById(input.classId);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    const studentCount = await countStudentsInClass(input.classId);
    if (studentCount >= 30) {
      throw new Error("Class capacity reached (30 students maximum)");
    }

    try {
      return await addStudentToClass({
        classId: input.classId,
        studentId: input.studentId,
      });
    } catch (error) {
      mapDbError(error);
    }
  },

  removeStudentFromClass: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const schoolClass = await findClassById(input.classId);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    const removedEnrollment = await removeStudentFromClass({
      classId: input.classId,
      studentId: input.studentId,
    });

    if (!removedEnrollment) {
      throw new Error("Student is not enrolled in this class");
    }

    return true;
  },

  createCourse: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    return createCourse({
      name: input.name,
      professorId: context.currentUser.id,
    });
  },

  updateCourse: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const course = await findCourseById(input.id);
    ensureCourseOwnedByProfessor(course, context.currentUser.id);

    return updateCourseById({ id: input.id, name: input.name });
  },

  deleteCourse: async (_, { id }, context) => {
    ensureProfessorAuthenticated(context);

    const course = await findCourseById(id);
    ensureCourseOwnedByProfessor(course, context.currentUser.id);

    const deleted = await deleteCourseById(id);

    // Delete grades for this course in grading service
    if (deleted) {
      await deleteCourseGradesInGradingService(id);
    }

    return Boolean(deleted);
  },

  addCourseToClass: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const schoolClass = await findClassById(input.classId);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    const course = await findCourseById(input.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    try {
      await addCourseToClass({
        classId: input.classId,
        courseId: input.courseId,
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  createCalendarEvent: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    // Verify course ownership
    const course = await findCourseById(input.courseId);
    ensureCourseOwnedByProfessor(course, context.currentUser.id);

    // Verify class ownership
    const schoolClass = await findClassById(input.classId);
    ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);

    const { createCalendarEvent } = await import("../../db/models/calendar_events.model.js");
    return createCalendarEvent({
      startTime: input.startTime,
      endTime: input.endTime,
      courseId: input.courseId,
      classId: input.classId,
      professorId: context.currentUser.id,
    });
  },

  updateCalendarEvent: async (_, { input }, context) => {
    ensureProfessorAuthenticated(context);

    const { findCalendarEventById, updateCalendarEventById } = await import("../../db/models/calendar_events.model.js");
    const event = await findCalendarEventById(input.id);
    if (!event) {
      throw new Error("Calendar event not found");
    }
    if (event.professorId !== context.currentUser.id) {
      throw new Error("You can only modify your own calendar events");
    }

    if (input.courseId) {
      const course = await findCourseById(input.courseId);
      ensureCourseOwnedByProfessor(course, context.currentUser.id);
    }
    if (input.classId) {
      const schoolClass = await findClassById(input.classId);
      ensureClassOwnedByProfessor(schoolClass, context.currentUser.id);
    }

    return updateCalendarEventById({
      id: input.id,
      startTime: input.startTime,
      endTime: input.endTime,
      courseId: input.courseId,
      classId: input.classId,
    });
  },

  deleteCalendarEvent: async (_, { id }, context) => {
    ensureProfessorAuthenticated(context);

    const { findCalendarEventById, deleteCalendarEventById } = await import("../../db/models/calendar_events.model.js");
    const event = await findCalendarEventById(id);
    if (!event) {
      throw new Error("Calendar event not found");
    }
    if (event.professorId !== context.currentUser.id) {
      throw new Error("You can only delete your own calendar events");
    }

    const deleted = await deleteCalendarEventById(id);
    return Boolean(deleted);
  },
};
