import { useState } from 'react'
import PageSection from '../components/PageSection'

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    return (
        <PageSection title="Changement de mot de passe" subtitle="Modification securisee du mot de passe.">
            <form className="grid gap-4 md:max-w-xl" onSubmit={(event) => event.preventDefault()}>
                <label className="text-sm text-gray-300" htmlFor="current-password">Mot de passe actuel</label>
                <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <label className="text-sm text-gray-300" htmlFor="new-password">Nouveau mot de passe</label>
                <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="rounded-lg border border-primary-500/50 bg-black/70 px-4 py-3 outline-none focus:border-primary-400"
                />

                <button
                    type="submit"
                    className="mt-2 w-fit rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-3 font-semibold"
                >
                    Mettre a jour
                </button>
            </form>
        </PageSection>
    )
}
