import {
  countClasses,
  deleteClassesByProfessorId,
  findClassById,
  findClassByStudentId,
  listClassProfessorIds,
  listClasses,
} from "../../db/models/classes.model.js";
import {
  deleteCoursesByProfessorId,
  findCourseById,
  listCourseProfessorIds,
  listCourses,
} from "../../db/models/courses.model.js";
import { findCalendarEventsByClassId } from "../../db/models/calendar_events.model.js";
import { listAllEnrollments } from "../../db/models/classes_enrollments.model.js";
import { listAllClassCourses } from "../../db/models/classes_courses.model.js";
import { fetchExistingProfessorIds } from "../../integrations/userService.js";

const normalizePagination = (limit, offset) => ({
  limit: Math.min(Math.max(limit ?? 20, 1), 100),
  offset: Math.max(offset ?? 0, 0),
});

let lastOrphanCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 30000;

const cleanupOrphanedProfessorDataIfNeeded = async () => {
  const now = Date.now();
  if (now - lastOrphanCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastOrphanCleanupAt = now;

  const existingProfessorIds = await fetchExistingProfessorIds();
  if (!existingProfessorIds) {
    return;
  }

  const knownProfessorIds = new Set(existingProfessorIds);
  const [classProfessorIds, courseProfessorIds] = await Promise.all([
    listClassProfessorIds(),
    listCourseProfessorIds(),
  ]);

  const orphanProfessorIds = new Set();
  classProfessorIds.forEach((professorId) => {
    if (!knownProfessorIds.has(professorId)) {
      orphanProfessorIds.add(professorId);
    }
  });
  courseProfessorIds.forEach((professorId) => {
    if (!knownProfessorIds.has(professorId)) {
      orphanProfessorIds.add(professorId);
    }
  });

  if (orphanProfessorIds.size === 0) {
    return;
  }

  for (const professorId of orphanProfessorIds) {
    await deleteClassesByProfessorId(professorId);
    await deleteCoursesByProfessorId(professorId);
  }
};

export const queries = {
  classes: async (_, { sort = "ASC", limit = 20, offset = 0 }) => {
    await cleanupOrphanedProfessorDataIfNeeded();

    const normalized = normalizePagination(limit, offset);
    const [items, total] = await Promise.all([
      listClasses({ sort, limit: normalized.limit, offset: normalized.offset }),
      countClasses(),
    ]);

    return {
      items,
      total,
      limit: normalized.limit,
      offset: normalized.offset,
      hasNext: normalized.offset + items.length < total,
    };
  },

  class: async (_, { id }) => findClassById(id),

  courses: async () => {
    await cleanupOrphanedProfessorDataIfNeeded();
    return listCourses();
  },

  course: async (_, { id }) => findCourseById(id),

  studentClass: async (_, { studentId }) => findClassByStudentId(studentId),

  classCalendarEvents: async (_, { classId }) => findCalendarEventsByClassId(classId),

  classEnrollments: async () => listAllEnrollments(),

  classCourses: async () => listAllClassCourses(),
};
