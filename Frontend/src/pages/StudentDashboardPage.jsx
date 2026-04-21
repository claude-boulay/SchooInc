import { useEffect, useMemo, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchStudentDashboardData } from '../lib/authApi'
import { getAuthUser } from '../lib/authSession'

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

    return (
        <PageSection title="Dashboard etudiant" subtitle="Resume des cours, classes et notes de l etudiant connecte.">
            {error ? (
                <p className="mb-6 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {isLoading ? (
                <p className="text-gray-200">Chargement des informations etudiant...</p>
            ) : null}

            {!isLoading && !error && classes.length === 0 ? (
                <p className="rounded-lg border border-primary-500/30 bg-black/40 px-4 py-3 text-gray-200">
                    Tu n es inscrit a aucune classe pour le moment.
                </p>
            ) : null}

            {!isLoading && !error && classes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {classes.map((classItem) => (
                        <article key={classItem.id} className="rounded-xl border border-primary-500/30 bg-black/40 p-5">
                            <p className="text-xs uppercase tracking-wide text-primary-300">Classe</p>
                            <h2 className="mt-1 text-xl font-semibold text-white">{classItem.name}</h2>

                            <p className="mt-4 text-xs uppercase tracking-wide text-primary-300">Prof referent</p>
                            <p className="mt-1 text-lg text-gray-100">{classItem.professorPseudo}</p>
                        </article>
                    ))}
                </div>
            ) : null}
        </PageSection>
    )
}
