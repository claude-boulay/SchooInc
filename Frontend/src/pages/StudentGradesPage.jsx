import { useEffect, useMemo, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchStudentEventGradesData } from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

const formatAverage = (value) => (value === null || value === undefined ? 'N/A' : `${Number(value).toFixed(2)}/20`)

export default function StudentGradesPage() {
    const currentUser = useMemo(() => getAuthUser(), [])
    const [events, setEvents] = useState([])
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadGrades = async () => {
            if (!currentUser?.id) {
                setError('Utilisateur introuvable. Reconnecte toi.')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError('')

            try {
                const data = await fetchStudentEventGradesData({ studentId: currentUser.id })
                setEvents(data.events)
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadGrades()
    }, [currentUser?.id])

    const courses = useMemo(() => {
        const map = new Map()
        events.forEach((eventItem) => {
            if (!map.has(eventItem.courseId)) {
                map.set(eventItem.courseId, { id: eventItem.courseId, name: eventItem.courseName })
            }
        })
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [events])

    const statsByCourse = useMemo(() => {
        const byCourse = new Map()
        events.forEach((eventItem) => {
            if (eventItem.gradeValue === null || eventItem.gradeValue === undefined) {
                return
            }
            const entry = byCourse.get(eventItem.courseId) || {
                courseId: eventItem.courseId,
                courseName: eventItem.courseName,
                values: [],
            }
            entry.values.push(Number(eventItem.gradeValue))
            byCourse.set(eventItem.courseId, entry)
        })

        return Array.from(byCourse.values())
            .map((entry) => ({
                ...entry,
                average: entry.values.reduce((sum, value) => sum + value, 0) / entry.values.length,
                count: entry.values.length,
            }))
            .sort((a, b) => a.courseName.localeCompare(b.courseName))
    }, [events])

    const globalStats = useMemo(() => {
        const gradedValues = events
            .filter((eventItem) => eventItem.gradeValue !== null && eventItem.gradeValue !== undefined)
            .map((eventItem) => Number(eventItem.gradeValue))

        if (gradedValues.length === 0) {
            return null
        }

        return {
            average: gradedValues.reduce((sum, value) => sum + value, 0) / gradedValues.length,
            count: gradedValues.length,
        }
    }, [events])

    const filteredEvents = useMemo(() => {
        if (!selectedCourseId) {
            return events
        }
        return events.filter((eventItem) => eventItem.courseId === selectedCourseId)
    }, [events, selectedCourseId])

    const selectedCourseStats = useMemo(() => {
        if (!selectedCourseId) {
            return null
        }
        return statsByCourse.find((entry) => entry.courseId === selectedCourseId) || null
    }, [selectedCourseId, statsByCourse])

    return (
        <PageSection title="Mes notes" subtitle="Notes de l etudiant connecte, filtrables par cours avec moyennes.">
            {error ? (
                <p className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-gray-200">Chargement des notes...</p> : null}

            {!isLoading && !error ? (
                <div className="grid gap-6">
                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <h2 className="text-lg font-semibold text-white">Ma moyenne globale</h2>
                        <p className="mt-2 text-2xl font-bold text-primary-200">
                            {globalStats ? formatAverage(globalStats.average) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-300">
                            Calculee sur {globalStats?.count ?? 0} note{(globalStats?.count ?? 0) > 1 ? 's' : ''}.
                        </p>
                    </section>

                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <h2 className="text-lg font-semibold text-white">Moyennes par cours</h2>
                        {statsByCourse.length === 0 ? (
                            <p className="mt-2 text-sm text-gray-400">Aucune note pour le moment.</p>
                        ) : (
                            <ul className="mt-3 grid gap-2 md:grid-cols-2">
                                {statsByCourse.map((entry) => (
                                    <li key={entry.courseId} className="rounded-md border border-primary-500/20 bg-black/50 p-3">
                                        <p className="font-semibold text-white">{entry.courseName}</p>
                                        <p className="text-sm text-primary-200">Moyenne: {formatAverage(entry.average)}</p>
                                        <p className="text-xs text-gray-400">{entry.count} note{entry.count > 1 ? 's' : ''}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-lg font-semibold text-white">Detail des evenements</h2>
                            <select
                                value={selectedCourseId}
                                onChange={(event) => setSelectedCourseId(event.target.value)}
                                className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-2 md:max-w-xs"
                            >
                                <option value="">Tous les cours</option>
                                {courses.map((courseItem) => (
                                    <option key={courseItem.id} value={courseItem.id}>{courseItem.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedCourseStats ? (
                            <p className="mt-3 text-sm text-primary-200">
                                Moyenne {selectedCourseStats.courseName}: <span className="font-semibold">{formatAverage(selectedCourseStats.average)}</span> ({selectedCourseStats.count} note{selectedCourseStats.count > 1 ? 's' : ''})
                            </p>
                        ) : null}

                        {filteredEvents.length === 0 ? (
                            <p className="mt-3 rounded-lg border border-primary-500/30 bg-black/40 px-4 py-3 text-gray-200">
                                Aucun evenement a afficher.
                            </p>
                        ) : (
                            <ul className="mt-3 space-y-3">
                                {filteredEvents.map((eventItem) => (
                                    <li key={eventItem.id} className="rounded-xl border border-primary-500/30 bg-black/40 p-4">
                                        <p className="font-semibold text-white">{eventItem.courseName}</p>
                                        <p className="text-sm text-gray-300">Classe: {eventItem.className}</p>
                                        <p className="text-sm text-gray-300">
                                            Date: {new Date(eventItem.startTime).toLocaleDateString()} - Debut: {new Date(eventItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Fin: {new Date(eventItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="mt-1 font-medium text-primary-200">
                                            Note: {eventItem.gradeValue === null ? 'Non notee' : `${eventItem.gradeValue}/20`}
                                        </p>
                                        {eventItem.gradeComment ? (
                                            <p className="text-sm text-gray-300">Commentaire: {eventItem.gradeComment}</p>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            ) : null}
        </PageSection>
    )
}
