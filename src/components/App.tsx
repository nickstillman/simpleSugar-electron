import React from 'react';
import { Link, HashRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import '../App.global.css';
import fs from 'fs';

import Home from './Home';
import About from './About';
import Graph from './Graph';

import {getDisplayDateData, createDateTime, getCurrentDateTime, isTargetToday, formatMinutesPastZero, timeFormatted, getMinutesElapsed} from '../utils/date-time';

import {calcIobAndBgVals, makeDataMaps, transformLogDataToMinutesData, transformMinutesDataToGraph} from '../utils/graph-transformation';

import {parseDate, getTargetDateFromLogIndex, sortLogIndex, updateLogIndex} from '../utils/log-db-utils';

const { useState, useEffect, useRef } = React;

export default function App() {
  const [textState, setTextState] = useState('');
  const [displayDateTime, setDisplayDateTime] = useState({...getCurrentDateTime(), onToday: true});
  const [scroll, setScroll] = useState(true);

  // update date/time every x seconds
  useEffect(() => {
    const timer1 = setInterval(() => {
      if (!displayDateTime.onToday) return;

      const newDateTime = getCurrentDateTime();
      setDisplayDateTime((state: any) => ({...state, date: newDateTime.date, time: newDateTime.time}));
    }, 10000);
    return () => clearInterval(timer1);
  }, [displayDateTime.onToday]);


  const propsObj = {
    textState,
    setTextState,
    displayDateTime,
    setDisplayDateTime,
    scroll,
    setScroll
  }

  // console.log('app rendered!!');
  // console.log('displayDateTime:', displayDateTime);

  return (
    // <div>
    <Router>
    <Switch>


    {/* <Route exact path="/"><Home homeProps={ propsObj }/></Route> */}
    <Route exact path="/"><Home { ...propsObj }/></Route>

    {/* <Route exact path="/"><Home text={ textState } setText={ setTextState } displayDate={ displayDate } setDisplayDate={ setDisplayDate } scroll={ scroll } setScroll={ setScroll }/></Route> */}

    <Route path="/about"><About /></Route>

    {/* <Route path="/home" component={Home} /> */}
    </Switch>
    </Router>
    // </div>
    );
  }
