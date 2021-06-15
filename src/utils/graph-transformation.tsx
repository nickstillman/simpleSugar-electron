import {timeFormatted} from '../utils/date-time';

export const calcIobAndBgVals = (data: any) => {

  let currentBg = 100; // change? unicorn for now
  let currentBgSlope = 0;
  let noMoreBg = false;

  let currentIob = 0;

  const iobVals: any = {};
  const bgVals: any = {};

  const nextBgVals: any = {};

  // initialize starting pre-0-time bg to currentBg value set above
  bgVals[-5] = currentBg;
  let prevBgIndex = -5;

  for (let i = 0; i <= 1440; i +=5) {
    if (data[i]?.bg) {
      // check for valid blood sugar values? ie. bg > 20 and bg < 600
      nextBgVals[prevBgIndex] = data[i];
      bgVals[i] = data[i].bg;
      prevBgIndex = i;
    }
  }
  currentBgSlope = (nextBgVals[-5].bg - bgVals[-5]) / ((nextBgVals[-5].time + 5) / 5);

  const slopeFunctionList = [];

  const shotFunctionCreator = (shot: number, time: number) => (iobNow: number, timeNow: number) => {
    const elapsed = timeNow - time;
    let slope;
    let onsetLagComputed = false;
    let middlePeakComputed = false;
    if (elapsed < 40 ) {
      slope = 0;
      onsetLagComputed = true;
    } else if (elapsed < 90) {
      slope = shot / 10;
    } else if (elapsed < 110) {
      if (elapsed === 100) {
        middlePeakComputed = true;
      }
      slope = 0;
    } else if (elapsed < 240) {
      slope = -(shot / 26);
    } else {
      return {newIob: null};
    }
    return {newIob: (iobNow + slope), onsetLagComputed, middlePeakComputed};
  };

  // don't display middlePeak if iob hasn't changed
  let throttleMiddlePeakDisplay = false;
  let oldIob = currentIob;

  for (let i = 0; i <= 1440; i +=5) {

    // calc BGs
    if (bgVals[i]) {
      currentBg = bgVals[i];
      if (!nextBgVals[i]) {
        noMoreBg = true;
      } else {
        currentBgSlope = (nextBgVals[i].bg - bgVals[i]) / ((nextBgVals[i].time - i) / 5);
      }
    } else if (!noMoreBg) {
      bgVals[i] = bgVals[i - 5] + currentBgSlope;
    }


    // add current shot waveform function
    if (data[i]?.shot > 0) {
      slopeFunctionList.push(shotFunctionCreator(data[i].shot, i));
    }

    // calc IOB
    let onsetLag = false;
    let middlePeak = false;
    slopeFunctionList.forEach((el: any, idx: number) => {
      if (el) {
        const {newIob, onsetLagComputed, middlePeakComputed} = el(currentIob, i);
        if (newIob === null) {
          slopeFunctionList[idx] = null;
        } else {
          currentIob = newIob;
        }
        if (onsetLagComputed) {
          onsetLag = true;
        }
        if (middlePeakComputed && !throttleMiddlePeakDisplay) {
          middlePeak = true;
          throttleMiddlePeakDisplay = true;
        }
      }
    });
    if (currentIob < .1) {
      currentIob = 0;
    }
    iobVals[i] = {iob: currentIob, onsetLag, middlePeak};
    // instead of middlePeak, show IOB peak whenever iob begins to drop
    // after previously rising
    // or simply don't reshow middlePeak if iob hasn't risen again?
    if (throttleMiddlePeakDisplay && (currentIob !== oldIob)) {
      throttleMiddlePeakDisplay = false;
    };
    oldIob = currentIob;
  }

  return [iobVals, bgVals];
}

