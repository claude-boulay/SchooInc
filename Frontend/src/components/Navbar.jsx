import { Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { clearAuthSession, getAuthUser } from '../lib/authSession'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = getAuthUser()
    const [showProfMenu, setShowProfMenu] = useState(false)

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
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => setShowProfMenu(!showProfMenu)}
                                        className="px-3 py-2 text-primary-300 hover:text-primary-200 transition-colors flex items-center gap-1"
                                    >
                                        Professeur
                                        <span className={`transition-transform ${showProfMenu ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    {showProfMenu && (
                                        <div className="absolute top-full mt-1 right-0 bg-black/95 border border-primary-500/30 rounded-lg shadow-lg z-50 min-w-[200px]">
                                            <Link
                                                to="/professor/dashboard"
                                                onClick={() => setShowProfMenu(false)}
                                                className={`block px-4 py-3 text-sm hover:bg-primary-500/20 transition-colors ${location.pathname === '/professor/dashboard' ? 'bg-primary-500/10 text-primary-200' : 'text-gray-200'
                                                    }`}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/professor/classes"
                                                onClick={() => setShowProfMenu(false)}
                                                className={`block px-4 py-3 text-sm hover:bg-primary-500/20 transition-colors ${location.pathname === '/professor/classes' ? 'bg-primary-500/10 text-primary-200' : 'text-gray-200'
                                                    }`}
                                            >
                                                Mes Classes
                                            </Link>
                                            <Link
                                                to="/professor/courses"
                                                onClick={() => setShowProfMenu(false)}
                                                className={`block px-4 py-3 text-sm hover:bg-primary-500/20 transition-colors ${location.pathname === '/professor/courses' ? 'bg-primary-500/10 text-primary-200' : 'text-gray-200'
                                                    }`}
                                            >
                                                Mes Cours
                                            </Link>
                                            <Link
                                                to="/professor/grades"
                                                onClick={() => setShowProfMenu(false)}
                                                className={`block px-4 py-3 text-sm hover:bg-primary-500/20 transition-colors border-t border-primary-500/20 ${location.pathname === '/professor/grades' ? 'bg-primary-500/10 text-primary-200' : 'text-gray-200'
                                                    }`}
                                            >
                                                Gestion des Notes
                                            </Link>
                                        </div>
                                    )}
                                </div>
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
