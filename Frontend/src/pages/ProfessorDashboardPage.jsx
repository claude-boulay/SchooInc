import PageSection from '../components/PageSection'
import { useEffect, useMemo, useState } from 'react'
import {
    addStudentToProfessorClass,
    createEventGradesBatch,
    createProfessorClass,
    createProfessorCourse,
    deleteProfessorClass,
    deleteProfessorCourse,
    fetchProfessorDashboardData,
    removeStudentFromProfessorClass,
    updateProfessorClass,
    updateProfessorCourse,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
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
    const [eventDate, setEventDate] = useState('')
    const [eventStartTime, setEventStartTime] = useState('')
    const [eventEndTime, setEventEndTime] = useState('')
    const [eventCourseId, setEventCourseId] = useState('')
    const [eventClassId, setEventClassId] = useState('')
    const [selectedEventToGradeId, setSelectedEventToGradeId] = useState('')
    const [gradeValuesByStudentId, setGradeValuesByStudentId] = useState({})
    const [gradeCommentsByStudentId, setGradeCommentsByStudentId] = useState({})
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

    const studentsById = useMemo(() => {
        const map = new Map()
        students.forEach((student) => {
            map.set(student.id, student)
        })
        return map
    }, [students])

    const eventsToGrade = useMemo(
        () =>
            sortedClasses.flatMap((classItem) =>
                (classItem.events || []).map((eventItem) => ({
                    id: eventItem.id,
                    classId: classItem.id,
                    className: classItem.name,
                    courseId: eventItem.courseId,
                    courseName: eventItem.course?.name || 'Cours inconnu',
                    startTime: eventItem.startTime,
                    endTime: eventItem.endTime,
                    studentIds: (classItem.enrollments || []).map((enrollment) => enrollment.studentId),
                })),
            ),
        [sortedClasses],
    )

    const selectedEventToGrade = useMemo(
        () => eventsToGrade.find((eventItem) => eventItem.id === selectedEventToGradeId) || null,
        [eventsToGrade, selectedEventToGradeId],
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
            setEventClassId((previous) => (ownedClasses.some((item) => item.id === previous) ? previous : ownedClasses[0].id))
        } else {
            setSelectedClassId('')
            setSelectedClassToEditId('')
            setEventClassId('')
        }

        const ownedEvents = ownedClasses.flatMap((classItem) => classItem.events || [])
        if (ownedEvents.length > 0) {
            setSelectedEventToGradeId((previous) =>
                ownedEvents.some((eventItem) => eventItem.id === previous) ? previous : ownedEvents[0].id,
            )
        } else {
            setSelectedEventToGradeId('')
        }

        if (ownedCourses.length > 0) {
            setSelectedCourseToEditId((previous) => (ownedCourses.some((item) => item.id === previous) ? previous : ownedCourses[0].id))
            setEventCourseId((previous) => (ownedCourses.some((item) => item.id === previous) ? previous : ownedCourses[0].id))
        } else {
            setSelectedCourseToEditId('')
            setEventCourseId('')
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

    const handleRemoveStudent = async ({ classId, studentId }) => {
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await removeStudentFromProfessorClass({ classId, studentId })
            await reloadDashboardData()
            setSuccess('Etudiant retire de la classe avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateCalendarEvent = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            const startStr = new Date(`${eventDate}T${eventStartTime}:00`).toISOString()
            const endStr = new Date(`${eventDate}T${eventEndTime}:00`).toISOString()
            await createCalendarEvent({
                startTime: startStr,
                endTime: endStr,
                courseId: eventCourseId,
                classId: eventClassId,
            })
            setEventDate('')
            setEventStartTime('')
            setEventEndTime('')
            await reloadDashboardData()
            setSuccess('Evenement ajoute au calendrier avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCalendarEvent = async (eventId) => {
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await deleteCalendarEvent({ id: eventId })
            await reloadDashboardData()
            setSuccess('Evenement supprime avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGradeValueChange = (studentId, nextValue) => {
        setGradeValuesByStudentId((previous) => ({
            ...previous,
            [studentId]: nextValue,
        }))
    }

    const handleGradeCommentChange = (studentId, nextComment) => {
        setGradeCommentsByStudentId((previous) => ({
            ...previous,
            [studentId]: nextComment,
        }))
    }

    const handleGradeEvent = async (event) => {
        event.preventDefault()

        if (!selectedEventToGrade) {
            return
        }

        const grades = selectedEventToGrade.studentIds
            .map((studentId) => {
                const rawValue = gradeValuesByStudentId[studentId]
                if (rawValue === undefined || rawValue === '') {
                    return null
                }

                return {
                    studentId,
                    value: Number(rawValue),
                    comment: gradeCommentsByStudentId[studentId]?.trim() || null,
                }
            })
            .filter(Boolean)

        if (grades.length === 0) {
            setError('Renseigne au moins une note avant validation.')
            return
        }

        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            await createEventGradesBatch({
                eventId: selectedEventToGrade.id,
                courseId: selectedEventToGrade.courseId,
                grades,
            })

            setGradeValuesByStudentId({})
            setGradeCommentsByStudentId({})
            setSuccess('Notation de l evenement enregistree avec succes.')
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
                                <details>
                                    <summary className="cursor-pointer select-none font-medium">
                                        {classItem.name} - {classItem.studentCount} etudiants
                                    </summary>
                                    <div className="mt-3 space-y-2">
                                        {classItem.enrollments.length === 0 ? (
                                            <p className="text-gray-300">Aucun etudiant inscrit.</p>
                                        ) : (
                                            classItem.enrollments.map((enrollment) => {
                                                const student = studentsById.get(enrollment.studentId)
                                                return (
                                                    <div
                                                        key={`${enrollment.classId}-${enrollment.studentId}`}
                                                        className="flex items-center justify-between rounded-md border border-primary-500/20 px-3 py-2"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {student ? student.pseudo : enrollment.studentId}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {student ? student.email : 'Etudiant inconnu'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveStudent({
                                                                classId: classItem.id,
                                                                studentId: enrollment.studentId,
                                                            })}
                                                            disabled={isSubmitting}
                                                            className="rounded-lg border border-red-400/60 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </details>
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

            <div className="mt-8 rounded-xl border border-primary-500/30 p-5">
                <h2 className="text-xl font-semibold">Calendrier</h2>
                <p className="mt-1 text-sm text-gray-300">Ajouter ou modifier des evenements.</p>

                <form className="mt-4 grid gap-4" onSubmit={handleCreateCalendarEvent}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-gray-200">Date</label>
                            <input
                                type="date"
                                required
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm text-gray-200">Debut</label>
                                <input
                                    type="time"
                                    required
                                    value={eventStartTime}
                                    onChange={(e) => setEventStartTime(e.target.value)}
                                    className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-200">Fin</label>
                                <input
                                    type="time"
                                    required
                                    value={eventEndTime}
                                    onChange={(e) => setEventEndTime(e.target.value)}
                                    className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm text-gray-200">Classe</label>
                            <select
                                required
                                value={eventClassId}
                                onChange={(e) => setEventClassId(e.target.value)}
                                className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                            >
                                {sortedClasses.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-200">Cours</label>
                            <select
                                required
                                value={eventCourseId}
                                onChange={(e) => setEventCourseId(e.target.value)}
                                className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                            >
                                {sortedCourses.map((co) => <option key={co.id} value={co.id}>{co.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !eventClassId || !eventCourseId || !eventDate || !eventStartTime || !eventEndTime}
                        className="mt-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 text-left font-semibold inline-block w-max text-white"
                    >
                        Ajouter l evenement
                    </button>
                </form>

                <div className="mt-8">
                    <h3 className="font-semibold text-lg border-b border-primary-500/20 pb-2">Evenements a venir (par classe)</h3>
                    {sortedClasses.length === 0 ? <p className="mt-3 text-sm text-gray-300">Aucune classe.</p> : null}
                    {sortedClasses.map((cl) => {
                        const events = cl.events || []
                        if (events.length === 0) return null

                        return (
                            <div key={cl.id} className="mt-4">
                                <h4 className="font-medium text-primary-300">{cl.name}</h4>
                                <ul className="mt-2 space-y-2">
                                    {events.map((ev) => (
                                        <li key={ev.id} className="flex justify-between items-center bg-black/40 border border-primary-500/20 p-3 rounded-md text-sm">
                                            <div>
                                                <p className="font-semibold">{ev.course?.name || 'Cours inconnu'}</p>
                                                <p className="text-gray-300">
                                                    {new Date(ev.startTime).toLocaleDateString()} de {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} a {new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCalendarEvent(ev.id)}
                                                disabled={isSubmitting}
                                                className="text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1 rounded"
                                            >
                                                Supprimer
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-8 rounded-xl border border-primary-500/30 p-5">
                <h2 className="text-xl font-semibold">Noter un evenement</h2>
                <p className="mt-1 text-sm text-gray-300">Choisis un evenement puis attribue une note sur 20 aux etudiants de la classe.</p>

                {eventsToGrade.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-300">Aucun evenement disponible pour la notation.</p>
                ) : (
                    <form className="mt-4" onSubmit={handleGradeEvent}>
                        <label className="mb-2 block text-sm text-gray-200" htmlFor="event-to-grade-select">
                            Evenement
                        </label>
                        <select
                            id="event-to-grade-select"
                            value={selectedEventToGradeId}
                            onChange={(event) => setSelectedEventToGradeId(event.target.value)}
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                        >
                            {eventsToGrade.map((eventItem) => (
                                <option key={eventItem.id} value={eventItem.id}>
                                    {eventItem.className} - {eventItem.courseName} - {new Date(eventItem.startTime).toLocaleDateString()} {new Date(eventItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </option>
                            ))}
                        </select>

                        {selectedEventToGrade && selectedEventToGrade.studentIds.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {selectedEventToGrade.studentIds.map((studentId) => {
                                    const student = studentsById.get(studentId)

                                    return (
                                        <div key={studentId} className="rounded-md border border-primary-500/20 bg-black/40 p-3">
                                            <p className="font-medium text-white">{student ? student.pseudo : studentId}</p>
                                            <p className="text-xs text-gray-400">{student ? student.email : 'Etudiant inconnu'}</p>
                                            <div className="mt-2 grid gap-3 md:grid-cols-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    step="0.25"
                                                    placeholder="Note /20"
                                                    value={gradeValuesByStudentId[studentId] || ''}
                                                    onChange={(event) => handleGradeValueChange(studentId, event.target.value)}
                                                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Commentaire (optionnel)"
                                                    value={gradeCommentsByStudentId[studentId] || ''}
                                                    onChange={(event) => handleGradeCommentChange(studentId, event.target.value)}
                                                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}

                        {selectedEventToGrade && selectedEventToGrade.studentIds.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-300">Aucun etudiant inscrit dans la classe de cet evenement.</p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !selectedEventToGrade ||
                                selectedEventToGrade.studentIds.length === 0
                            }
                            className="mt-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold"
                        >
                            Enregistrer les notes
                        </button>
                    </form>
                )}
            </div>
        </PageSection>
    )
}
