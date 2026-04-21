export default function PageSection({ title, subtitle, children }) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-primary-500/30 bg-gradient-to-b from-primary-500/10 to-black p-8">
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                {subtitle ? <p className="mt-2 text-gray-300">{subtitle}</p> : null}
                <div className="mt-6 text-gray-200">{children}</div>
            </div>
        </section>
    )
}
