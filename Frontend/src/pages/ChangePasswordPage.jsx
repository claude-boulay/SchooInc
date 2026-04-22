import { useState } from 'react'
import PageSection from '../components/PageSection'

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    return (
        <PageSection title="Changement de mot de passe" subtitle="Modification securisee du mot de passe.">
            <form className="grid gap-4 md:max-w-xl" onSubmit={(event) => event.preventDefault()}>
                <label className="text-sm text-ink-700" htmlFor="current-password">Mot de passe actuel</label>
                <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3 outline-none focus:border-accent-500"
                />

                <label className="text-sm text-ink-700" htmlFor="new-password">Nouveau mot de passe</label>
                <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="rounded-lg border border-ink-500/50 bg-white/80 px-4 py-3 outline-none focus:border-accent-500"
                />

                <button
                    type="submit"
                    className="mt-2 w-fit rounded-lg bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-3 font-semibold"
                >
                    Mettre a jour
                </button>
            </form>
        </PageSection>
    )
}
