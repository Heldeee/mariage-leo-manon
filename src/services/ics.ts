export function downloadICS() {
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "SUMMARY:Mariage de Léo & Manon",
        "DTSTART:20270619T140000",
        "DTEND:20270619T235900",
        "LOCATION:Domaine Grand Piquecaillou",
        "DESCRIPTION:Cérémonie et célébration du mariage de Léo et Manon",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mariage-leo-manon.ics";
    a.click();
    URL.revokeObjectURL(url);
}