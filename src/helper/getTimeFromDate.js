function getTimeFromDate(dateString) {
  // Parse the date string into a Date object
  const parsedDate = new Date(dateString);

  // Get the time components
  let hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();

  // Determine if it's AM or PM
  const period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = (hours % 12 || 12).toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  // Construct the formatted time string
  const formattedTime = `${hours}:${formattedMinutes} ${period}`;

  return formattedTime;
}

export default getTimeFromDate
