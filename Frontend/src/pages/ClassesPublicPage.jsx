import { useEffect, useState } from 'react'
import PageSection from '../components/PageSection'
import { fetchPublicClassesData } from '../lib/authApi'

export default function ClassesPublicPage() {
    const [classes, setClasses] = useState([])
    const [sort, setSort] = useState('ASC')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadClasses = async () => {
            setIsLoading(true)
            setError('')

            try {
                const data = await fetchPublicClassesData({ sort })
                setClasses(data.classes)
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadClasses()
    }, [sort])

    return (
        <PageSection title="Liste des classes" subtitle="Page publique: tri et consultation des classes.">
            <div className="mb-6 flex items-center gap-3">
                <label className="text-sm text-ink-800" htmlFor="classes-sort">
                    Tri
                </label>
                <select
                    id="classes-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="rounded-md border border-ink-500/40 bg-white/60 px-3 py-2 text-sm text-black"
                >
                    <option value="ASC">Nom (A-Z)</option>
                    <option value="DESC">Nom (Z-A)</option>
                </select>
            </div>

            {error ? (
                <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            {isLoading ? <p className="text-ink-800">Chargement des classes...</p> : null}

            {!isLoading && !error && classes.length === 0 ? (
                <p className="rounded-lg border border-ink-500/30 bg-white/60 px-4 py-3 text-ink-800">
                    Aucune classe disponible pour le moment.
                </p>
            ) : null}

            {!isLoading && !error && classes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {classes.map((classItem) => (
                        <article key={classItem.id} className="rounded-xl border border-ink-500/30 bg-white/60 p-5">
                            <h2 className="text-xl font-semibold text-black">{classItem.name}</h2>
                            <p className="mt-1 text-sm text-accent-600">
                                {classItem.studentCount} eleve{classItem.studentCount > 1 ? 's' : ''}
                            </p>

                            <div className="mt-4 border-t border-ink-500/30 pt-3">
                                <p className="text-xs uppercase tracking-wide text-accent-700">Eleves</p>
                                {classItem.students.length > 0 ? (
                                    <ul className="mt-2 space-y-1 text-sm text-black">
                                        {classItem.students.map((student) => (
                                            <li key={student.id}>{student.pseudo}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-ink-600">Aucun eleve inscrit.</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </PageSection>
    )
}
