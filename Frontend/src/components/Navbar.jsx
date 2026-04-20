import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="border-b border-primary-500/30 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-lg">S</span>
                    </div>
                    <h1 className="text-2xl font-bold">SchooInc</h1>
                </Link>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2 text-primary-400 hover:text-primary-300 transition-colors">
                        Se connecter
                    </Link>
                    <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-colors font-medium">
                        S'inscrire
                    </Link>
                </div>
            </div>
        </nav>
    )
}
