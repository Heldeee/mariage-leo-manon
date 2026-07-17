export default function Footer() {
    return (
        <footer className="px-6 py-10 text-center text-sm text-[#433F39]/60 bg-[#F8F5EF]">
            <p>Léo & Manon · {new Date().getFullYear()}</p>
            <p className="mt-1">Une question ? Écrivez-nous à leodevin24@gmail.com ou au 07.82.48.78.66</p>
        </footer>
    );
}