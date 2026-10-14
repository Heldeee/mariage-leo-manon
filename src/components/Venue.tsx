const venues = [
    { name: "Mairie du Cazalet", time: "14h00 — Célébration civile", query: "Mairie de Quartiers du secteur 3, Pessac, Château de Cazalet, Av. de Beutre, 33600 Pessac" },
    { name: "Domaine Grand Piquecaillou", time: "16h00 — Cérémonie laïque, puis réception", query: "Domaine Grand Piquecaillou" },
];

export default function Venue() {
    return <section id="lieu" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-5xl">Les lieux</h2>
            <p className="mt-4">Nous nous retrouvons à la mairie, puis au domaine pour la suite des festivités.</p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
                {venues.map(venue => <article key={venue.name} className="rounded-2xl bg-[#F8F5EF] p-4">
                    <h3 className="text-2xl">{venue.name}</h3>
                    <p className="mt-2">{venue.time}</p>
                    <iframe title={`Carte : ${venue.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(venue.query)}&output=embed`} width="100%" height="280" className="mt-6 rounded-xl border-0" loading="lazy" />
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.query)}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-full bg-[#433F39] px-6 py-3 text-white">Itinéraire vers {venue.name}<span className="sr-only"> (nouvel onglet)</span></a>
                </article>)}
            </div>
            <p className="mt-8">Une question sur le trajet, le stationnement ou l’accessibilité ? <a className="underline" href="mailto:leodevin24@gmail.com">Écrivez-nous</a>.</p>
        </div>
    </section>;
}
