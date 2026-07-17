const API_URL = import.meta.env.VITE_API_URL;

export async function getGuest(code:string){
    const url =
    `${API_URL}?code=${code}`;
    console.log(url);
    const response = await fetch(url, {
      // Ajout pour forcer le suivi de la redirection, ce qui est crucial pour les requêtes GET avec CORS vers Google Apps Script.
      redirect: 'follow'
    });
    const data =
        await response.json();
    console.log(data);
    return data;

}

export async function sendRSVP(data: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8", // évite le preflight CORS
    },
    body: JSON.stringify(data),
    redirect: "follow",
  });
  return response.json();
}