import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageSection from '../components/PageSection'
import { deleteMyAccount, fetchStudentDashboardData, fetchStudentEventGradesData, updateMyProfile } from '../lib/authApi'
import { clearAuthSession, getAuthUser, updateStoredAuthUser } from '../lib/authSession'

export default function ProfilePage() {
    const navigate = useNavigate()
    const initialUser = getAuthUser()
    const [email, setEmail] = useState(initialUser?.email || '')
    const [pseudo, setPseudo] = useState(initialUser?.pseudo || '')
    const [currentEmail, setCurrentEmail] = useState(initialUser?.email || '')
    const [currentPseudo, setCurrentPseudo] = useState(initialUser?.pseudo || '')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [studentEvents, setStudentEvents] = useState([])
    const [isLoadingGrades, setIsLoadingGrades] = useState(false)
    const [gradesError, setGradesError] = useState('')
    const [studentClasses, setStudentClasses] = useState([])
    const [isLoadingStudentInfo, setIsLoadingStudentInfo] = useState(false)
    const [studentInfoError, setStudentInfoError] = useState('')

    useEffect(() => {
        const loadStudentInfo = async () => {
            if (!initialUser?.id || initialUser.role !== 'STUDENT') {
                return
            }

            setIsLoadingStudentInfo(true)
            setStudentInfoError('')

            try {
                const data = await fetchStudentDashboardData({ studentId: initialUser.id })
                setStudentClasses(data.classes)
            } catch (loadError) {
                setStudentInfoError(loadError.message)
            } finally {
                setIsLoadingStudentInfo(false)
            }
        }

        loadStudentInfo()

        const loadGrades = async () => {
            if (!initialUser?.id || initialUser.role !== 'STUDENT') {
                return
            }

            setIsLoadingGrades(true)
            setGradesError('')

            try {
                const data = await fetchStudentEventGradesData({ studentId: initialUser.id })
                setStudentEvents(data.events)
            } catch (loadError) {
                setGradesError(loadError.message)
            } finally {
                setIsLoadingGrades(false)
            }
        }

        loadGrades()
    }, [initialUser?.id, initialUser?.role])

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        try {
            const updatedUser = await updateMyProfile({
                email: email.trim(),
                pseudo: pseudo.trim(),
            })

            updateStoredAuthUser({
                email: updatedUser.email,
                pseudo: updatedUser.pseudo,
            })

            setCurrentEmail(updatedUser.email)
            setCurrentPseudo(updatedUser.pseudo)
            setEmail(updatedUser.email)
            setPseudo(updatedUser.pseudo)
            setSuccess('Profil mis a jour avec succes.')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Confirmer la suppression de ton compte ? Cette action est irreversible.')
        if (!confirmed) {
            return
        }

        setError('')
        setSuccess('')
        setIsDeleting(true)

        try {
            const deleted = await deleteMyAccount()
            if (!deleted) {
                throw new Error('La suppression du compte a echoue.')
            }

            clearAuthSession()
            navigate('/login')
        } catch (deleteError) {
            setError(deleteError.message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <PageSection title="Profil utilisateur" subtitle="Afficher et modifier ses informations personnelles.">
            <div className="mb-6 rounded-lg border border-primary-500/30 bg-black/40 p-4 text-sm text-gray-200">
                <p>Email actuel: <span className="font-semibold text-white">{currentEmail || 'N/A'}</span></p>
                <p className="mt-1">Pseudo actuel: <span className="font-semibold text-white">{currentPseudo || 'N/A'}</span></p>
            </div>

            {error ? (
                <p className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            ) : null}

            {success ? (
                <p className="mb-4 rounded-lg border border-green-400/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                    {success}
                </p>
            ) : null}

            <form className="grid gap-4 md:max-w-xl" onSubmit={handleSubmit}>
                <label className="text-sm text-gray-300" htmlFor="profile-email">Email</label>
                <input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <label className="text-sm text-gray-300" htmlFor="profile-pseudo">Pseudo</label>
                <input
                    id="profile-pseudo"
                    type="text"
                    required
                    value={pseudo}
                    onChange={(event) => setPseudo(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <button
                    type="submit"
                    disabled={isSubmitting || isDeleting || !email.trim() || !pseudo.trim()}
                    className="mt-2 w-fit rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-3 font-semibold"
                >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>

                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isSubmitting || isDeleting}
                    className="mt-2 w-fit rounded-lg border border-red-400/70 bg-red-500/10 px-5 py-3 font-semibold text-red-200"
                >
                    {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
                </button>
            </form>

            {initialUser?.role === 'STUDENT' ? (
                <div className="mt-10 rounded-xl border border-primary-500/30 p-5">
                    <h2 className="text-xl font-semibold">Mes classes et calendrier</h2>
                    <p className="mt-1 text-sm text-gray-300">Informations de suivi de ta scolarite directement depuis ton profil.</p>

                    {studentInfoError ? (
                        <p className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {studentInfoError}
                        </p>
                    ) : null}

                    {isLoadingStudentInfo ? <p className="mt-4 text-sm text-gray-300">Chargement des informations...</p> : null}

                    {!isLoadingStudentInfo && !studentInfoError && studentClasses.length === 0 ? (
                        <p className="mt-4 text-sm text-gray-300">Tu n es inscrit a aucune classe pour le moment.</p>
                    ) : null}

                    {!isLoadingStudentInfo && !studentInfoError && studentClasses.length > 0 ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {studentClasses.map((classItem) => (
                                <article key={classItem.id} className="rounded-md border border-primary-500/20 bg-black/40 p-3">
                                    <p className="font-medium text-white">{classItem.name}</p>
                                    <p className="text-sm text-gray-300">Professeur: {classItem.professorPseudo}</p>
                                    <p className="text-sm text-gray-300">{classItem.events?.length || 0} evenement(s) associe(s)</p>
                                </article>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {initialUser?.role === 'STUDENT' ? (
                <div className="mt-10 rounded-xl border border-primary-500/30 p-5">
                    <h2 className="text-xl font-semibold">Mes notes par evenement</h2>
                    <p className="mt-1 text-sm text-gray-300">Chaque ligne represente un evenement de cours et la note associee.</p>

                    {gradesError ? (
                        <p className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {gradesError}
                        </p>
                    ) : null}

                    {isLoadingGrades ? <p className="mt-4 text-sm text-gray-300">Chargement des notes...</p> : null}

                    {!isLoadingGrades && !gradesError && studentEvents.length === 0 ? (
                        <p className="mt-4 text-sm text-gray-300">Aucun evenement pour le moment.</p>
                    ) : null}

                    {!isLoadingGrades && !gradesError && studentEvents.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-sm text-gray-100">
                            {studentEvents.map((eventItem) => (
                                <li key={eventItem.id} className="rounded-md border border-primary-500/20 bg-black/40 p-3">
                                    <p className="font-medium text-white">{eventItem.courseName} - {eventItem.className}</p>
                                    <p className="text-gray-300">
                                        {new Date(eventItem.startTime).toLocaleDateString()} de {new Date(eventItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} a {new Date(eventItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="mt-1 text-primary-200 font-semibold">
                                        Note: {eventItem.gradeValue === null ? 'Non notee' : `${eventItem.gradeValue}/20`}
                                    </p>
                                    {eventItem.gradeComment ? (
                                        <p className="text-gray-300">Commentaire: {eventItem.gradeComment}</p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </PageSection>
    )
}
