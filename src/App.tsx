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

      const centerBar = <span className="spaceBar" style={{width: entry.centerBarValue, backgroundColor: entry.centerBarColor}}></span>;

      let spaceBar;
      spaceBar = leftSpace ? <span className="spaceBar" style={{width: leftSpace, backgroundColor: entry.backGroundColor}}></span> : null;

      const leftText = <span className='displayText' style={{color: entry.leftTextColor}}>{ entry.leftText }</span>

      const rightText = <span className='displayText' style={{color: entry.rightTextColor, marginLeft: '8px'}}>{ ' ' + entry.rightText }</span>

      let leftBar;
      if (entry.leftColorExtraThreshold && leftBarTotal > entry.leftColorExtraThreshold) {
        const leftHigh = <span className="bgBar" style={{width: leftBarTotal - entry.leftColorExtraThreshold, backgroundColor: entry.leftColorExtra}}></span>
        const leftLow = <span className="bgBar" style={{width: entry.leftColorExtraThreshold, backgroundColor: entry.leftColorMain, color: entry.leftTextColor}}>{ leftText }</span>
        leftBar = [leftHigh, leftLow];
      } else {
        leftBar = <span className="bgBar" style={{width: leftBarTotal, backgroundColor: entry.leftColorMain, color: entry.leftTextColor}}>{ leftText }</span>;
      }

      let rightBar;
      if (entry.rightColorExtraThreshold && rightBarTotal > entry.rightColorExtraThreshold) {
        const rightHigh = <span className="iobBar" style={{width: rightBarTotal - entry.rightColorExtraThreshold, backgroundColor: entry.rightColorExtra}}></span>
        const rightLow = <span className="iobBar" style={{width: entry.rightColorExtraThreshold, backgroundColor: entry.rightColorMain, color: entry.rightText}}></span>
        rightBar = [rightLow, rightHigh];
      } else {
        rightBar = <span className="iobBar" style={{width: rightBarTotal, backgroundColor: entry.rightColorMain, color: entry.rightText}}></span>;
      }

      const rightSpaceBar = <span className="spaceBar">{ rightText }</span>;

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

        let currentBg = 100;
        let currentIob = 0;

        const iobVals: any = {};
        const bgVals: any = {};

        const nextBgVals: any = {};
        const nextIobVals: any = {};

        let prevBgIndex = -1;
        let prevIobIndex = -1;

        for (let i = 0; i <= 1440; i +=5) {
          if (data[i]?.bg) {
            console.log(data[i].bg);
            nextBgVals[prevBgIndex] = data[i].bg;
            bgVals[i] = data[i].bg;
            prevBgIndex = i;
          }
          if (data[i]?.shot) {
            console.log(data[i].shot);
            nextIobVals[prevIobIndex] = data[i].shot;
            iobVals[i] = data[i].shot;
            prevIobIndex = i;
          }
        }

        console.log('nextBgVals:', nextBgVals);
        console.log('nextIobVals:', nextIobVals);

        return [iobVals, bgVals];
      }

      const makeDataMaps = (data: any) => {
        const output: any = [];

        const [iobVals, bgVals] = calcIobAndBgVals(data);

        for (let i = 0; i <= 1440; i += 5) {
          if (data[i]) {
            const {bg, bgLabel, shot, time, notes} = data[i];
            output[i] = {
              ...data[i],
              iob: iobVals[i],
              bgDisplay: (bg >= 20)
            }
          } else {
            output[i] = {
              bg: bgVals[i],
              bgLabel: null,
              shot: null,
              time: i,
              notes: null,
              iob: iobVals[i],
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
          const {bg, bgLabel, bgDisplay, iob, shot, time, notes} = entry;
          const leftText = bgDisplay ? (bg + ' ' + (bgLabel ? (bgLabel + ' ') : '')) : null;
          let rightText = '';
          rightText += shot ? shot + ' ' : '';
          rightText += bg ? bg + ' ' + (bgLabel ? (bgLabel + ' ') : '') : '';
          rightText += (bg || shot || notes || !(time % 20)) ? time + ' ' : '';
          rightText += notes ? notes : '';

          return {
            bg,
            iob,
            leftText,
            rightText
          }
        })


      }

      const transformMinutesDataToGraph = (dataAllMinutes: any) => {
        // console.log('minutes data to transform:', dataAllMinutes);

        return dataAllMinutes.reduce((acc: any, minuteData: any) => {
          const {bg, iob, leftText, rightText} = minuteData;

          if (bg || iob || leftText || rightText) acc.push({
            maxLeft: 400,
            maxRight: 800,
            leftValue: bg,
            leftColorMain: "green",
            leftColorExtra: "maroon",
            leftColorExtraThreshold: 180,
            leftText,
            leftTextColor: "white",
            rightValue: (iob * 50),
            rightColorMain: "lightblue",
            rightColorExtra: "pink",
            rightColorExtraThreshold: 300,
            rightText,
            rightTextColor: "black",
            centerBarValue: 10,
            centerBarColor: "black",
            backGroundColor: "grey"
          });

          return acc;
        }, []);



        return [
          {
            "maxLeft": 400,
            "maxRight": 400,
            "leftValue": 98,
            "leftColorMain": "green",
            "leftColorExtra": "maroon",
            "leftColorExtraThreshold": 180,
            "leftText": "108",
            "leftTextColor": "white",
            "rightValue": 200,
            "rightColorMain": "lightblue",
            "rightColorExtra": "pink",
            "rightColorExtraThreshold": 150,
            "rightText": "3 108 wal pizza",
            "rightTextColor": "black",
            "centerBarValue": 20,
            "centerBarColor": "black",
            "backGroundColor": "grey"
          },
          {
            "maxLeft": 400,
            "maxRight": 400,
            "leftValue": 540,
            "leftColorMain": "green",
            "leftColorExtra": "maroon",
            "leftColorExtraThreshold": 180,
            "leftText": "108",
            "leftTextColor": "white",
            "rightValue": 100,
            "rightColorMain": "lightblue",
            "rightColorExtra": "pink",
            "rightColorExtraThreshold": 150,
            "rightText": "54 ice cream",
            "rightTextColor": "black",
            "centerBarValue": 20,
            "centerBarColor": "black",
            "backGroundColor": "grey"
          }
        ]
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
          scrollScreen();
        }, []);

        const currentData = JSON.parse(fs.readFileSync(`${__dirname}/../data/current.json`).toString());
        console.log('currentFile:', currentData);
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

  export default function App() {
    const [ textState, setTextState ] = useState('');

    return (
      // <div>
      <Router>
      <Switch>


      <Route exact path="/"><Home text={ textState } setText={ setTextState } /></Route>

      <Route path="/about"><About /></Route>

      {/* <Route path="/home" component={Home} /> */}
      </Switch>
      </Router>
      // </div>
      );
    }
