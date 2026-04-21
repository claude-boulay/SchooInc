import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthUser } from '../lib/authSession'

export default function Navbar() {
    const navigate = useNavigate()
    const user = getAuthUser()

    const handleLogout = () => {
        clearAuthSession()
        navigate('/login')
    }

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
                    <Link to="/classes" className="px-3 py-2 text-gray-200 hover:text-white transition-colors">
                        Classes
                    </Link>
                    <Link to="/courses" className="px-3 py-2 text-gray-200 hover:text-white transition-colors">
                        Cours
                    </Link>

                    {user ? (
                        <>
                            <Link to="/profile" className="px-3 py-2 text-primary-300 hover:text-primary-200 transition-colors">
                                Profil
                            </Link>

                            {user.role === 'STUDENT' ? (
                                <Link to="/student/calendar" className="px-3 py-2 text-primary-300 hover:text-primary-200 transition-colors">
                                    Calendrier etudiant
                                </Link>
                            ) : null}

                            {user.role === 'PROFESSOR' ? (
                                <Link to="/professor/dashboard" className="px-3 py-2 text-primary-300 hover:text-primary-200 transition-colors">
                                    Dashboard professeur
                                </Link>
                            ) : null}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-colors font-medium"
                            >
                                Se deconnecter
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="px-6 py-2 text-primary-400 hover:text-primary-300 transition-colors">
                                Se connecter
                            </Link>
                            <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-colors font-medium">
                                S inscrire
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
