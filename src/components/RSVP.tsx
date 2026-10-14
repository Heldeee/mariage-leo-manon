import { useRef, useState, type FormEvent } from "react";
import { RSVPConfigurationError, sendRSVP, type RSVPPerson, type RSVPData } from "../services/guest";

type Person = Omit<RSVPPerson, "presence"> & { id: string; presence: "oui" | "non" | "" };
const emptyPerson = (): Person => ({ id: crypto.randomUUID(), nom: "", prenom: "", presence: "", allergenes: "" });
const inputClass = "mt-2 w-full rounded-xl border border-[#433F39]/40 bg-[#F8F5EF] p-3";

export default function RSVPForm() {
    const [personnes, setPersonnes] = useState<Person[]>([emptyPerson()]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<RSVPPerson[] | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState("");
    const request = useRef<{ signature: string; data: RSVPData } | null>(null);
    function updatePerson(id: string, changes: Partial<Person>) {
        setPersonnes(current => current.map(person => person.id === id ? { ...person, ...changes } : person));
    }
    function addPerson() {
        const person = emptyPerson();
        setPersonnes(current => [...current, person]);
        setAnnouncement("Une personne a été ajoutée.");
        requestAnimationFrame(() => document.getElementById(`${person.id}-prenom`)?.focus());
    }
    function removePerson(id: string, index: number) {
        const remaining = personnes.filter(person => person.id !== id);
        setPersonnes(remaining);
        setAnnouncement("La personne a été retirée.");
        requestAnimationFrame(() => document.getElementById(`${remaining[Math.min(index, remaining.length - 1)].id}-prenom`)?.focus());
    }
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        const nextErrors: Record<string, string> = {};
        for (const person of personnes) {
            if (!person.prenom.trim()) nextErrors[`${person.id}-prenom`] = "Renseignez le prénom.";
            if (!person.nom.trim()) nextErrors[`${person.id}-nom`] = "Renseignez le nom.";
            if (!person.presence) nextErrors[`${person.id}-presence`] = "Choisissez une réponse.";
        }
        setErrors(nextErrors);
        setError(null);
        if (Object.keys(nextErrors).length) {
            setAnnouncement("Veuillez corriger les champs indiqués.");
            requestAnimationFrame(() => document.getElementById(Object.keys(nextErrors)[0])?.focus());
            return;
        }
        const cleanedPeople: RSVPPerson[] = personnes.map(person => ({
            nom: person.nom.trim(), prenom: person.prenom.trim(), presence: person.presence as "oui" | "non",
            allergenes: person.presence === "oui" ? person.allergenes.trim() : "",
        }));
        const signature = JSON.stringify(cleanedPeople);
        if (request.current?.signature !== signature) request.current = { signature, data: { personnes: cleanedPeople, requestId: crypto.randomUUID() } };
        setSubmitting(true);
        setAnnouncement("Envoi de votre réponse en cours.");
        try {
            await sendRSVP(request.current.data);
            setSubmitted(cleanedPeople);
            setAnnouncement("Votre réponse a bien été enregistrée.");
            requestAnimationFrame(() => document.getElementById("rsvp-confirmation")?.focus());
        } catch (cause) {
            if (import.meta.env.DEV && cause instanceof RSVPConfigurationError) {
                setError("Configuration locale manquante : renseignez VITE_API_URL dans .env.local avec l’URL /exec de Google Apps Script, puis redémarrez le serveur.");
            } else setError("L’envoi n’a pas pu être confirmé. Réessayez avec les mêmes informations, ou contactez-nous ci-dessous.");
        } finally { setSubmitting(false); }
    }
    return <div className="mx-auto max-w-xl px-6 py-20">
        <p role="status" className="sr-only">{announcement}</p>
        {submitted ? <div>
            <h2 id="rsvp-confirmation" tabIndex={-1} className="text-center text-3xl sm:text-4xl">Merci pour vos réponses ❤️</h2>
            <p className="mt-4">Vos informations ont bien été enregistrées.{submitted.some(person => person.presence === "oui") && " Nous avons hâte de célébrer ce jour avec vous !"}</p>
            <ul className="mt-6 space-y-4" aria-label="Résumé de votre réponse">
                {submitted.map((person, index) => <li key={index} className="rounded-xl bg-white p-4">
                    <p className="font-semibold">{person.prenom} {person.nom} — {person.presence === "oui" ? "Présent(e)" : "Absent(e)"}</p>
                    {person.presence === "oui" && <p className="mt-2">Restrictions alimentaires : {person.allergenes || "Aucune indiquée"}</p>}
                </li>)}
            </ul>
            <p className="mt-6">Pour corriger votre réponse, <a className="underline" href="mailto:leodevin24@gmail.com">écrivez-nous</a> ou <a className="underline" href="tel:+33782487866">appelez-nous</a>.</p>
        </div> : <>
            <h2 className="text-center text-3xl sm:text-5xl">Confirmez votre présence</h2>
            <p className="mt-4 text-center">Renseignez les personnes concernées par ce faire-part. Prénom, nom et présence sont obligatoires.</p>
            <p className="mt-3 text-center text-sm">Vos réponses et restrictions alimentaires sont transmises à Léo et Manon pour organiser le mariage. Pour toute correction, <a className="underline" href="mailto:leodevin24@gmail.com">contactez-nous</a>.</p>
            <form className="mt-10" onSubmit={submit} noValidate aria-busy={submitting}>
                <fieldset disabled={submitting} className="min-w-0 space-y-6 disabled:opacity-70">
                    <legend className="sr-only">Réponses des invités</legend>
                    {personnes.map((person, index) => <section key={person.id} aria-labelledby={`${person.id}-title`} className="space-y-5 rounded-2xl border border-[#433F39]/20 bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 id={`${person.id}-title`} className="text-xl">Personne {index + 1}</h3>
                            {personnes.length > 1 && <button type="button" onClick={() => removePerson(person.id, index)} className="min-h-11 px-3 text-sm underline" aria-label={`Retirer ${person.prenom || `la personne ${index + 1}`}`}>Retirer</button>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(["prenom", "nom"] as const).map(field => {
                                const id = `${person.id}-${field}`;
                                return <div key={field}>
                                    <label htmlFor={id}>{field === "prenom" ? "Prénom" : "Nom"} <span aria-hidden="true">*</span></label>
                                    <input id={id} name={id} value={person[field]} onChange={event => updatePerson(person.id, { [field]: event.target.value })}
                                        className={inputClass} autoComplete={`section-${person.id} ${field === "prenom" ? "given-name" : "family-name"}`} required
                                        aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-error` : undefined} />
                                    {errors[id] && <p id={`${id}-error`} className="mt-2 text-sm text-red-800">{errors[id]}</p>}
                                </div>;
                            })}
                        </div>
                        <fieldset className="min-w-0" aria-describedby={errors[`${person.id}-presence`] ? `${person.id}-presence-error` : undefined}>
                            <legend>Présence <span aria-hidden="true">*</span></legend>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {(["oui", "non"] as const).map((value, option) => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#433F39]/40 px-4 py-2 has-checked:bg-[#A8B79D]">
                                    <input type="radio" id={option === 0 ? `${person.id}-presence` : `${person.id}-absence`} name={`${person.id}-presence`} value={value} checked={person.presence === value} required
                                        aria-invalid={!!errors[`${person.id}-presence`]} onChange={() => updatePerson(person.id, { presence: value })} />
                                    {value === "oui" ? "Présent(e)" : "Absent(e)"}
                                </label>)}
                            </div>
                            {errors[`${person.id}-presence`] && <p id={`${person.id}-presence-error`} className="mt-2 text-sm text-red-800">{errors[`${person.id}-presence`]}</p>}
                        </fieldset>
                        {person.presence === "oui" && <div>
                            <label htmlFor={`${person.id}-allergenes`}>Allergènes ou restrictions alimentaires (facultatif)</label>
                            <textarea id={`${person.id}-allergenes`} name={`${person.id}-allergenes`} value={person.allergenes} onChange={event => updatePerson(person.id, { allergenes: event.target.value })}
                                placeholder="Précisez ici si nécessaire…" className={inputClass} rows={2} />
                        </div>}
                    </section>)}
                    <button type="button" id="add-person" onClick={addPerson} className="w-full rounded-xl border border-dashed border-[#433F39]/50 bg-white p-3">+ Ajouter une personne</button>
                    <button type="submit" className="w-full rounded-full bg-[#433F39] p-4 text-white">{submitting ? "Envoi…" : "Envoyer ma réponse"}</button>
                </fieldset>
                {error && <p role="alert" className="mt-4 text-center text-red-800">{error}</p>}
            </form>
        </>}
    </div>;
}
