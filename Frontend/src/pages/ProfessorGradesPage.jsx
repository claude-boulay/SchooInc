import { useEffect, useMemo, useState } from 'react'
import PageSection from '../components/PageSection'
import {
    fetchProfessorDashboardData,
    fetchProfessorGradesByClass,
    fetchProfessorGradesByCourse,
    fetchProfessorGradesByStudent,
} from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

export default function ProfessorGradesPage() {
    const currentUser = getAuthUser()
    const [students, setStudents] = useState([])
    const [courses, setCourses] = useState([])
    const [classes, setClasses] = useState([])
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [selectedStudentCourseId, setSelectedStudentCourseId] = useState('')
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [selectedClassId, setSelectedClassId] = useState('')
    const [studentView, setStudentView] = useState({ grades: [], stats: null })
    const [courseView, setCourseView] = useState({ grades: [], stats: null })
    const [classView, setClassView] = useState({ grades: [], stats: null })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const myCourses = useMemo(
        () => courses.filter((courseItem) => courseItem.professorId === currentUser?.id),
        [courses, currentUser?.id],
    )

    const myClasses = useMemo(
        () => classes.filter((classItem) => classItem.professorId === currentUser?.id),
        [classes, currentUser?.id],
    )

    const studentsById = useMemo(
        () => new Map(students.map((student) => [student.id, student])),
        [students],
    )

    const coursesById = useMemo(
        () => new Map(courses.map((courseItem) => [courseItem.id, courseItem])),
        [courses],
    )

    const classStatsByCourse = useMemo(() => {
        const byCourse = new Map()
        classView.grades.forEach((gradeItem) => {
            const entry = byCourse.get(gradeItem.courseId) || {
                courseId: gradeItem.courseId,
                courseName: coursesById.get(gradeItem.courseId)?.name || gradeItem.courseId,
                values: [],
            }
            entry.values.push(Number(gradeItem.value))
            byCourse.set(gradeItem.courseId, entry)
        })

        return Array.from(byCourse.values())
            .map((entry) => ({
                courseId: entry.courseId,
                courseName: entry.courseName,
                count: entry.values.length,
                average: entry.values.reduce((sum, value) => sum + value, 0) / entry.values.length,
                minGrade: Math.min(...entry.values),
                maxGrade: Math.max(...entry.values),
            }))
            .sort((a, b) => a.courseName.localeCompare(b.courseName))
    }, [classView.grades, coursesById])

    useEffect(() => {
        const loadBaseData = async () => {
            setIsLoading(true)
            setError('')

            try {
                const data = await fetchProfessorDashboardData()
                const ownedCourses = data.courses.filter((courseItem) => courseItem.professorId === currentUser?.id)
                const ownedClasses = data.classes.filter((classItem) => classItem.professorId === currentUser?.id)

                setStudents(data.students)
                setCourses(data.courses)
                setClasses(data.classes)
                setSelectedStudentId(data.students[0]?.id || '')
                setSelectedStudentCourseId(ownedCourses[0]?.id || '')
                setSelectedCourseId(ownedCourses[0]?.id || '')
                setSelectedClassId(ownedClasses[0]?.id || '')
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadBaseData()
    }, [currentUser?.id])

    useEffect(() => {
        const loadStudentView = async () => {
            if (!selectedStudentId) {
                setStudentView({ grades: [], stats: null })
                return
            }

            try {
                const view = await fetchProfessorGradesByStudent({
                    studentId: selectedStudentId,
                    courseId: selectedStudentCourseId || null,
                })
                setStudentView(view)
            } catch (loadError) {
                setError(loadError.message)
            }
        }

        loadStudentView()
    }, [selectedStudentId, selectedStudentCourseId])

    useEffect(() => {
        const loadCourseView = async () => {
            if (!selectedCourseId) {
                setCourseView({ grades: [], stats: null })
                return
            }

            try {
                const view = await fetchProfessorGradesByCourse({ courseId: selectedCourseId })
                setCourseView(view)
            } catch (loadError) {
                setError(loadError.message)
            }
        }

        loadCourseView()
    }, [selectedCourseId])

    useEffect(() => {
        const loadClassView = async () => {
            if (!selectedClassId) {
                setClassView({ grades: [], stats: null })
                return
            }

            try {
                const view = await fetchProfessorGradesByClass({ classId: selectedClassId })
                setClassView(view)
            } catch (loadError) {
                setError(loadError.message)
            }
        }

        loadClassView()
    }, [selectedClassId])

    const renderStats = (stats) => {
        if (!stats) {
            return <p className="text-sm text-ink-600">Aucune statistique disponible.</p>
        }

        return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-800 md:grid-cols-5">
                <p>Moyenne: <span className="font-semibold text-black">{stats.average ?? 'N/A'}</span></p>
                <p>Mediane: <span className="font-semibold text-black">{stats.median ?? 'N/A'}</span></p>
                <p>Min: <span className="font-semibold text-black">{stats.minGrade ?? 'N/A'}</span></p>
                <p>Max: <span className="font-semibold text-black">{stats.maxGrade ?? 'N/A'}</span></p>
                <p>Nb notes: <span className="font-semibold text-black">{stats.count ?? 0}</span></p>
            </div>
        )
    }

    const renderGrades = (grades) => {
        if (!grades || grades.length === 0) {
            return <p className="mt-3 text-sm text-ink-600">Aucune note.</p>
        }

        return (
            <ul className="mt-3 space-y-2 text-sm text-black">
                {grades.map((gradeItem) => (
                    <li key={gradeItem.id} className="rounded-md border border-ink-500/20 bg-white/60 p-3">
                        <p className="font-semibold text-black">{gradeItem.value}/20</p>
                        <p className="text-xs text-accent-600">Etudiant: {studentsById.get(gradeItem.studentId)?.pseudo || gradeItem.studentId}</p>
                        <p className="text-xs text-ink-700">Cours: {myCourses.find((courseItem) => courseItem.id === gradeItem.courseId)?.name || gradeItem.courseId}</p>
                        {gradeItem.comment ? <p className="text-xs text-ink-700">Commentaire: {gradeItem.comment}</p> : null}
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <PageSection title="Gestion des notes" subtitle="Notes par cours, classe et etudiant avec statistiques.">
            {error ? (
                <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-ink-800">Chargement des donnees...</p> : null}

            {!isLoading ? (
                <div className="grid gap-6">
                    <section className="rounded-xl border border-ink-500/30 bg-white/60 p-5">
                        <h2 className="text-lg font-semibold text-black">Voir les notes d un etudiant</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <select
                                value={selectedStudentId}
                                onChange={(event) => setSelectedStudentId(event.target.value)}
                                className="rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3"
                            >
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>{student.pseudo} - {student.email}</option>
                                ))}
                            </select>
                            <select
                                value={selectedStudentCourseId}
                                onChange={(event) => setSelectedStudentCourseId(event.target.value)}
                                className="rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3"
                            >
                                <option value="">Tous les cours</option>
                                {myCourses.map((courseItem) => (
                                    <option key={courseItem.id} value={courseItem.id}>{courseItem.name}</option>
                                ))}
                            </select>
                        </div>
                        {renderStats(studentView.stats)}
                        {renderGrades(studentView.grades)}
                    </section>

                    <section className="rounded-xl border border-ink-500/30 bg-white/60 p-5">
                        <h2 className="text-lg font-semibold text-black">Voir les notes d un cours</h2>
                        <select
                            value={selectedCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            className="mt-3 w-full rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3 md:max-w-md"
                        >
                            {myCourses.map((courseItem) => (
                                <option key={courseItem.id} value={courseItem.id}>{courseItem.name}</option>
                            ))}
                        </select>
                        {renderStats(courseView.stats)}
                        {renderGrades(courseView.grades)}
                    </section>

                    <section className="rounded-xl border border-ink-500/30 bg-white/60 p-5">
                        <h2 className="text-lg font-semibold text-black">Voir les notes d une classe</h2>
                        <select
                            value={selectedClassId}
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            className="mt-3 w-full rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3 md:max-w-md"
                        >
                            {myClasses.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                            ))}
                        </select>

                        <div className="mt-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-600">
                                Moyenne globale de la classe
                            </h3>
                            {renderStats(classView.stats)}
                        </div>

                        <div className="mt-5">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-600">
                                Detail par cours
                            </h3>
                            {classStatsByCourse.length === 0 ? (
                                <p className="mt-2 text-sm text-ink-600">Aucune note pour cette classe.</p>
                            ) : (
                                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                                    {classStatsByCourse.map((entry) => (
                                        <li key={entry.courseId} className="rounded-md border border-ink-500/20 bg-white/70 p-3">
                                            <p className="font-semibold text-black">{entry.courseName}</p>
                                            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-ink-800 md:grid-cols-4">
                                                <p>Moyenne: <span className="font-semibold text-black">{entry.average.toFixed(2)}</span></p>
                                                <p>Min: <span className="font-semibold text-black">{entry.minGrade}</span></p>
                                                <p>Max: <span className="font-semibold text-black">{entry.maxGrade}</span></p>
                                                <p>Nb: <span className="font-semibold text-black">{entry.count}</span></p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </PageSection>
    )
}
