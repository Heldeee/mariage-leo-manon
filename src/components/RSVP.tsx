import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type Guest from "../types/guest";
import { sendRSVP } from "../services/guest";

interface Props {
    guest: Guest;
}

function Stepper({
    label,
    value,
    max,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#433F39]/10">
            <span className="text-[#433F39]">{label}</span>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(0, value - 1))}
                    className="w-9 h-9 rounded-full bg-[#F8F5EF] text-[#433F39] text-lg leading-none hover:bg-[#A8B79D]/30 transition"
                >
                    −
                </button>
                <span className="w-6 text-center text-lg">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-9 h-9 rounded-full bg-[#F8F5EF] text-[#433F39] text-lg leading-none hover:bg-[#A8B79D]/30 transition"
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default function RSVPForm({ guest }: Props) {
    const [presence, setPresence] = useState<"oui" | "non" | null>(null);
    const [adultes, setAdultes] = useState(guest.adultes);
    const [enfants, setEnfants] = useState(guest.enfants);
    const [allergies, setAllergies] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function submit() {
        setSubmitting(true);
        try {
            await sendRSVP({
                code: guest.code,
                nom_affichage: guest.nom_affichage,
                presence,
                adultes: presence === "oui" ? adultes : 0,
                enfants: presence === "oui" ? enfants : 0,
                allergies,
                message,
            });
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto p-10 text-center"
            >
                <h2 className="text-4xl text-[#433F39]">
                    {presence === "oui" ? "Merci ❤️" : "Merci pour votre réponse"}
                </h2>
                <p className="mt-4 text-[#433F39]/70">
                    {presence === "oui"
                        ? "Votre présence a bien été enregistrée. Nous avons hâte de célébrer ce jour avec vous !"
                        : "Nous sommes tristes de ne pas vous compter parmi nous, mais nous comprenons. Vous serez dans nos pensées ce jour-là."}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl px-6 py-20 mx-auto"
        >
            <h2 className="text-5xl text-center text-[#433F39]">
                Confirmez votre présence
            </h2>
            <p className="mt-4 text-center text-[#433F39]/70">
                Bonjour {guest.nom_affichage}
            </p>

            <div className="flex justify-center gap-4 mt-10">
                <button
                    onClick={() => setPresence("oui")}
                    className={`rounded-full px-8 py-3 transition ${presence === "oui"
                            ? "bg-[#A8B79D] text-white"
                            : "bg-white text-[#433F39] border border-[#433F39]/15 hover:border-[#A8B79D]"
                        }`}
                >
                    Nous serons présents
                </button>
                <button
                    onClick={() => setPresence("non")}
                    className={`rounded-full px-8 py-3 transition ${presence === "non"
                            ? "bg-[#433F39] text-white"
                            : "bg-white text-[#433F39] border border-[#433F39]/15 hover:border-[#433F39]/40"
                        }`}
                >
                    Nous ne pourrons pas venir
                </button>
            </div>

            <AnimatePresence mode="wait">
                {presence === "oui" && (
                    <motion.div
                        key="oui"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-10 space-y-4 overflow-hidden"
                    >
                        <Stepper label="Adultes" value={adultes} max={guest.adultes} onChange={setAdultes} />
                        <Stepper label="Enfants" value={enfants} max={guest.enfants} onChange={setEnfants} />

                        <div>
                            <label className="text-sm text-[#433F39]/70">
                                Allergies ou restrictions alimentaires
                            </label>
                            <textarea
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                placeholder="Aucune, ou précisez ici..."
                                className="w-full p-3 mt-2 bg-white border border-[#433F39]/15 rounded-xl focus:outline-none focus:border-[#A8B79D]"
                                rows={3}
                            />
                        </div>

                        {guest.hebergement && (
                            <div className="p-5 bg-[#A8B79D]/10 rounded-xl text-[#433F39]">
                                Une chambre vous est réservée au domaine 🌿
                            </div>
                        )}
                    </motion.div>
                )}

                {presence === "non" && (
                    <motion.div
                        key="non"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-10 overflow-hidden"
                    >
                        <label className="text-sm text-[#433F39]/70">
                            Un petit mot pour Léo & Manon ? (optionnel)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="On pense fort à vous..."
                            className="w-full p-3 mt-2 bg-white border border-[#433F39]/15 rounded-xl focus:outline-none focus:border-[#433F39]/40"
                            rows={3}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {presence && (
                <button
                    onClick={submit}
                    disabled={submitting}
                    className="w-full p-4 mt-10 text-white bg-[#A8B79D] rounded-full transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                    {submitting ? "Envoi..." : "Envoyer ma réponse"}
                </button>
            )}
        </motion.section>
    );
}