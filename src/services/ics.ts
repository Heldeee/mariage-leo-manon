function foldLine(line: string) {
    const encoder = new TextEncoder();
    let result = "";
    let length = 0;
    for (const character of line) {
        const size = encoder.encode(character).length;
        if (length + size > 75) { result += "\r\n "; length = 1; }
        result += character;
        length += size;
    }
    return result;
}

export function createICS(now = new Date()) {
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    // France is UTC+2 in June. UTC timestamps preserve the event instant in every client.
    return [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Leo et Manon//Mariage//FR", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT", "UID:20270619-civil@leo-manon.example", `DTSTAMP:${stamp}`,
        "SUMMARY:Mariage de Léo & Manon - Célébration civile",
        "DTSTART:20270619T120000Z", "LOCATION:Mairie du Cazalet\\, Mairie de Quartiers du secteur 3\\, Pessac\\, Château de Cazalet\\, Av. de Beutre\\, 33600 Pessac",
        "DESCRIPTION:Célébration civile à 14h00 à la Mairie du Cazalet.", "END:VEVENT",
        "BEGIN:VEVENT", "UID:20270619-reception@leo-manon.example", `DTSTAMP:${stamp}`,
        "SUMMARY:Mariage de Léo & Manon - Cérémonie et réception",
        "DTSTART:20270619T140000Z", "DTEND:20270619T215900Z", "LOCATION:Domaine Grand Piquecaillou",
        "DESCRIPTION:Cérémonie laïque à 16h00 puis réception au domaine.", "END:VEVENT", "END:VCALENDAR", "",
    ].map(foldLine).join("\r\n");
}

export function downloadICS() {
    const url = URL.createObjectURL(new Blob([createICS()], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mariage-leo-manon.ics";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
