import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { resetPassword } from '../lib/authApi'

export default function ResetPasswordPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const tokenFromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search)
        return params.get('token') || ''
    }, [location.search])

    const [token, setToken] = useState(tokenFromQuery)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!token.trim()) {
            setError('Le token de reinitialisation est obligatoire.')
            return
        }

        if (newPassword.length < 6) {
            setError('Le nouveau mot de passe doit contenir au moins 6 caracteres.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }

        setIsSubmitting(true)
        try {
            await resetPassword({ token: token.trim(), newPassword })
            setSuccess('Mot de passe reinitialise avec succes. Redirection vers la connexion...')
            setTimeout(() => {
                navigate('/login')
            }, 1200)
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
                    <h1 className="text-3xl font-bold">Reinitialiser le mot de passe</h1>
                    <p className="mt-2 text-gray-300">Colle ton token puis choisis un nouveau mot de passe.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="reset-token" className="mb-2 block text-sm text-gray-200">
                            Token de reinitialisation
                        </label>
                        <textarea
                            id="reset-token"
                            required
                            rows={4}
                            value={token}
                            onChange={(event) => setToken(event.target.value)}
                            placeholder="Colle ici le token affiche dans les logs Service_User"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="new-password" className="mb-2 block text-sm text-gray-200">
                            Nouveau mot de passe
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-new-password" className="mb-2 block text-sm text-gray-200">
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            id="confirm-new-password"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors focus:border-primary-400"
                        />
                    </div>

                    {error ? (
                        <p className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                        </p>
                    ) : null}

                    {success ? (
                        <p className="rounded-lg border border-green-400/50 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                            {success}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        {isSubmitting ? 'Validation...' : 'Mettre a jour le mot de passe'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-white">
                        Retour a la connexion
                    </Link>
                </div>
            </div>
        </div>
    )
}
