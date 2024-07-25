import { formatDate } from "./formatDate";

function getDateDescription(dateString) {
  // Parse the date string into a Date object
  const date = new Date(dateString);

  // Get today's date
  const today = new Date();
  // Set the time of today's date to midnight
  today.setHours(0, 0, 0, 0);

  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Set the time of yesterday's date to midnight
  yesterday.setHours(0, 0, 0, 0);

  // Set the time of the input date to midnight
  date.setHours(0, 0, 0, 0);

  // Check if the date is today
  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  // Check if the date is yesterday
  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // If not today or yesterday, return the simple date
  return formatDate(date)

}

export default getDateDescription