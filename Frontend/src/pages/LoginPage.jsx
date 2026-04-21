import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, requestPasswordReset, saveAuthSession } from '../lib/authApi'

function getDashboardPathByRole(role) {
    if (role === 'PROFESSOR') {
        return '/professor/dashboard'
    }

    return '/student/dashboard'
}

export default function LoginPage() {
    const isDevMode = import.meta.env.DEV
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setInfo('')
        setIsSubmitting(true)

        try {
            const authPayload = await loginUser({ email, password })
            saveAuthSession(authPayload)
            navigate(getDashboardPathByRole(authPayload.user.role))
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDevForgotPassword = async () => {
        setError('')
        setInfo('')

        if (!email.trim()) {
            setError('Renseigne ton email pour generer un jeton de reinitialisation dev.')
            return
        }

        try {
            await requestPasswordReset({ email: email.trim() })
            setInfo('Demande envoyee. En mode dev, le token est logge dans la console du serveur Service_User.')
        } catch (requestError) {
            setError(requestError.message)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-primary-500/40 bg-gradient-to-b from-primary-500/15 to-black p-8 shadow-2xl shadow-primary-500/10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Se connecter</h1>
                    <p className="mt-2 text-gray-300">Accede a ton espace SchooInc.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
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
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    {error ? (
                        <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                        </p>
                    ) : null}

                    {info ? (
                        <p className="rounded-lg border border-primary-400/50 bg-primary-500/10 px-3 py-2 text-sm text-primary-200">
                            {info}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        {isSubmitting ? 'Connexion...' : 'Connexion'}
                    </button>

                    {isDevMode ? (
                        <button
                            type="button"
                            onClick={handleDevForgotPassword}
                            className="w-full rounded-lg border border-primary-500/60 bg-black/40 px-4 py-3 text-sm font-semibold text-primary-300 transition-colors hover:border-primary-400 hover:text-primary-200"
                        >
                            Mot de passe oublie (dev)
                        </button>
                    ) : null}
                </form>

                <p className="mt-6 text-center text-sm text-gray-300">
                    Pas encore de compte ?{' '}
                    <Link to="/signup" className="font-semibold text-primary-400 hover:text-primary-300">
                        Inscription
                    </Link>
                </p>

                <p className="mt-3 text-center text-sm text-gray-300">
                    Tu as un token de reinitialisation ?{' '}
                    <Link to="/reset-password" className="font-semibold text-primary-400 hover:text-primary-300">
                        Reinitialiser le mot de passe
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
