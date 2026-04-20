import { countStudentsInClass } from "../../db/models/classes.model.js";
import { listEnrollmentsByClassId } from "../../db/models/classes_enrollments.model.js";
import { listCoursesByClassId } from "../../db/models/classes_courses.model.js";
import { mutations } from "./mutations.js";
import { queries } from "./queries.js";

export const resolvers = {
  Query: queries,
  Mutation: mutations,
  Class: {
    createdAt: (schoolClass) =>
      schoolClass.createdAt instanceof Date
        ? schoolClass.createdAt.toISOString()
        : schoolClass.createdAt,
    studentCount: async (schoolClass) => countStudentsInClass(schoolClass.id),
    enrollments: async (schoolClass) => listEnrollmentsByClassId(schoolClass.id),
    courses: async (schoolClass) => listCoursesByClassId(schoolClass.id),
  },
  ClassEnrollment: {
    enrolledAt: (enrollment) =>
      enrollment.enrolledAt instanceof Date
        ? enrollment.enrolledAt.toISOString()
        : enrollment.enrolledAt,
  },
};
