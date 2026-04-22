import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../db/models/grades.model.js", () => ({
    getGradeStatsForClass: vi.fn(),
    getGradeStatsForCourse: vi.fn(),
    getGradeStatsForStudent: vi.fn(),
    listGradesByClass: vi.fn(),
    listGradesByCourse: vi.fn(),
    listGradesByStudent: vi.fn(),
}));

import {
    getGradeStatsForClass,
    getGradeStatsForStudent,
    listGradesByStudent,
} from "../../db/models/grades.model.js";
import { queries } from "./queries.js";

describe("grading queries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("myGrades requires authentication", async () => {
        await expect(queries.myGrades(null, {}, {})).rejects.toThrow("Authentication required");
    });

    it("myGrades groups grades by course", async () => {
        listGradesByStudent.mockResolvedValue([
            { id: "g1", courseId: "course-a", value: 12 },
            { id: "g2", courseId: "course-b", value: 16 },
            { id: "g3", courseId: "course-a", value: 14 },
        ]);

        const result = await queries.myGrades(null, {}, { currentUser: { id: "student-1" } });

        expect(listGradesByStudent).toHaveBeenCalledWith("student-1");
        expect(result).toHaveLength(2);
        expect(result.find((entry) => entry.courseId === "course-a")?.grades).toHaveLength(2);
        expect(result.find((entry) => entry.courseId === "course-b")?.grades).toHaveLength(1);
    });

    it("gradesByStudent requires professor role", async () => {
        await expect(
            queries.gradesByStudent(null, { studentId: "student-1" }, { currentUser: { id: "u1", role: "STUDENT" } })
        ).rejects.toThrow("Professor role required");
    });

    it("gradesByStudent returns grades for a professor", async () => {
        listGradesByStudent.mockResolvedValue([{ id: "g1", value: 10 }]);

        const result = await queries.gradesByStudent(
            null,
            { studentId: "student-1" },
            { currentUser: { id: "prof-1", role: "PROFESSOR" } }
        );

        expect(listGradesByStudent).toHaveBeenCalledWith("student-1");
        expect(result).toEqual([{ id: "g1", value: 10 }]);
    });

    it("classStats requires professor role", async () => {
        await expect(
            queries.classStats(null, { classId: "class-1" }, { currentUser: { id: "u1", role: "STUDENT" } })
        ).rejects.toThrow("Professor role required");
    });
});
