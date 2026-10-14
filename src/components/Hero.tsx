import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import domaineVideo from "../assets/videos/domaine-optimized.webm";
import poster from "../assets/images/domaine-poster.webp";

export default function Hero() {
    const reducedMotion = useReducedMotion();
    const video = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    useEffect(() => { if (reducedMotion) video.current?.pause(); }, [reducedMotion]);
    return <header className="relative min-h-[100svh] w-full overflow-hidden bg-[#433F39] text-white">
        <img src={poster} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        {!reducedMotion && <video ref={video} className="absolute inset-0 h-full w-full object-cover" src={domaineVideo}
            poster={poster} autoPlay muted loop playsInline preload="none" aria-hidden="true"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center">
            <nav aria-label="Navigation principale" className="mb-12 flex flex-wrap justify-center gap-4">
                <a className="p-2 underline underline-offset-4" href="#programme">Programme</a>
                <a className="p-2 underline underline-offset-4" href="#lieu">Lieux</a>
                <a className="p-2 underline underline-offset-4" href="#rsvp">RSVP</a>
            </nav>
            <h1 className="text-5xl font-semibold sm:text-6xl md:text-8xl">Léo &amp; Manon</h1>
            <p className="mt-6 text-2xl md:text-3xl"><time dateTime="2027-06-19">19 juin 2027</time></p>
            <p className="mt-4 text-xl md:text-2xl">Domaine Grand Piquecaillou</p>
            <a href="#rsvp" className="mt-10 rounded-full bg-[#EFE8DC] px-8 py-4 text-[#433F39]">Confirmer ma présence</a>
            <a href="#countdown" className="mt-5 p-2 underline underline-offset-4">Découvrir le faire-part</a>
        </div>
        {!reducedMotion && <button type="button" className="absolute bottom-4 right-4 z-10 min-h-11 rounded-full bg-[#433F39] px-5 py-2"
            onClick={() => { if (playing) video.current?.pause(); else void video.current?.play().catch(() => setPlaying(false)); }}>
            {playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
        </button>}
    </header>;
}
