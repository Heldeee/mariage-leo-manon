import { motion } from "framer-motion";
import domaineVideo from "../assets/videos/domaine.webm";
import type Guest from "../types/guest";

interface Props {
    guest: Guest | null;
}

export default function Hero({ guest }: Props) {
    return (
        <section
            className="
        relative
        h-screen
        w-full
        overflow-hidden
      "
        >
            {/* Video background */}
            <video
                className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
                src={domaineVideo}
                autoPlay
                muted
                loop
                playsInline
            />
            {/* Overlay */}
            <div
                className="
          absolute
          inset-0
          bg-[#433F39]/40
        "
            />
            {/* Content */}

            <div
                className="
          relative
          z-10
          flex
          h-full
          flex-col
          items-center
          justify-center
          px-6
          text-center
          text-white
        "
            >
                <motion.h1

                    initial={{
                        opacity: 0,
                        y: 30
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 1.2
                    }}
                    className="
            text-6xl
            md:text-8xl
            font-semibold
          "
                >
                    Léo & Manon
                </motion.h1>
                <motion.p
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        delay: 0.8,
                        duration: 1
                    }}
                    className="
            mt-6
            text-xl
            md:text-3xl
            tracking-wide
          "
                >
                    Domaine Grand Piquecaillou

                </motion.p>
                {
                    guest && (
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: 1.5
                            }}
                            className="
              mt-10
              text-lg
            "
                        >
                            Bienvenue {guest.nom_affichage} !
                        </motion.p>
                    )
                }
                <motion.button
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        delay: 2
                    }}
                    onClick={() => {
                        document.getElementById("countdown")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="
            mt-12
            rounded-full
            bg-[#EFE8DC]
            px-8
            py-4
            text-[#433F39]
            transition
            hover:scale-105
          "
                >
                    Découvrir
                </motion.button>
            </div>
        </section>
    )
}