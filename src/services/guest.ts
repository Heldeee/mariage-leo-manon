const API_URL = import.meta.env.VITE_API_URL;

export interface RSVPPerson {
  nom: string;
  prenom: string;
  presence: "oui" | "non";
  allergenes: string;
}

export interface RSVPData {
  personnes: RSVPPerson[];
}

export async function sendRSVP(data: RSVPData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8", // évite le preflight CORS
    },
    body: JSON.stringify(data),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`RSVP request failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.status !== "success") {
    throw new Error(result.message || "RSVP request failed");
  }

  return result;
}