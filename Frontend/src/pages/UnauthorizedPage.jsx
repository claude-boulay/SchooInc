import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-primary-300 text-black flex items-center justify-center px-4">
            <div className="w-full max-w-xl rounded-2xl border border-ink-500/30 p-8 text-center bg-gradient-to-b from-accent-500/10 to-white">
                <h1 className="text-3xl font-bold">Acces refuse</h1>
                <p className="mt-3 text-ink-700">Tu n as pas les droits pour acceder a cette page.</p>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-lg bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-3 font-semibold"
                >
                    Retour a l accueil
                </Link>
            </div>
        </div>
    )
}
