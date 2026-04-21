import { useEffect, useMemo, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchStudentDashboardData } from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

function startOfCurrentWeekMonday() {
    const now = new Date()
    const monday = new Date(now)
    const day = monday.getDay()
    const mondayOffset = (day + 6) % 7

    monday.setDate(monday.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)
    return monday
}

function localDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function StudentDashboardPage() {
    const currentUser = useMemo(() => getAuthUser(), [])
    const [classes, setClasses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.id) {
                setError('Utilisateur introuvable. Reconnecte toi.')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError('')

            try {
                const data = await fetchStudentDashboardData({ studentId: currentUser.id })
                setClasses(data.classes)
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [currentUser?.id])

    const events = useMemo(
        () =>
            classes
                .flatMap((classItem) =>
                    (classItem.events || []).map((eventItem) => ({
                        id: eventItem.id,
                        className: classItem.name,
                        professorPseudo: classItem.professorPseudo,
                        courseName: eventItem.course?.name || 'Cours inconnu',
                        startTime: eventItem.startTime,
                        endTime: eventItem.endTime,
                    })),
                )
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
        [classes],
    )

    const weekCalendar = useMemo(() => {
        const monday = startOfCurrentWeekMonday()
        const days = Array.from({ length: 5 }, (_, index) => {
            const date = new Date(monday)
            date.setDate(monday.getDate() + index)

            return {
                label: WEEKDAY_LABELS[index],
                key: localDateKey(date),
                date,
                events: [],
            }
        })

        const dayMap = new Map(days.map((day) => [day.key, day]))

        events.forEach((eventItem) => {
            const start = new Date(eventItem.startTime)
            const key = localDateKey(start)
            const day = dayMap.get(key)

            if (day) {
                day.events.push(eventItem)
            }
        })

        days.forEach((day) => {
            day.events.sort((a, b) => a.startTime.localeCompare(b.startTime))
        })

        return days
    }, [events])

    return (
        <PageSection title="Calendrier etudiant" subtitle="Vue dediee aux evenements de cours de l etudiant connecte.">
            {error ? (
                <p className="mb-6 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? (
                <p className="text-gray-200">Chargement du calendrier...</p>
            ) : null}

            {!isLoading && !error && events.length === 0 ? (
                <p className="rounded-lg border border-primary-500/30 bg-black/40 px-4 py-3 text-gray-200">
                    Aucun evenement prevu pour le moment.
                </p>
            ) : null}

            {!isLoading && !error && events.length > 0 ? (
                <div className="overflow-x-auto">
                    <div className="grid min-w-[960px] grid-cols-5 gap-3">
                        {weekCalendar.map((day) => (
                            <section key={day.key} className="rounded-xl border border-primary-500/30 bg-black/40 p-4">
                                <p className="text-sm font-semibold text-white">{day.label}</p>
                                <p className="text-xs text-gray-300">{day.date.toLocaleDateString()}</p>

                                {day.events.length === 0 ? (
                                    <p className="mt-4 text-xs text-gray-400">Aucun evenement</p>
                                ) : (
                                    <ul className="mt-3 space-y-2">
                                        {day.events.map((eventItem) => (
                                            <li key={eventItem.id} className="rounded-md border border-white/10 bg-white/5 p-2">
                                                <p className="text-sm font-medium text-white">{eventItem.courseName}</p>
                                                <p className="text-xs text-primary-200">{eventItem.className}</p>
                                                <p className="text-xs text-gray-300">{eventItem.professorPseudo}</p>
                                                <p className="mt-1 text-xs text-gray-300">
                                                    {new Date(eventItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(eventItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>
                </div>
            ) : null}
        </PageSection>
    )
}
