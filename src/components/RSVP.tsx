import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendRSVP, type RSVPPerson } from "../services/guest";

const emptyPerson = (): RSVPPerson => ({
    nom: "",
    prenom: "",
    presence: "oui",
    allergenes: "",
});

export default function RSVPForm() {
    const [personnes, setPersonnes] = useState<RSVPPerson[]>([emptyPerson()]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function updatePerson(index: number, changes: Partial<RSVPPerson>) {
        setPersonnes((current) => current.map((person, personIndex) =>
            personIndex === index ? { ...person, ...changes } : person,
        ));
    }

    function addPerson() {
        setPersonnes((current) => [...current, emptyPerson()]);
    }

    function removePerson(index: number) {
        setPersonnes((current) => current.filter((_, personIndex) => personIndex !== index));
    }

    async function submit() {
        const cleanedPeople = personnes.map((person) => ({
            ...person,
            nom: person.nom.trim(),
            prenom: person.prenom.trim(),
            allergenes: person.allergenes.trim(),
        }));

        if (cleanedPeople.some((person) => !person.nom || !person.prenom)) {
            setError("Veuillez renseigner le nom et le prénom de chaque personne.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await sendRSVP({ personnes: cleanedPeople });
            setSubmitted(true);
        } catch {
            setError("Votre réponse n'a pas pu être envoyée. Veuillez réessayer.");
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
                    Merci pour vos réponses ❤️
                </h2>
                <p className="mt-4 text-[#433F39]/70">
                    Vos informations ont bien été enregistrées. Nous avons hâte de célébrer ce jour avec vous !
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
                Renseignez les informations de chaque personne concernée par ce faire-part.
            </p>

            <div className="mt-10 space-y-6">
                <AnimatePresence initial={false}>
                    {personnes.map((person, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                            className="p-5 space-y-5 bg-white border border-[#433F39]/10 rounded-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl text-[#433F39]">Personne {index + 1}</h3>
                                {personnes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePerson(index)}
                                        className="text-sm text-[#433F39]/60 hover:text-[#433F39]"
                                    >
                                        Retirer
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="text-sm text-[#433F39]/70">
                                    Prénom
                                    <input
                                        value={person.prenom}
                                        onChange={(event) => updatePerson(index, { prenom: event.target.value })}
                                        className="w-full p-3 mt-2 bg-[#F8F5EF] border border-[#433F39]/15 rounded-xl focus:outline-none focus:border-[#A8B79D]"
                                        autoComplete="given-name"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-[#433F39]/70">
                                    Nom
                                    <input
                                        value={person.nom}
                                        onChange={(event) => updatePerson(index, { nom: event.target.value })}
                                        className="w-full p-3 mt-2 bg-[#F8F5EF] border border-[#433F39]/15 rounded-xl focus:outline-none focus:border-[#A8B79D]"
                                        autoComplete="family-name"
                                        required
                                    />
                                </label>
                            </div>

                            <div>
                                <p className="text-sm text-[#433F39]/70">Présence</p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {(["oui", "non"] as const).map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            onClick={() => updatePerson(index, { presence: value })}
                                            className={`rounded-full px-5 py-2 transition ${person.presence === value
                                                ? value === "oui" ? "bg-[#A8B79D] text-white" : "bg-[#433F39] text-white"
                                                : "bg-[#F8F5EF] text-[#433F39] border border-[#433F39]/15 hover:border-[#A8B79D]"
                                                }`}
                                        >
                                            {value === "oui" ? "Présent(e)" : "Absent(e)"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-[#433F39]/70">
                                    Allergènes ou restrictions alimentaires
                                </label>
                                <textarea
                                    value={person.allergenes}
                                    onChange={(event) => updatePerson(index, { allergenes: event.target.value })}
                                    placeholder="Aucun, ou précisez ici..."
                                    className="w-full p-3 mt-2 bg-[#F8F5EF] border border-[#433F39]/15 rounded-xl focus:outline-none focus:border-[#A8B79D]"
                                    rows={2}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button
                    type="button"
                    onClick={addPerson}
                    className="w-full p-3 text-[#433F39] bg-white border border-dashed border-[#433F39]/25 rounded-xl transition hover:border-[#A8B79D]"
                >
                    + Ajouter une personne
                </button>
            </div>

            <button
                    onClick={submit}
                    disabled={submitting}
                    className="w-full p-4 mt-10 text-white bg-[#A8B79D] rounded-full transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                    {submitting ? "Envoi..." : "Envoyer ma réponse"}
            </button>
            {error && <p className="mt-4 text-center text-red-700">{error}</p>}
        </motion.section>
    );
}