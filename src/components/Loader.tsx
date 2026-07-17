import { motion } from "framer-motion";

export default function Loader() {
    const petals = [0, 60, 120, 180, 240, 300];

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8F5EF] gap-6">
            <div className="relative w-24 h-24">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                >
                    {petals.map((deg, i) => (
                        <motion.div
                            key={deg}
                            initial={{ scale: 0.3, opacity: 0.4 }}
                            animate={{ scale: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
                            transition={{
                                duration: 2,
                                delay: i * 0.15,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "24px",
                                height: "36px",
                                borderRadius: "60% 60% 60% 60% / 80% 80% 20% 20%",
                                background: "#A8B79D",
                                transformOrigin: "50% 100%",
                                transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                            }}
                        />
                    ))}
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#433F39]" />
                </div>
            </div>
            <p className="text-[#433F39]/70">Chargement...</p>
        </div>
    );
}