import { Link } from 'react-router-dom'

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            La plateforme <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">scolaire</span> de demain
                        </h2>
                        <p className="text-ink-600 text-lg mb-8">
                            Accédez à vos notes, vos cours et gérez votre vie scolaire en un seul endroit. Une plateforme moderne conçue pour les étudiants et les professeurs.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/signup" className="px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg hover:from-accent-600 hover:to-accent-700 transition-colors font-semibold inline-block">
                                Commencer maintenant
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl blur-3xl opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-accent-500/10 to-accent-600/10 rounded-3xl p-8 border border-ink-500/30">
                            <div className="space-y-4">
                                <div className="h-4 bg-accent-500/25 rounded-full w-3/4"></div>
                                <div className="h-4 bg-accent-500/25 rounded-full w-full"></div>
                                <div className="h-4 bg-accent-500/25 rounded-full w-5/6"></div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="h-3 bg-accent-600/25 rounded-full"></div>
                                <div className="h-3 bg-accent-600/25 rounded-full w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
