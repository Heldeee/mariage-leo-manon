import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const WEDDING_DATE = new Date("2027-06-19T00:00:00");

function getTimeLeft() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return { days };
}

const dateParts = [
    { value: "19", label: "Jour" },
    { value: "Juin", label: "Mois" },
    { value: "2027", label: "Année" },
];

const heartPath =
    "M100 178 C40 130 10 90 10 55 C10 25 32 5 60 5 C78 5 92 15 100 32 C108 15 122 5 140 5 C168 5 190 25 190 55 C190 90 160 130 100 178 Z";

const SCRATCH_THRESHOLD = 0.85;

function ScratchCard({
    value,
    label,
    onRevealed,
}: {
    value: string;
    label: string;
    onRevealed: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = useState(false);
    const isScratching = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        // On capture les refs dans des consts locales : évite tout "canvas may be null"
        // dans les closures ci-dessous, et rend le cleanup plus fiable.
        const canvasElement = canvas;
        const wrapperElement = wrapper;
        const ctx = canvasElement.getContext("2d")!;
        const path = new Path2D(heartPath);

        const resize = () => {
            const { clientWidth, clientHeight } = wrapperElement;
            canvasElement.width = clientWidth;
            canvasElement.height = clientHeight;

            const scale = Math.min(clientWidth, clientHeight) / 200;
            const offsetX = (clientWidth - 200 * scale) / 2;
            const offsetY = (clientHeight - 200 * scale) / 2;

            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);
            ctx.clip(path);

            const gradient = ctx.createLinearGradient(0, 0, 200, 200);
            gradient.addColorStop(0, "#F5E5B8");
            gradient.addColorStop(0.25, "#D4AF37");
            gradient.addColorStop(0.45, "#FCEBAE");
            gradient.addColorStop(0.6, "#B8860B");
            gradient.addColorStop(0.8, "#F5E5B8");
            gradient.addColorStop(1, "#C9A227");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 200, 200);

            const shine = ctx.createLinearGradient(0, 0, 200, 200);
            shine.addColorStop(0, "rgba(255,255,255,0)");
            shine.addColorStop(0.45, "rgba(255,255,255,0)");
            shine.addColorStop(0.5, "rgba(255,255,255,0.55)");
            shine.addColorStop(0.55, "rgba(255,255,255,0)");
            shine.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = shine;
            ctx.fillRect(0, 0, 200, 200);

            ctx.restore();
        };
        resize();
        window.addEventListener("resize", resize);

        function scratch(x: number, y: number) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 13, 0, Math.PI * 2);
            ctx.fill();
        }

        function getPos(e: MouseEvent | TouchEvent) {
            const rect = canvasElement.getBoundingClientRect();
            const point = "touches" in e ? e.touches[0] : e;
            return { x: point.clientX - rect.left, y: point.clientY - rect.top };
        }

        function checkProgress() {
            const data = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
            let cleared = 0;
            let total = 0;
            for (let i = 3; i < data.length; i += 4 * 6) {
                total++;
                if (data[i] === 0) cleared++;
            }
            const ratio = cleared / total;
            if (ratio > SCRATCH_THRESHOLD) setRevealed(true);
        }

        function start(e: MouseEvent | TouchEvent) {
            e.preventDefault();
            isScratching.current = true;
            const { x, y } = getPos(e);
            scratch(x, y);
        }
        function move(e: MouseEvent | TouchEvent) {
            e.preventDefault();
            if (!isScratching.current) return;
            const { x, y } = getPos(e);
            scratch(x, y);
            checkProgress();
        }
        function end() {
            checkProgress();
            isScratching.current = false;
        }

        canvasElement.addEventListener("mousedown", start);
        canvasElement.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
        canvasElement.addEventListener("touchstart", start, { passive: false });
        canvasElement.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);

        return () => {
            window.removeEventListener("resize", resize);
            canvasElement.removeEventListener("mousedown", start);
            canvasElement.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);
            canvasElement.removeEventListener("touchstart", start);
            canvasElement.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);
        };
    }, [onRevealed]);

    useEffect(() => {
        if (revealed) onRevealed();
    }, [revealed, onRevealed]);

    return (
        <div ref={wrapperRef} className="relative w-28 h-28 md:w-32 md:h-32 select-none">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl md:text-3xl text-[#433F39]">{value}</p>
                <p className="text-xs uppercase tracking-widest text-[#433F39]/60">{label}</p>
            </div>
            <motion.canvas
                ref={canvasRef}
                animate={{ opacity: revealed ? 0 : 1 }}
                transition={{ duration: 0.8 }}
                style={{ pointerEvents: revealed ? "none" : "auto" }}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            />
        </div>
    );
}

export default function Countdown() {
    const [revealed, setRevealed] = useState([false, false, false]);
    const [time, setTime] = useState(getTimeLeft());

    const allRevealed = revealed.every(Boolean);

    useEffect(() => {
        const id = setInterval(() => setTime(getTimeLeft()), 3600000);
        return () => clearInterval(id);
    }, []);

    const handleReveal = (index: number) => {
        setRevealed((prev) => {
            if (prev[index]) return prev; // évite un re-render inutile si déjà révélé
            const next = [...prev];
            next[index] = true;
            return next;
        });
    };

    return (
        <section id="countdown" className="px-6 py-24 bg-white text-center">
            <h2 className="text-5xl text-[#433F39]">Le grand jour approche...</h2>
            <div className="flex justify-center items-center gap-4 md:gap-8 mt-10">
                {dateParts.map((part, i) => (
                    <ScratchCard
                        key={i}
                        value={part.value}
                        label={part.label}
                        onRevealed={() => handleReveal(i)}
                    />
                ))}
            </div>
            {allRevealed ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12"
                >
                    <h3 className="text-3xl text-[#433F39]">Plus que</h3>
                    <div className="inline-block bg-[#F8F5EF] rounded-xl px-8 py-4 mt-4">
                        <p className="text-6xl text-[#A8B79D]">{time.days}</p>
                        <p className="text-sm uppercase tracking-widest text-[#433F39]/60">jours</p>
                    </div>
                </motion.div>
            ) : (
                <p className="mt-8 text-sm text-[#433F39]/50">Grattez les cœurs pour découvrir la date !</p>
            )}
        </section>
    );
}