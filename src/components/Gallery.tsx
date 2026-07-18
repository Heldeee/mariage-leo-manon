import { motion } from "framer-motion";
import { useState } from "react";

const photos = Object.values(
    import.meta.glob("../assets/images/*.{png,jpg,jpeg,webp,avif,JPG}", {
        eager: true,
        import: "default",
    })
) as string[];


export default function Gallery() {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <section className="px-6 py-24 bg-[#F8F5EF]">
            <h2 className="text-5xl text-center text-[#433F39]">
                Nos moments
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-16 max-w-4xl mx-auto md:grid-cols-4">
                {photos.map((photo, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        onClick={() => setSelected(photo)}
                        className="overflow-hidden rounded-xl aspect-square"
                    >
                        <img
                            src={photo}
                            alt={`Photo ${i + 1}`}
                            className="object-cover w-full h-full transition hover:scale-110"
                            loading="lazy"
                        />
                    </motion.button>
                ))}
            </div>

            {selected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelected(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
                >
                    <img
                        src={selected}
                        alt="Photo agrandie"
                        className="max-h-[85vh] max-w-full rounded-lg"
                    />
                </motion.div>
            )}
        </section>
    );
}