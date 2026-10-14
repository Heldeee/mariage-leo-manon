import { useEffect, useRef, useState } from "react";

const originals = import.meta.glob("../assets/images/*.{png,jpg,jpeg,JPG}", { eager: true, import: "default" }) as Record<string, string>;
const thumbnails = import.meta.glob("../assets/images/thumbnails/*.webp", { eager: true, import: "default" }) as Record<string, string>;
const photos = Object.entries(originals).map(([path, src]) => ({ src, thumbnail: thumbnails[`../assets/images/thumbnails/${path.split("/").pop()!.replace(/\.[^.]+$/, ".webp")}`] || src }));

export default function Gallery() {
    const [selected, setSelected] = useState<number | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const close = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (selected === null) return;
        const trigger = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        dialog.current?.showModal();
        close.current?.focus();
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; trigger?.focus(); };
    }, [selected]);
    return <section className="bg-[#F8F5EF] px-6 py-24">
        <h2 className="text-center text-3xl sm:text-5xl">Les mariés…</h2>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {photos.map((photo, index) => <button key={photo.src} type="button" onClick={() => setSelected(index)} className="aspect-square overflow-hidden rounded-xl" aria-label={`Agrandir la photo ${index + 1} de Léo et Manon`}>
                <img src={photo.thumbnail} alt="" loading="lazy" width={480} height={480} className="h-full w-full object-cover" />
            </button>)}
        </div>
        <dialog ref={dialog} aria-label="Photo des mariés agrandie" className="fixed inset-0 m-auto max-h-[95svh] max-w-[95vw] rounded-xl bg-[#433F39] p-4 text-white backdrop:bg-black/80"
            onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); close.current?.focus(); } }}
            onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => {
                if (event.target !== event.currentTarget) return;
                const rect = event.currentTarget.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
            }}>
            <button ref={close} type="button" onClick={() => dialog.current?.close()} className="mb-3 min-h-11 rounded-full bg-white px-5 py-2 text-[#433F39]">Fermer la photo</button>
            {selected !== null && <img src={photos[selected].src} alt={`Photo ${selected + 1} de Léo et Manon agrandie`} className="max-h-[75svh] max-w-full rounded-lg object-contain" />}
        </dialog>
    </section>;
}
