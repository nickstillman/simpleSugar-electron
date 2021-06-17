import fs from 'fs';

// update any type for parseDate return
// will be type dateObject?
export const parseDate = (date: string, toObject: boolean = false): number[] | any => {
  let toSplit = date;
  if (toSplit.slice(0,3) === 'log') {
    toSplit = toSplit.slice(3);
  }
  const split = toSplit.split('-').map(el => parseInt(el));

  return toObject ? {month: split[0], day: split[1], year: split[2]} : split;
};

export const dateObjtoString = (date: any) => {
  return `${date.month}-${date.day}-${date.year}`;
}

// find target for date navigation
export const getTargetDateFromLogIndex = (current: string, offset: number): string | boolean => {
  const logIndexPath = 'logIndex';
  let logIndex: any;

  if (!fs.existsSync(`${__dirname}/../data/${logIndexPath}.json`)) {
    return false;
  } else {
    try {
      logIndex = JSON.parse(fs.readFileSync(`${__dirname}/../data/${logIndexPath}.json`).toString())
    } catch (err) {
      return false; // error reading/writing to logIndex file
    }
  }
  // also contains key lastOpened for last viewed day?
  const {index} = logIndex;

  let currentLogIndex = index.indexOf('log' + current);

  if (currentLogIndex === -1) {
    if (offset > -1) return current;
    currentLogIndex = index.length;
  }

  let targetIndex = currentLogIndex + offset;
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex >= index.length) targetIndex = index.length - 1;

  return index[targetIndex].slice(3);
};

// sort log index

export const sortLogIndex = (logIndexArray: string[]) => {

  const compareDates = (a: string, b: string) => {
    const [monthA, dayA, yearA] = parseDate(a);
    const [monthB, dayB, yearB] = parseDate(b);

    const yearDiff = yearA - yearB;
    const monthDiff = monthA - monthB;
    const dayDiff = dayA - dayB;
    return yearDiff || monthDiff || dayDiff;
  }
  logIndexArray.sort(compareDates);
};

// update logIndex if current day (passed-in date, maybe not today) doesn't exist
export const updateLogIndex = (currentLogDateRaw: string, keyToUpdate: string) => {
  let currentLogDate = currentLogDateRaw;
  if (currentLogDate.slice(0,3) !== 'log') {
    currentLogDate = 'log' + currentLogDate;
  }

  const logIndexPath = 'logIndex';
  let logIndex: any;

  if (!fs.existsSync(`${__dirname}/../data/${logIndexPath}.json`)) {
    logIndex = {index: [], lastOpened: currentLogDate}
  } else {
    try {
      logIndex = JSON.parse(fs.readFileSync(`${__dirname}/../data/${logIndexPath}.json`).toString())
    } catch (err) {
      return false; // error reading/writing to logIndex file
    }
  }
  // also contains key lastOpened for last viewed day
  if (keyToUpdate === 'lastOpened') {
    const objToWrite = JSON.stringify({...logIndex, lastOpened: currentLogDate});
    try {
      fs.writeFileSync(`${__dirname}/../data/${logIndexPath}.json`, objToWrite, {flag: 'w'});
    } catch (err) {
      return false;
    }
    return true;
  }

  const {index} = logIndex;

  if (index.indexOf(currentLogDate) === -1) {
    index.push(currentLogDate);
    sortLogIndex(index);
    const objToWrite = JSON.stringify({index, lastOpened: logIndex.lastOpened});
    try {
      fs.writeFileSync(`${__dirname}/../data/${logIndexPath}.json`, objToWrite, {flag: 'w'});
    } catch (err) {
      return false;
    }
  }
  return true;
};


// get data for specified date
export const getDataForDate = (date: string) => {
  let logPath = date;
  if (logPath.slice(0,3) !== 'log') {
    logPath = 'log' + date;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(`${__dirname}/../data/${logPath}.json`).toString());
    return data;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// create entry object
export const createEntryObj = (time: number, shot: number, bg: number, bgLabel: string, notes: string, date: string, setBasalTime: Boolean = false) => {

  return {
    time,
    date,
    shot,
    bg,
    bgLabel,
    notes,
    setBasalTime
  }
};



// insert entry object in specified date
// options specify how to resolve issues
// -date doesn't exist
// -duplicate entry
// etc...
export const insertEntryObj = (entryObj: any, options: any) => {
  const logPath = 'log' + entryObj.date;
  let objToWrite;

  if (!fs.existsSync(`${__dirname}/../data/${logPath}.json`)) {
    console.log(`Log file for ${entryObj.date} does not exist`);
    // check options here

    objToWrite = {...entryObj, date: parseDate(entryObj.date, true)}
  } else {
    objToWrite = getDataForDate(entryObj.date);
    if (!objToWrite) return false;
  }

  if (entryObj.setBasalTime) {
    objToWrite.basalTime = entryObj.time;
  } else {
    if (objToWrite[entryObj.time]) {
      console.log(`Entry for ${entryObj.time} already exists`);
      // if entry for time aleady exists, follow options for duplicate entry
    }
    objToWrite[entryObj.time] = entryObj;
  }

  try {
    fs.writeFileSync(`${__dirname}/../data/${logPath}.json`, objToWrite, {flag: 'w'});
  } catch (err) {
    return false;
  }
  return objToWrite;
}

