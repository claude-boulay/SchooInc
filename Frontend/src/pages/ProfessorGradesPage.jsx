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
            return <p className="text-sm text-gray-400">Aucune statistique disponible.</p>
        }

        return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-200 md:grid-cols-5">
                <p>Moyenne: <span className="font-semibold text-white">{stats.average ?? 'N/A'}</span></p>
                <p>Mediane: <span className="font-semibold text-white">{stats.median ?? 'N/A'}</span></p>
                <p>Min: <span className="font-semibold text-white">{stats.minGrade ?? 'N/A'}</span></p>
                <p>Max: <span className="font-semibold text-white">{stats.maxGrade ?? 'N/A'}</span></p>
                <p>Nb notes: <span className="font-semibold text-white">{stats.count ?? 0}</span></p>
            </div>
        )
    }

    const renderGrades = (grades) => {
        if (!grades || grades.length === 0) {
            return <p className="mt-3 text-sm text-gray-400">Aucune note.</p>
        }

        return (
            <ul className="mt-3 space-y-2 text-sm text-gray-100">
                {grades.map((gradeItem) => (
                    <li key={gradeItem.id} className="rounded-md border border-primary-500/20 bg-black/40 p-3">
                        <p className="font-semibold text-white">{gradeItem.value}/20</p>
                        <p className="text-xs text-primary-200">Etudiant: {studentsById.get(gradeItem.studentId)?.pseudo || gradeItem.studentId}</p>
                        <p className="text-xs text-gray-300">Cours: {myCourses.find((courseItem) => courseItem.id === gradeItem.courseId)?.name || gradeItem.courseId}</p>
                        {gradeItem.comment ? <p className="text-xs text-gray-300">Commentaire: {gradeItem.comment}</p> : null}
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <PageSection title="Gestion des notes" subtitle="Notes par cours, classe et etudiant avec statistiques.">
            {error ? (
                <p className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-gray-200">Chargement des donnees...</p> : null}

            {!isLoading ? (
                <div className="grid gap-6">
                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <h2 className="text-lg font-semibold text-white">Voir les notes d un etudiant</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <select
                                value={selectedStudentId}
                                onChange={(event) => setSelectedStudentId(event.target.value)}
                                className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3"
                            >
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>{student.pseudo} - {student.email}</option>
                                ))}
                            </select>
                            <select
                                value={selectedStudentCourseId}
                                onChange={(event) => setSelectedStudentCourseId(event.target.value)}
                                className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3"
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

                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <h2 className="text-lg font-semibold text-white">Voir les notes d un cours</h2>
                        <select
                            value={selectedCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            className="mt-3 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 md:max-w-md"
                        >
                            {myCourses.map((courseItem) => (
                                <option key={courseItem.id} value={courseItem.id}>{courseItem.name}</option>
                            ))}
                        </select>
                        {renderStats(courseView.stats)}
                        {renderGrades(courseView.grades)}
                    </section>

                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <h2 className="text-lg font-semibold text-white">Voir les notes d une classe</h2>
                        <select
                            value={selectedClassId}
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            className="mt-3 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 md:max-w-md"
                        >
                            {myClasses.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                            ))}
                        </select>
                        {renderStats(classView.stats)}
                        {renderGrades(classView.grades)}
                    </section>
                </div>
            ) : null}
        </PageSection>
    )
}
