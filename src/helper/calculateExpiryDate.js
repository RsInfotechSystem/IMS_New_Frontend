
function calculateExpiryDate(shelfLife) {
    const { validityNumber, validityType } = shelfLife;
    // Get today's date
    var today = new Date();

    // Calculate the date based on the parameters
    var calculatedDate;
    if (validityType === 'day') {
        calculatedDate = new Date(today.getTime() + validityNumber * 24 * 60 * 60 * 1000);
    } else if (validityType === 'month') {
        calculatedDate = new Date(today.getTime() + validityNumber * 30 * 24 * 60 * 60 * 1000); // Assuming 30 days in a month for simplicity
    } else if (validityType === 'year') {
        calculatedDate = new Date(today.getTime() + validityNumber * 365 * 24 * 60 * 60 * 1000); // Assuming 365 days in a year for simplicity
    } else {
        return "--";
    }

    // Format the date
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return calculatedDate.toLocaleDateString('en-IN', options);
}


export default calculateExpiryDate