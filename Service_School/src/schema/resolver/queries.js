import {
  countClasses,
  findClassById,
  findClassByStudentId,
  listClasses,
} from "../../db/models/classes.model.js";
import { findCourseById, listCourses } from "../../db/models/courses.model.js";

const normalizePagination = (limit, offset) => ({
  limit: Math.min(Math.max(limit ?? 20, 1), 100),
  offset: Math.max(offset ?? 0, 0),
});

export const queries = {
  classes: async (_, { sort = "ASC", limit = 20, offset = 0 }) => {
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

  courses: async () => listCourses(),

  course: async (_, { id }) => findCourseById(id),

  studentClass: async (_, { studentId }) => findClassByStudentId(studentId),
};
