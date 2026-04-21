import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, saveAuthSession } from '../lib/authApi'

export default function SignupPage() {
    const navigate = useNavigate()
    const [pseudo, setPseudo] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('STUDENT')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }

        setIsSubmitting(true)

        try {
            const authPayload = await registerUser({ email, pseudo, password, role })
            saveAuthSession(authPayload)
            navigate('/')
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-primary-500/40 bg-gradient-to-b from-primary-500/15 to-black p-8 shadow-2xl shadow-primary-500/10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">S inscrire</h1>
                    <p className="mt-2 text-gray-300">Cree ton compte SchooInc.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="pseudo" className="mb-2 block text-sm text-gray-200">
                            Pseudo
                        </label>
                        <input
                            id="pseudo"
                            type="text"
                            required
                            value={pseudo}
                            onChange={(event) => setPseudo(event.target.value)}
                            placeholder="ton pseudo"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm text-gray-200">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="nom@ecole.fr"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm text-gray-200">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="mb-2 block text-sm text-gray-200">
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="mb-2 block text-sm text-gray-200">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white outline-none transition-colors focus:border-primary-400"
                        >
                            <option value="STUDENT">Etudiant</option>
                            <option value="PROFESSOR">Professeur</option>
                        </select>
                    </div>

                    {error ? (
                        <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        {isSubmitting ? 'Creation...' : 'Creer mon compte'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-300">
                    Deja inscrit ?{' '}
                    <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">
                        Se connecter
                    </Link>
                </p>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-gray-400 hover:text-white">
                        Retour a l accueil
                    </Link>
                </div>
            </div>
        </div>
    )
}
