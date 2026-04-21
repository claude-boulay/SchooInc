import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-xl rounded-2xl border border-primary-500/30 p-8 text-center bg-gradient-to-b from-primary-500/10 to-black">
                <h1 className="text-3xl font-bold">Page introuvable</h1>
                <p className="mt-3 text-gray-300">Cette route n existe pas ou a ete deplacee.</p>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-3 font-semibold"
                >
                    Retour a l accueil
                </Link>
            </div>
        </div>
    )
}
