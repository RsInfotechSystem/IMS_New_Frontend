import { getCookie, hasCookie } from "cookies-next";
import { toast } from "react-toastify"

export const getCookiesData = (router = []) => {
    try {
        if (hasCookie("userDetails")) {
            const data = getCookie("userDetails");
            return JSON.parse(data);
        } else {
            router.push("/")
            return {}
        }
    } catch (error) {
        toast(error?.message);
    }
}