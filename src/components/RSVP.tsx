import { useState } from "react";
import { motion } from "framer-motion";
import type Guest from "../types/guest";
import { sendRSVP } from "../services/guest";

interface Props {
    guest: Guest;
}

export default function RSVPForm({
    guest
}: Props) {
    const [presence, setPresence] = useState<"oui" | "non" | null>(null);
    const [allergies, setAllergies] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function submit() {
        await sendRSVP({
            code: guest.code,
            nom_affichage: guest.nom_affichage,
            presence,
            adultes: guest.adultes,
            enfants: guest.enfants,
            allergies
        });

        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-4xl">
                    Merci ❤️
                </h2>
                <p className="mt-4">
                    Votre réponse a bien été enregistrée.
                </p>
            </div>
        )
    }

    return (
        <motion.section
            initial={{
                opacity: 0,
                y: 40
            }}
            whileInView={{
                opacity: 1,
                y: 0
            }}
            viewport={{
                once: true
            }}
            className="max-w-xl px-6 py-20 mx-auto"
        >
            <h2 className="text-5xl text-center">
                Confirmez votre présence
            </h2>

            <p className="mt-4 text-center">
                Bonjour {guest.nom_affichage}
            </p>
            <div className="flex justify-center gap-4 mt-10">
                <button
                    onClick={() => setPresence("oui")}
                    className={`
                        rounded-full
                        px-8
                        py-3
                        ${presence === "oui" ? "bg-green-200" : "bg-gray-100"}
                    `}
                >
                    Nous serons présents
                </button>
                <button
                    onClick={() => setPresence("non")}
                    className={`
                        rounded-full
                        px-8
                        py-3
                        ${presence === "non" ? "bg-green-200" : "bg-gray-100"}
                    `}
                >
                    Désolé
                </button>
            </div>
            {presence === "oui" && (
                <div className="mt-10 space-y-6">
                    <div>
                        <label>Adultes</label>
                        <input
                            disabled
                            value={guest.adultes}
                            className="block w-full p-3 bg-gray-100 rounded"
                        />
                    </div>
                    <div>
                        <label>Enfants</label>
                        <input
                            disabled
                            value={guest.enfants}
                            className="block w-full p-3 bg-gray-100 rounded"
                        />
                    </div>
                    <div>
                        <label>Allergies ou restrictions alimentaires</label>
                        <textarea
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            className="w-full p-3 mt-2 border rounded"
                            rows={4}
                        />
                    </div>
                </div>
            )}
            {guest.hebergement && (
                <div className="p-5 mt-8 bg-green-50 rounded-xl">
                    Une chambre vous est réservée au domaine 🌿
                </div>
            )}

            {presence && (
                <button
                    onClick={submit}
                    className="w-full p-4 mt-10 text-white bg-[#A8B79D] rounded-full"
                >
                    Envoyer ma réponse
                </button>
            )}
        </motion.section>
    );
}