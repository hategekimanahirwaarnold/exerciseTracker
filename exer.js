const convertDate = (day) => {
    const newDate = new Date(day); // Replace this with your date object or date string
    
    // Define options for formatting the date
    const options = {
      weekday: 'short', // Short weekday name (e.g., "Sat")
      month: 'short',   // Short month name (e.g., "Jul")
      day: 'numeric',   // Numeric day (e.g., "22")
      year: 'numeric'   // Numeric year (e.g., "2023")
    };
    
    // Convert the date to the desired format
    let result = newDate.toDateString()
    // let formattedDate = newDate.toLocaleString('en-US', options);
    // let  amelioration = formattedDate.split(",");
    // formattedDate = amelioration.join(" ");
    console.log( "today we are on", result); // Output: "Sat Jul 22 2023"
    return result
  };
  today = Date.now();
  console.log("converted date: ",convertDate(today));