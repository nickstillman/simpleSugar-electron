import React from 'react';
import { Link, HashRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import './App.global.css';
import fs from 'fs';

const { useState, useEffect, useRef } = React;

// const Hello = () => {
//   return (
//     <div>
//     <div className="Hello">
//     <img width="200px" alt="icon" src={icon} />
//     </div>
//     <h1>hiya from simpleSugar</h1>
//     <div className="Hello">
//     <Link to="/home">
//     <button type="button">
//     <span role="img" aria-label="books">
//     📚
//     </span>
//     HOME
//     </button>
//     </Link>
//     <a
//     href="https://electron-react-boilerplate.js.org/"
//     target="_blank"
//     rel="noreferrer"
//     >
//     <button type="button">
//     <span role="img" aria-label="books">
//     📚
//     </span>
//     Read our docs
//     </button>
//     </a>
//     <a
//     href="https://github.com/sponsors/electron-react-boilerplate"
//     target="_blank"
//     rel="noreferrer"
//     >
//     <button type="button">
//     <span role="img" aria-label="books">
//     🙏
//     </span>
//     Donate
//     </button>
//     </a>
//     </div>
//     </div>
//     );
//   };

const About = () => {
  return (
    <div>
    <div className="basic-centered">
    <img width="200px" alt="icon" src={icon} />
    </div>
    <h1 className="basic-centered">simpleSugar</h1>
    <h2 className="basic-centered">Diabetes Tech for Diabetics Who Don't Use Tech</h2>
    <div className="basic-centered">
    <Link to="/">
    <button type="button">
    <span role="img" aria-label="books">
    📚
    </span>
    HOME
    </button>
    </Link>
    </div>
    </div>
    );
  };

  const Graph = (props: any) => {
    // console.log('graph data: ', props.data);
    const graphBars = props.data.map((entry: any, i: number) => {

      const leftBarTotal = entry.leftValue ? entry.leftValue <= entry.maxLeft ? entry.leftValue : entry.maxLeft : 0;
      const leftSpace = leftBarTotal <= entry.maxLeft ? entry.maxLeft - leftBarTotal : 0;

      const rightBarTotal = entry.rightValue ? entry.rightValue <= entry.maxRight ? entry.rightValue : entry.maxRight : 0;

      const centerBar = <span className="spaceBar" key={ `centerBar${i}` } style={{width: entry.centerBarValue, backgroundColor: entry.centerBarColor}}></span>;

      let spaceBar;
      spaceBar = leftSpace ? <span className="spaceBar" key={ `spaceBar${i}` } style={{width: leftSpace, backgroundColor: entry.backGroundColor}}></span> : null;

      const leftText = <span className='displayText' key={ `leftText${i}` } style={{color: entry.leftTextColor}}>{ entry.leftText }</span>

      const rightText = <span className='displayText' key={ `rightText${i}` } style={{color: entry.rightTextColor, marginLeft: '8px'}}>{ ' ' + entry.rightText }</span>

      let leftBar;
      if (entry.leftColorExtraThreshold && leftBarTotal > entry.leftColorExtraThreshold) {
        const leftHigh = <span className="bgBar" key={ `leftHigh${i}` } style={{width: leftBarTotal - entry.leftColorExtraThreshold, backgroundColor: entry.leftColorExtra}}></span>
        const leftLow = <span className="bgBar" key={ `leftLow${i}` } style={{width: entry.leftColorExtraThreshold, backgroundColor: entry.leftColorMain, color: entry.leftTextColor}}>{ leftText }</span>
        leftBar = [leftHigh, leftLow];
      } else {
        leftBar = <span className="bgBar" key={ `leftBar${i}` } style={{width: leftBarTotal, backgroundColor: entry.leftColorMain, color: entry.leftTextColor}}>{ leftText }</span>;
      }

      let rightBar;
      if (entry.rightColorExtraThreshold && rightBarTotal > entry.rightColorExtraThreshold) {
        const rightHigh = <span className="iobBar" key={ `rightHigh${i}` } style={{width: rightBarTotal - entry.rightColorExtraThreshold, backgroundColor: entry.rightColorExtra}}></span>
        const rightLow = <span className="iobBar" key={ `leftHigh${i}` } style={{width: entry.rightColorExtraThreshold, backgroundColor: entry.rightColorMain, color: entry.rightText}}></span>
        rightBar = [rightLow, rightHigh];
      } else {
        rightBar = <span className="iobBar" key={ `rightBar${i}` } style={{width: rightBarTotal, backgroundColor: entry.rightColorMain, color: entry.rightText}}></span>;
      }

      const rightSpaceBar = <span className="spaceBar" key={ `rightSpaceBar${i}` }>{ rightText }</span>;

      return (
        <div className="graphBar" key={ `graphBar${i}` }>
        { spaceBar }
        { leftBar }
        { centerBar }
        { rightBar }
        { rightSpaceBar }
        </div>
        )
      });

      return (
        <div>

        <div className="graph">

        {graphBars}
        </div>

        <div id="bottom">
        <br></br>
        <br></br>
        </div>

        </div>
        );
      }

      const calcIobAndBgVals = (data: any) => {

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
            console.log(data[i].bg);
            // check for valid blood sugar values? ie. bg > 20 and bg < 600
            nextBgVals[prevBgIndex] = data[i];
            bgVals[i] = data[i].bg;
            prevBgIndex = i;
          }
        }
        currentBgSlope = (nextBgVals[-5].bg - bgVals[-5]) / ((nextBgVals[-5].time + 5) / 5);

        console.log('nextBgVals:', nextBgVals);

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
            console.log('i:', i)
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

      const makeDataMaps = (data: any) => {
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

      const transformLogDataToMinutesData = (data: any) => {

        // console.log('log data to transform:', data);

        const entryData: any = makeDataMaps(data); // build bgMap and iobMap, combine to entryData

        return entryData.map((entry: any) => {
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
          } else {
            rightText += shot ? shot + ' ' : '';
            rightText += bgLogged ? bgLogged + ' ' + (bgLabel ? (bgLabel + ' ') : '') : '';
            rightText += (bgLogged || shot || notes || (!(time % 60) && iobToDisplay > 0)) ? time + ' ' : '';
            rightText += notes ? notes : '';
          }
          if (!rightText.length && middlePeak) {
            rightText = Math.round(iob) + ' I.O.B ';
          }


          return {
            bg,
            iobToDisplay,
            leftText,
            rightText,
            rightTextColor,
            time
          }
        })


      }

      const transformMinutesDataToGraph = (dataAllMinutes: any) => {
        // console.log('minutes data to transform:', dataAllMinutes);

        return dataAllMinutes.reduce((acc: any, minuteData: any) => {
          const {bg, iobToDisplay, leftText, rightText, rightTextColor, time} = minuteData;

          if (bg || iobToDisplay || leftText?.length || rightText?.length) {
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
              centerBarColor: "black",
              backGroundColor: "lightgrey"
            });
          }
          return acc;
        }, []);
      }

      const getDisplayDateData = (date: string) => {

        return JSON.parse(fs.readFileSync(`${__dirname}/../data/current.json`).toString());
      }

      const Home = (props: any) => {
        // const [ text, setText ] = useState(props.text);
        const text = props.text;
        // const [ currentInput, setCurrentInput ] = useState('');
        const textareaRef: any = useRef();

        const scrollScreen = () => {
          const bottom: any = document.getElementById('bottom');
          bottom.scrollIntoView({ behavior: 'smooth' });
        }

        useEffect(() => {
          textareaRef.current.setSelectionRange(text.length, text.length);
          if (props.scroll) scrollScreen();
        }, []);

        const currentData = getDisplayDateData(props.displayDate);

        const minutesData = transformLogDataToMinutesData(currentData);
        const graphData = transformMinutesDataToGraph(minutesData);

        const process = (val: string) => {
          if (val === 'reset') {
            fs.writeFileSync(`${__dirname}/../data/current.json`, '{}');
          } else {
            const objToWrite = JSON.stringify({...currentData, [val]: val});
            fs.writeFileSync(`${__dirname}/../data/current.json`, objToWrite);
          }
        }

        const submit = (val: string) => {
          if (val.charCodeAt(val.length - 1) === 10) val = val.slice(0, -1);
          // setCurrentInput(val);
          // setText('');
          props.setText('');
          textareaRef.current.focus();
          if (val.length) process(val);
        }

        const clearText = () => {
          props.setText('');
          textareaRef.current.focus();
        }

        const handleInput = (e: any) => {
          const val: string = e.target.value;
          const char: Number = val.charCodeAt(val.length - 1)
          // setText(val);
          props.setText(val);
          if (char === 10) submit(val);
        }

        const inputBox: any =  <textarea ref={ textareaRef } autoComplete="off" autoFocus className="textArea" style={{justifyContent: 'right', color: 'red'}} value={ text } onChange={ (e) => {
          handleInput(e);
        }
      } />



      return (
        <div className="home">

        <div className="graphArea">
        <Graph data={ graphData }/>
        </div>

        {/* <div>
          <Link className="basic-centered" to="/about">
          <button type="button">
          <span role="img" aria-label="books">
          📚
          </span>
          Go to About Page
          </button>
          </Link>
        </div> */}

        <div className="inputArea">
        <div>
        { inputBox }
        </div>

        <div className="inputButtons">
        <button className="inputButton" onClick={ () => {
          submit(text);
        }
      } >
      Submit
      </button>

      <button className="inputButton" onClick={ () => {
        clearText();
      }
    } >
    Clear
    </button>
    </div>

    </div>

    </div>
    );
  };

  const getCurrentDateTime = () => {
    const d = new Date()
    const date = d.toLocaleDateString().replace(/\//g, '-');
    const time = d.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
    console.log('d:', d);
    // also return time in minutes since 6am?
    return {date, time};
  }

  export default function App() {
    const [ textState, setTextState ] = useState('');
    const [displayDate, setDisplayDate] = useState(getCurrentDateTime().date);
    const [scroll, setScroll] = useState(true);

    return (
      // <div>
      <Router>
      <Switch>


      <Route exact path="/"><Home text={ textState } setText={ setTextState } displayDate={ displayDate } setDisplayDate={ setDisplayDate } scroll={ scroll } setScroll={ setScroll }/></Route>

      <Route path="/about"><About /></Route>

      {/* <Route path="/home" component={Home} /> */}
      </Switch>
      </Router>
      // </div>
      );
    }
