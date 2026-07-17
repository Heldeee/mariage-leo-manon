import {
    useEffect,
    useState
} from "react";

import {
    getGuest
} from "../services/guest";

import type Guest from "../types/guest";


export function useGuest(){

    const [guest,setGuest] =
        useState<Guest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(()=>{
        const params =
            new URLSearchParams(
                window.location.search
            );
        const code =
            params.get("code");
        if(!code) {
            setLoading(false);
            return;
        }

        getGuest(code)
            .then(setGuest)
            .catch(err => {
                console.error(err);
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    },[]);
    return { guest, loading, error };
}