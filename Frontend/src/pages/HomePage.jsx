import { Link } from 'react-router-dom'

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            La plateforme <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">scolaire</span> de demain
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Accédez à vos notes, vos cours et gérez votre vie scolaire en un seul endroit. Une plateforme moderne conçue pour les étudiants et les professeurs.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/signup" className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-colors font-semibold inline-block">
                                Commencer maintenant
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl blur-3xl opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-3xl p-8 border border-primary-500/30">
                            <div className="space-y-4">
                                <div className="h-4 bg-primary-500/20 rounded-full w-3/4"></div>
                                <div className="h-4 bg-primary-500/20 rounded-full w-full"></div>
                                <div className="h-4 bg-primary-500/20 rounded-full w-5/6"></div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="h-3 bg-primary-600/20 rounded-full"></div>
                                <div className="h-3 bg-primary-600/20 rounded-full w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
