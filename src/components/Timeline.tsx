import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { downloadICS } from "../services/ics";

interface Event {
    time: string;
    title: string;
    description?: string;
}

const events: Event[] = [
    { time: "14h00", title: "Célébration civile", description: "Mairie du Cazalet" },
    { time: "16h00", title: "Cérémonie laïque", description: "Domaine Grand Piquecaillou" },
    { time: "18h00", title: "Vin d'honneur", description: "Terrasse & jardins" },
    { time: "20h00", title: "Dîner extérieur" },
    { time: "23h00", title: "Soirée dansante" },
];

export default function Timeline() {
    const reducedMotion = useReducedMotion();
    return (
        <section id="programme" className="px-6 py-24 bg-[#F8F5EF]">
            <h2 className="text-3xl sm:text-5xl text-center text-[#433F39]">
                Le programme
            </h2>
            <div className="relative max-w-2xl mx-auto mt-16">
                <div className="absolute left-2 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 bg-[#A8B79D]/50" />
                <div className="space-y-16">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.title}
                            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={`relative flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"
                                }`}
                        >
                            <div
                                className={`w-full pl-10 md:w-[calc(50%_-_2rem)] ${i % 2 === 0 ? "text-left md:text-right md:pr-8 md:pl-0" : "text-left md:pl-8"
                                    }`}
                            >
                                <p className="text-sm font-semibold tracking-widest text-[#433F39] uppercase">
                                    {event.time}
                                </p>
                                <h3 className="mt-1 text-2xl text-[#433F39]">
                                    {event.title}
                                </h3>
                                {event.description && (
                                    <p className="mt-1 text-sm text-[#433F39]/80">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                            <div className="absolute left-2 md:left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#A8B79D]" />
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="text-center mt-12">
                <button
                    onClick={downloadICS}
                    className="px-6 py-3 rounded-full bg-[#433F39] text-white transition hover:scale-105"
                >
                    Ajouter à mon calendrier
                </button>
            </div>
        </section>

    );
}