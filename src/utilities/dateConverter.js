import { toast } from "react-toastify";

export const dateConverter = (date) => {
    const monthArray = [{ "1": "January" }, { "2": "February" }, { "3": "March" }, { "4": "April" }, { "5": "May" }, { "6": "June" }, { "7": "July" }, { "8": "August" }, { "9": "September" }, { "10": "October" }, { "11": "November" }, { "12": "December" }, { "01": "January" }, { "02": "February" }, { "03": "March" }, { "04": "April" }, { "05": "May" }, { "06": "June" }, { "07": "July" }, { "08": "August" }, { "09": "September" }];
    try {
        const splitDate = date?.split("T")?.[0]?.split("-");
        const year = splitDate[0];
        const day = splitDate[2]
        let month = splitDate[1]
        monthArray?.filter((ele) => {
            if (Object.keys(ele)?.includes(month)) {
                month = Object.values(ele);
            }
        });
        return `${day} ${month[0]} ${year}`
    } catch (error) {
        toast.error(error?.message);
    }
}