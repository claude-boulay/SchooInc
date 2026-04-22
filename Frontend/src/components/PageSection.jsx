export default function PageSection({ title, subtitle, children }) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-ink-500/30 bg-gradient-to-b from-accent-500/10 to-white p-8">
                <h1 className="text-3xl font-bold text-black">{title}</h1>
                {subtitle ? <p className="mt-2 text-ink-700">{subtitle}</p> : null}
                <div className="mt-6 text-ink-800">{children}</div>
            </div>
        </section>
    )
}
