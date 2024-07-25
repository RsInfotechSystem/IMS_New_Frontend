export const monthConverter = (date) => {
    const monthArray = [{ "1": "Jan" }, { "2": "Feb" }, { "3": "Mar" }, { "4": "Apr" }, { "5": "May" }, { "6": "Jun" }, { "7": "Jul" }, { "8": "Aug" }, { "9": "Sep" }, { 10: "Oct" }, { 11: "Nov" }, { 12: "Dec" }, { "01": "Jan" }, { "02": "Feb" }, { "03": "Mar" }, { "04": "Apr" }, { "05": "May" }, { "06": "Jun" }, { "07": "Jul" }, { "08": "Aug" }, { "09": "Sep" }];
    try {
        let month = (new Date(date)?.getMonth() + 1)?.toString();

        if (date) {
            monthArray?.filter((ele, ind) => {
                if (Object.keys(ele)?.includes(month)) {
                    month = Object.values(ele);
                }
            })
        }
        return `${month}`
    } catch (error) {
        console.log(error?.message);
    }
}