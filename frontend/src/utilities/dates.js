/**
 * 
 * @param {*} timestamp 
 * @param {*} today 
 * @returns 
 */
export function timestampToDate(timestamp,today=true){
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  
  //If it is today and the flag to check it is true, I return 
  if (today) {
    const currentDate = new Date();
    const isToday = date.toDateString() === currentDate.toDateString();
    if(isToday){
      return "Today";
    }
  }

  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
}

/**
 * 
 * @param {*} timestamp 
 * @param {*} today 
 * @returns 
 */
export function timestampToMilitaryDateTime(timestamp){
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  
  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
  });
}


/**
 * 
 * @returns 
 */
export function timestampNow(){
  return Math.floor(Date.now() / 1000);
}



