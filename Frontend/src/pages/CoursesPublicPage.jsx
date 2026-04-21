import { useEffect, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchPublicCoursesData } from '../lib/authApi'

export default function CoursesPublicPage() {
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadCourses = async () => {
            setIsLoading(true)
            setError('')

            try {
                const data = await fetchPublicCoursesData()
                setCourses(data.courses)
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadCourses()
    }, [])

    return (
        <PageSection title="Liste des cours" subtitle="Page publique: consultation des cours disponibles.">
            {error ? (
                <p className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-gray-200">Chargement des cours...</p> : null}

            {!isLoading && !error && courses.length === 0 ? (
                <p className="rounded-lg border border-primary-500/30 bg-black/40 px-4 py-3 text-gray-200">
                    Aucun cours disponible pour le moment.
                </p>
            ) : null}

            {!isLoading && !error && courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {courses.map((course) => (
                        <article key={course.id} className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                            <h2 className="text-xl font-semibold text-white">{course.name}</h2>
                            <p className="mt-1 text-sm text-primary-200">
                                {course.events.length} evenement{course.events.length > 1 ? 's' : ''} associe{course.events.length > 1 ? 's' : ''}
                            </p>

                            <div className="mt-4 border-t border-primary-500/30 pt-3">
                                <p className="text-xs uppercase tracking-wide text-primary-300">Evenements</p>

                                {course.events.length > 0 ? (
                                    <ul className="mt-2 space-y-2 text-sm text-gray-100">
                                        {course.events.map((eventItem) => {
                                            const startDate = new Date(eventItem.startTime)
                                            const endDate = new Date(eventItem.endTime)

                                            return (
                                                <li key={eventItem.id} className="rounded border border-white/10 bg-white/5 p-3">
                                                    <p className="font-medium text-white">{eventItem.className}</p>
                                                    <p className="text-gray-300">
                                                        Date: {startDate.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-gray-300">
                                                        Debut: {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-gray-300">
                                                        Fin: {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-400">Aucun evenement associe.</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </PageSection>
    )
}
