import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const WEDDING_DATE = new Date("2027-06-19T14:00:00");

function getTimeLeft() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return { days, hours };
}

export default function Countdown() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = useState(false);
    const [time, setTime] = useState(getTimeLeft());
    const isScratching = useRef(false);

    useEffect(() => {
        const id = setInterval(() => setTime(getTimeLeft()), 3600000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const canvasElement = canvas;
        const ctx = canvasElement.getContext("2d")!;
        const resize = () => {
            canvasElement.width = wrapper.clientWidth;
            canvasElement.height = wrapper.clientHeight;
            ctx.fillStyle = "#A8B79D";
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.fillStyle = "#433F39";
            ctx.font = "500 20px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("✨", canvasElement.width / 2, canvasElement.height / 2);
        };
        resize();
        window.addEventListener("resize", resize);

        function scratch(x: number, y: number) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
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
            for (let i = 3; i < data.length; i += 4 * 20) {
                if (data[i] === 0) cleared++;
            }
            const ratio = cleared / (data.length / (4 * 20));
            if (ratio > 0.45) setRevealed(true);
        }

        function start(e: MouseEvent | TouchEvent) {
            isScratching.current = true;
            const { x, y } = getPos(e);
            scratch(x, y);
        }
        function move(e: MouseEvent | TouchEvent) {
            if (!isScratching.current) return;
            const { x, y } = getPos(e);
            scratch(x, y);
            checkProgress();
        }
        function end() {
            isScratching.current = false;
        }

        canvasElement.addEventListener("mousedown", start);
        canvasElement.addEventListener("mousemove", move);
        canvasElement.addEventListener("mouseup", end);
        canvasElement.addEventListener("touchstart", start);
        canvasElement.addEventListener("touchmove", move);
        canvasElement.addEventListener("touchend", end);

        return () => {
            window.removeEventListener("resize", resize);
            canvasElement.removeEventListener("mousedown", start);
            canvasElement.removeEventListener("mousemove", move);
            canvasElement.removeEventListener("mouseup", end);
            canvasElement.removeEventListener("touchstart", start);
            canvasElement.removeEventListener("touchmove", move);
            canvasElement.removeEventListener("touchend", end);
        };
    }, []);

    return (
        <section className="px-6 py-24 bg-white text-center">
            <h2 className="text-5xl text-[#433F39]">Compte à rebours...</h2>
            <div
                ref={wrapperRef}
                className="relative max-w-md mx-auto mt-10 h-40 overflow-hidden rounded-2xl shadow-md select-none"
            >
                <div className="absolute inset-0 flex items-center justify-center gap-8 bg-[#F8F5EF]">
                    {[
                        { value: time.days, label: "jours" },
                        { value: time.hours, label: "heures" },
                    ].map((t) => (
                        <div key={t.label}>
                            <p className="text-4xl text-[#433F39]">{t.value}</p>
                            <p className="text-xs uppercase tracking-widest text-[#433F39]/60">{t.label}</p>
                        </div>
                    ))}
                </div>
                <motion.canvas
                    ref={canvasRef}
                    animate={{ opacity: revealed ? 0 : 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ pointerEvents: revealed ? "none" : "auto" }}
                    className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                />
            </div>
            {!revealed && (
                <p className="mt-4 text-sm text-[#433F39]/50">Grattez pour découvrir le temps restant</p>
            )}
        </section>
    );
}