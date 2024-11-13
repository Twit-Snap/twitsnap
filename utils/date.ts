export const validatePreviousDate = (value: string) => {
  // Regular expression to check YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the date string matches the YYYY-MM-DD format
  if (!regex.test(value)) {
    return false;
  }

  // Parse the date parts
  const [year, month, day] = value.split('-').map(Number);

  // Check the month is between 1 and 12
  if (month < 1 || month > 12) {
    return false;
  }

  // Check the day is valid for the month
  const maxDaysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDaysInMonth) {
    return false;
  }

  // Convert dateString to a Date object
  const date = new Date(value);
  const earliestDate = new Date('1900-01-01');
  const now = new Date();

  // Check if the date is between 1900 and now
  if (date < earliestDate || date > now) {
    return false;
  }

  return true;
};
