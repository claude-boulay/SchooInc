import PageSection from '../components/PageSection'
import { useEffect, useMemo, useState } from 'react'
import {
    addStudentToProfessorClass,
    createProfessorClass,
    createProfessorCourse,
    deleteProfessorClass,
    deleteProfessorCourse,
    fetchProfessorDashboardData,
    updateProfessorClass,
    updateProfessorCourse,
} from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

export default function ProfessorDashboardPage() {
    const currentUser = getAuthUser()
    const [classes, setClasses] = useState([])
    const [courses, setCourses] = useState([])
    const [students, setStudents] = useState([])
    const [className, setClassName] = useState('')
    const [courseName, setCourseName] = useState('')
    const [selectedClassId, setSelectedClassId] = useState('')
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [selectedClassToEditId, setSelectedClassToEditId] = useState('')
    const [selectedCourseToEditId, setSelectedCourseToEditId] = useState('')
    const [updatedClassName, setUpdatedClassName] = useState('')
    const [updatedCourseName, setUpdatedCourseName] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const myClasses = useMemo(
        () => classes.filter((item) => item.professorId === currentUser?.id),
        [classes, currentUser?.id],
    )

    const myCourses = useMemo(
        () => courses.filter((item) => item.professorId === currentUser?.id),
        [courses, currentUser?.id],
    )

    const sortedClasses = useMemo(
        () => [...myClasses].sort((a, b) => a.name.localeCompare(b.name)),
        [myClasses],
    )

    const sortedCourses = useMemo(
        () => [...myCourses].sort((a, b) => a.name.localeCompare(b.name)),
        [myCourses],
    )

    const reloadDashboardData = async () => {
        const data = await fetchProfessorDashboardData()
        setClasses(data.classes)
        setCourses(data.courses)
        setStudents(data.students)
        const ownedClasses = data.classes.filter((item) => item.professorId === currentUser?.id)
        const ownedCourses = data.courses.filter((item) => item.professorId === currentUser?.id)

        if (ownedClasses.length > 0) {
            setSelectedClassId((previous) => (ownedClasses.some((item) => item.id === previous) ? previous : ownedClasses[0].id))
            setSelectedClassToEditId((previous) => (ownedClasses.some((item) => item.id === previous) ? previous : ownedClasses[0].id))
        } else {
            setSelectedClassId('')
            setSelectedClassToEditId('')
        }

        if (ownedCourses.length > 0) {
            setSelectedCourseToEditId((previous) => (ownedCourses.some((item) => item.id === previous) ? previous : ownedCourses[0].id))
        } else {
            setSelectedCourseToEditId('')
        }

        if (data.students.length > 0) {
            setSelectedStudentId((previous) => previous || data.students[0].id)
        } else {
            setSelectedStudentId('')
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            setError('')
            try {
                await reloadDashboardData()
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const handleCreateClass = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await createProfessorClass({ name: className.trim() })
            setClassName('')
            await reloadDashboardData()
            setSuccess('Classe creee avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateCourse = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await createProfessorCourse({ name: courseName.trim() })
            setCourseName('')
            setSuccess('Cours cree avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAssignStudent = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await addStudentToProfessorClass({
                classId: selectedClassId,
                studentId: selectedStudentId,
            })
            await reloadDashboardData()
            setSuccess('Etudiant associe a la classe avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateClass = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await updateProfessorClass({ id: selectedClassToEditId, name: updatedClassName.trim() })
            setUpdatedClassName('')
            await reloadDashboardData()
            setSuccess('Classe modifiee avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClass = async () => {
        if (!selectedClassToEditId) {
            return
        }

        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await deleteProfessorClass({ id: selectedClassToEditId })
            await reloadDashboardData()
            setSuccess('Classe supprimee avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateCourse = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await updateProfessorCourse({ id: selectedCourseToEditId, name: updatedCourseName.trim() })
            setUpdatedCourseName('')
            await reloadDashboardData()
            setSuccess('Cours modifie avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCourse = async () => {
        if (!selectedCourseToEditId) {
            return
        }

        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await deleteProfessorCourse({ id: selectedCourseToEditId })
            await reloadDashboardData()
            setSuccess('Cours supprime avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PageSection title="Dashboard professeur" subtitle="Resume des classes, cours et activites pedagogiques.">
            {error ? (
                <p className="mb-6 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {success ? (
                <p className="mb-6 rounded-lg border border-green-400/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                    {success}
                </p>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-2">
                <form className="rounded-xl border border-primary-500/30 p-5" onSubmit={handleCreateClass}>
                    <h2 className="text-xl font-semibold">Creer une classe</h2>
                    <p className="mt-1 text-sm text-gray-300">Ajoute une nouvelle classe dont tu seras responsable.</p>
                    <input
                        type="text"
                        required
                        value={className}
                        onChange={(event) => setClassName(event.target.value)}
                        placeholder="Ex: L3-INFO-A"
                        className="mt-4 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !className.trim()}
                        className="mt-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                    >
                        Creer la classe
                    </button>
                </form>

                <form className="rounded-xl border border-primary-500/30 p-5" onSubmit={handleCreateCourse}>
                    <h2 className="text-xl font-semibold">Creer un cours</h2>
                    <p className="mt-1 text-sm text-gray-300">Ajoute un cours rattache a ton profil professeur.</p>
                    <input
                        type="text"
                        required
                        value={courseName}
                        onChange={(event) => setCourseName(event.target.value)}
                        placeholder="Ex: GraphQL avance"
                        className="mt-4 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !courseName.trim()}
                        className="mt-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                    >
                        Creer le cours
                    </button>
                </form>
            </div>

            <form className="mt-8 rounded-xl border border-primary-500/30 p-5" onSubmit={handleAssignStudent}>
                <h2 className="text-xl font-semibold">Associer un etudiant a une classe</h2>
                <p className="mt-1 text-sm text-gray-300">Choisis une classe puis un etudiant.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="class-select" className="mb-2 block text-sm text-gray-200">Classe</label>
                        <select
                            id="class-select"
                            value={selectedClassId}
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                        >
                            {sortedClasses.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.name} ({classItem.studentCount} etudiants)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="student-select" className="mb-2 block text-sm text-gray-200">Etudiant</label>
                        <select
                            id="student-select"
                            value={selectedStudentId}
                            onChange={(event) => setSelectedStudentId(event.target.value)}
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                        >
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.pseudo} - {student.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !selectedClassId || !selectedStudentId || isLoading}
                    className="mt-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                >
                    Associer
                </button>
            </form>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <form className="rounded-xl border border-primary-500/30 p-5" onSubmit={handleUpdateClass}>
                    <h2 className="text-xl font-semibold">Modifier une classe</h2>
                    <p className="mt-1 text-sm text-gray-300">Seules tes classes sont disponibles.</p>
                    <select
                        value={selectedClassToEditId}
                        onChange={(event) => setSelectedClassToEditId(event.target.value)}
                        className="mt-4 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    >
                        {sortedClasses.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        required
                        value={updatedClassName}
                        onChange={(event) => setUpdatedClassName(event.target.value)}
                        placeholder="Nouveau nom de classe"
                        className="mt-3 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    />
                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedClassToEditId || !updatedClassName.trim()}
                            className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                        >
                            Modifier
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClass}
                            disabled={isSubmitting || !selectedClassToEditId}
                            className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 font-semibold text-red-200"
                        >
                            Supprimer
                        </button>
                    </div>
                </form>

                <form className="rounded-xl border border-primary-500/30 p-5" onSubmit={handleUpdateCourse}>
                    <h2 className="text-xl font-semibold">Modifier un cours</h2>
                    <p className="mt-1 text-sm text-gray-300">Seuls tes cours sont disponibles.</p>
                    <select
                        value={selectedCourseToEditId}
                        onChange={(event) => setSelectedCourseToEditId(event.target.value)}
                        className="mt-4 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    >
                        {sortedCourses.map((courseItem) => (
                            <option key={courseItem.id} value={courseItem.id}>
                                {courseItem.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        required
                        value={updatedCourseName}
                        onChange={(event) => setUpdatedCourseName(event.target.value)}
                        placeholder="Nouveau nom de cours"
                        className="mt-3 w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                    />
                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedCourseToEditId || !updatedCourseName.trim()}
                            className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                        >
                            Modifier
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteCourse}
                            disabled={isSubmitting || !selectedCourseToEditId}
                            className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 font-semibold text-red-200"
                        >
                            Supprimer
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 rounded-xl border border-primary-500/30 p-5">
                <h2 className="text-xl font-semibold">Classes existantes</h2>
                {isLoading ? <p className="mt-3 text-gray-300">Chargement...</p> : null}
                {!isLoading && sortedClasses.length === 0 ? (
                    <p className="mt-3 text-gray-300">Aucune classe dont tu es responsable pour le moment.</p>
                ) : null}
                {!isLoading && sortedClasses.length > 0 ? (
                    <ul className="mt-3 grid gap-2 text-sm text-gray-200">
                        {sortedClasses.map((classItem) => (
                            <li key={classItem.id} className="rounded-md border border-primary-500/20 px-3 py-2">
                                {classItem.name} - {classItem.studentCount} etudiants
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <div className="mt-8 rounded-xl border border-primary-500/30 p-5">
                <h2 className="text-xl font-semibold">Cours existants</h2>
                {!isLoading && sortedCourses.length === 0 ? (
                    <p className="mt-3 text-gray-300">Aucun cours dont tu es responsable pour le moment.</p>
                ) : null}
                {!isLoading && sortedCourses.length > 0 ? (
                    <ul className="mt-3 grid gap-2 text-sm text-gray-200">
                        {sortedCourses.map((courseItem) => (
                            <li key={courseItem.id} className="rounded-md border border-primary-500/20 px-3 py-2">
                                {courseItem.name}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </PageSection>
    )
}
