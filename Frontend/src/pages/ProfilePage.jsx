import { useState } from 'react'
import PageSection from '../components/PageSection'

export default function ProfilePage() {
    const [email, setEmail] = useState('')
    const [pseudo, setPseudo] = useState('')

    return (
        <PageSection title="Profil utilisateur" subtitle="Afficher et modifier ses informations personnelles.">
            <form className="grid gap-4 md:max-w-xl" onSubmit={(event) => event.preventDefault()}>
                <label className="text-sm text-gray-300" htmlFor="profile-email">Email</label>
                <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <label className="text-sm text-gray-300" htmlFor="profile-pseudo">Pseudo</label>
                <input
                    id="profile-pseudo"
                    type="text"
                    value={pseudo}
                    onChange={(event) => setPseudo(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <button
                    type="submit"
                    className="mt-2 w-fit rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-3 font-semibold"
                >
                    Enregistrer
                </button>
            </form>
        </PageSection>
    )
}
