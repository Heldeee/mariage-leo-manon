import { motion } from "framer-motion";
import { downloadICS } from "../services/ics";

interface Event {
    time: string;
    title: string;
    description?: string;
}

const events: Event[] = [
    { time: "14h00", title: "Célébration civile", description: "Mairie de Pessac" },
    { time: "16h30", title: "Cérémonie laïque", description: "Domaine Grand Piquecaillou" },
    { time: "18h00", title: "Vin d'honneur", description: "Terrasse & jardins" },
    { time: "20h00", title: "Dîner extérieur" },
    { time: "23h00", title: "Soirée dansante" },
];

export default function Timeline() {
    return (
        <section id="programme" className="px-6 py-24 bg-[#F8F5EF]">
            <h2 className="text-5xl text-center text-[#433F39]">
                Le programme
            </h2>
            <div className="relative max-w-2xl mx-auto mt-16">
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#A8B79D]/50" />
                <div className="space-y-16">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={`relative flex ${i % 2 === 0 ? "justify-start" : "justify-end"
                                }`}
                        >
                            <div
                                className={`w-[calc(50%-2rem)] ${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                                    }`}
                            >
                                <p className="text-sm tracking-widest text-[#A8B79D] uppercase">
                                    {event.time}
                                </p>
                                <h3 className="mt-1 text-2xl text-[#433F39]">
                                    {event.title}
                                </h3>
                                {event.description && (
                                    <p className="mt-1 text-sm text-[#433F39]/70">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                            <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#A8B79D]" />
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="text-center mt-12">
                <button
                    onClick={downloadICS}
                    className="px-6 py-3 rounded-full bg-[#A8B79D] text-white transition hover:scale-105"
                >
                    Ajouter à mon calendrier
                </button>
            </div>
        </section>

    );
}