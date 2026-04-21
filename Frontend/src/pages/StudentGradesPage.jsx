import { useEffect, useMemo, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchStudentEventGradesData } from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

export default function StudentGradesPage() {
    const currentUser = useMemo(() => getAuthUser(), [])
    const [events, setEvents] = useState([])
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

    return (
        <PageSection title="Mes notes" subtitle="Notes de l etudiant connecte, associees aux evenements de cours.">
            {error ? (
                <p className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-gray-200">Chargement des notes...</p> : null}

            {!isLoading && !error && events.length === 0 ? (
                <p className="rounded-lg border border-primary-500/30 bg-black/40 px-4 py-3 text-gray-200">
                    Aucun evenement de cours pour le moment.
                </p>
            ) : null}

            {!isLoading && !error && events.length > 0 ? (
                <ul className="space-y-3">
                    {events.map((eventItem) => (
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
            ) : null}
        </PageSection>
    )
}
