export function formatDate(date) {
    const fetchDate = new Date(date)
    const day = fetchDate.getDate().toString().padStart(2, '0');
    const month = (fetchDate.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
    const year = fetchDate.getFullYear();

    return `${day}/${month}/${year}`;
}