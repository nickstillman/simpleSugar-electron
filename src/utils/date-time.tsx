
// date/time functions


export const getDisplayDateData = (date: string) => {
  const logPath = 'log' + date;
  let data;
  try {
    data = JSON.parse(fs.readFileSync(`${__dirname}/../data/${logPath}.json`).toString());
    return data;
  } catch (err) {
    return false;
  }
}

export const createDateTime = (dateTime: any) => {
  return <span className="dateTime" style={ {color: dateTime.onToday ? "red" : "black"} }>{ dateTime.date }{ dateTime.onToday ? `, ${dateTime.time}` : '' }</span>
}

export const getCurrentDateTime = () => {
  const d = new Date()
  const date = d.toLocaleDateString().replace(/\//g, '-');
  const time = d.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
  // also return time in minutes since 6am?
  return {date, time};
}

export const isTargetToday = (target: string, today: string) => {
  const toCompare = target.slice(0,3) === 'log' ? target.slice(3) : target;
  return toCompare === today;
}

export const formatMinutesPastZero = (minutes: number, zeroHour: number = 0, zeroMinute: number = 0) => {
  const dateObj = new Date(0, 0, 0, zeroHour, zeroMinute + minutes);
  const timeString = dateObj.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});

  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  const am = timeString.slice(-2);

  return {hour, minute, am, timeString};
}


export const timeFormatted = (timeInMinutes: any, timeZero: any) => {
  return formatMinutesPastZero(timeInMinutes, timeZero.hour, timeZero.minute).timeString;
}

export const getMinutesElapsed = (timeString: string, timeZero: any) => {
console.log('timeString:', timeString);

  const timeSplit = timeString.split(':');

  const pm = timeSplit[1].slice(-2) === 'PM';

  const hour = (parseInt(timeSplit[0]) % 12) + (pm ? 12 : 0);
  const minute = parseInt(timeSplit[1].slice(0,2));

  const totalMinutes = (hour * 60) + minute;

  const timeZeroMinutes = ((timeZero.hour + (timeZero.am ? 0 : 12)) * 60) + timeZero.minute;

  const elapsed = totalMinutes - timeZeroMinutes;

  const elapsedWraparound = elapsed < 0 ? (1440 + elapsed) : elapsed;

  return elapsedWraparound;
}