export const makeDataMaps = (data: any) => {
  const output: any = [];

  const [iobVals, bgVals] = calcIobAndBgVals(data);

  for (let i = 0; i <= 1440; i += 5) {
    const {iob, onsetLag, middlePeak} = iobVals[i];

    if (data[i]) {
      const {bg, bgLabel, shot, time, notes} = data[i];
      output[i] = {
        ...data[i],
        iob,
        onsetLag,
        middlePeak,
        bgDisplay: (bg >= 20),
        bgLogged: bg
      }
    } else {
      output[i] = {
        bg: bgVals[i],
        bgLogged: null,
        bgLabel: null,
        shot: null,
        time: i,
        notes: null,
        iob,
        onsetLag,
        middlePeak,
        bgDisplay: false
      }
    }
  }

  return output;
}

export const transformLogDataToMinutesData = (data: any) => {

  // console.log('log data to transform:', data);
  const timeZero = data.timeZero || {hour: 6, minute: 0, am: true};


  const entryData: any = makeDataMaps(data); // build bgMap and iobMap, combine to entryData
  let gaveBasal: number = 0;// | null = null;

  return [entryData.map((entry: any) => {
    const {bg, bgLogged, bgLabel, bgDisplay, iob, onsetLag, middlePeak, shot, time, notes} = entry;
    const leftText = bgDisplay ? (bg + ' ' + ((bgLabel && (bg > 50)) ? (bgLabel + ' ') : '')) : null;
    let rightText = '';
    let rightTextColor = 'black';

    let iobToDisplay = iob >= .1 ? iob : 0;
    if (onsetLag && (!iob || iob < .2)) {
      iobToDisplay = .1
    }

    if (shot < 0) {
      rightText += `(${shot * -1} units basal at ${time}) `;
      rightTextColor = 'red';
      rightText += notes ? notes : '';
      // gaveBasal = (gaveBasal || 0) + (shot * -1);
      gaveBasal += (shot * -1);
      console.log('gaveBasal just added:', gaveBasal)
    } else {
      rightText += shot ? shot + ' ' : '';
      rightText += bgLogged ? bgLogged + ' ' + (bgLabel ? (bgLabel + ' ') : '') : '';
      rightText += (bgLogged || shot || notes || (!(time % 60) && ((iobToDisplay > 0) || (bg >= 20)))) ? (timeFormatted(time, timeZero)) + ' ' : '';
      rightText += notes ? notes : '';
    }
    if (!rightText.length && middlePeak) {
      rightText = Math.round(iob) + ' I.O.B ';
    }

    // if (time > data.basalTime) gaveBasal = false;
    const centerBarColor = !gaveBasal && (time > data.basalTime) ? "yellow" : "black";

    return {
      bg,
      iobToDisplay,
      leftText,
      rightText,
      rightTextColor,
      centerBarColor,
      time
    }
  }), gaveBasal];


}

export const transformMinutesDataToGraph = (dataAllMinutes: any) => {
  // console.log('minutes data to transform:', dataAllMinutes);
  // console.log('transforming');
  return dataAllMinutes.reduce((acc: any, minuteData: any) => {
    const {bg, iobToDisplay, leftText, rightText, rightTextColor, centerBarColor, time} = minuteData;

    if (bg || iobToDisplay || leftText?.length || rightText?.length) {
      // if (bg || iobToDisplay || leftText?.length || rightText?.length || centerBarColor === 'yellow') {
      // compression if no text:
      if (!leftText?.length && !rightText?.length && (time % 10)) return acc;

      acc.push({
        maxLeft: 400,
        maxRight: 800,
        leftValue: bg,
        leftColorMain: "darkcyan",
        leftColorExtra: "brown",
        leftColorExtraThreshold: 180,
        leftText,
        leftTextColor: "white",
        rightValue: (iobToDisplay * 50),
        rightColorMain: "lightskyblue",
        rightColorExtra: "pink",
        rightColorExtraThreshold: 300,
        rightText,
        rightTextColor,
        centerBarValue: 10,
        centerBarColor,
        backGroundColor: "lightgrey",
        time,
        timeBar: false,
        timeBarText: ''
      });
    }
    return acc;
  }, []);
}
