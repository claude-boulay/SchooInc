import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../db/models/grades.model.js", () => ({
    createGradesForEventBatch: vi.fn(),
    createGrade: vi.fn(),
    deleteGradeById: vi.fn(),
    findGradeById: vi.fn(),
    updateGradeById: vi.fn(),
}));

import {
    createGrade,
    createGradesForEventBatch,
    deleteGradeById,
    findGradeById,
    updateGradeById,
} from "../../db/models/grades.model.js";
import { mutations } from "./mutations.js";

describe("grading mutations", () => {
    const professorContext = { currentUser: { id: "prof-1", role: "PROFESSOR" } };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("createGrade requires professor role", async () => {
        await expect(
            mutations.createGrade(null, { input: { value: 12, studentId: "s1", courseId: "c1" } }, { currentUser: { id: "s1", role: "STUDENT" } })
        ).rejects.toThrow("Professor role required");
    });

    it("createGrade validates grade boundaries", async () => {
        await expect(
            mutations.createGrade(null, { input: { value: 21, studentId: "s1", courseId: "c1" } }, professorContext)
        ).rejects.toThrow("Grade must be between 0 and 20");
    });

    it("createGradesForEvent requires at least one grade", async () => {
        await expect(
            mutations.createGradesForEvent(null, { input: { eventId: "e1", courseId: "c1", grades: [] } }, professorContext)
        ).rejects.toThrow("At least one student grade is required");
    });

    it("updateGrade rejects unknown grade", async () => {
        findGradeById.mockResolvedValue(null);

        await expect(
            mutations.updateGrade(null, { input: { id: "g1", value: 13 } }, professorContext)
        ).rejects.toThrow("Grade not found");
    });

    it("deleteGrade deletes own grade", async () => {
        findGradeById.mockResolvedValue({ id: "g1", professorId: "prof-1" });
        deleteGradeById.mockResolvedValue({ id: "g1" });

        const result = await mutations.deleteGrade(null, { id: "g1" }, professorContext);

        expect(deleteGradeById).toHaveBeenCalledWith("g1");
        expect(result).toBe(true);
    });
});
