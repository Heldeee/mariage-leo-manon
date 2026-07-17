import { motion } from "framer-motion";

export default function Venue() {
    return (
        <section id="lieu" className="px-6 py-24 bg-white">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center"
            >
                <h2 className="text-5xl text-[#433F39]">Le lieu</h2>
                <p className="mt-4 text-xl text-[#433F39]/80">
                    Domaine Grand Piquecaillou
                </p>

                <div className="mt-10 overflow-hidden rounded-2xl shadow-md">
                    <iframe
                        title="Carte du lieu"
                        src="https://www.google.com/maps?q=Domaine+Grand+Piquecaillou&output=embed"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        loading="lazy"
                    />
                </div>


                <a href="https://www.google.com/maps/dir/?api=1&destination=Domaine+Grand+Piquecaillou"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 mt-8 text-white transition rounded-full bg-[#A8B79D] hover:scale-105"
                >
                    Itinéraire
                </a>
            </motion.div>
        </section >
    );
}