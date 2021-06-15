import fs from 'fs';

export const parseDate = (date: string) => {
  let toSplit = date;
  if (toSplit.slice(0,3) === 'log') toSplit = toSplit.slice(3)
  const split = toSplit.split('-');
  return split.map(el => parseInt(el));
}

// find target for date navigation

export const getTargetDateFromLogIndex = (current: string, offset: number) => {
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
  console.log('currentLogIndex:', currentLogIndex, index);

  if (currentLogIndex === -1) {
    if (offset > -1) return current;
    currentLogIndex = index.length;
  }

  let targetIndex = currentLogIndex + offset;
  if (targetIndex < 0) targetIndex = 0;
  if (targetIndex >= index.length) targetIndex = index.length - 1;

  return index[targetIndex].slice(3);
}

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
}

// update logIndex if current day doesn't exist
export const updateLogIndex = (currentLogDate: string, keyToUpdate: string) => {

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
}
