import React from 'react';
// import { Link, HashRouter as Router, Switch, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import '../App.global.css';
// import fs from 'fs';

import GraphWrapper from './GraphWrapper';

import Console from './Console';

import {createDateTime, getCurrentDateTime, isTargetToday, formatMinutesPastZero, timeFormatted, getMinutesElapsed} from '../utils/date-time';

import {calcIobAndBgVals, makeDataMaps, transformLogDataToMinutesData, transformMinutesDataToGraph} from '../utils/graph-transformation';

import {parseDate, getTargetDateFromLogIndex, sortLogIndex, updateLogIndex, getDataForDate} from '../utils/log-db-utils';

const { useState, useEffect, useRef } = React;


const Home = (props: any) => {
  const text = props.textState;
  const textareaRef: any = useRef();
  const displayDateTimeDOM = createDateTime(props.displayDateTime);
  const [currentData, setCurrentData] = useState({gaveBasal: 0});
  const [graphData, setGraphData] = useState([]);
  const [graphError, setGraphError] = useState('');
  const [basalTime, setBasalTime] = useState(900);
  const [basalMessage, setBasalMessage] = useState(<span></span>);

  const timeZero = {
    hour: 6,
    minute: 0,
    am: true
  };

  const scrollScreen = () => {
    // console.log('scroll!!!!');
    const bottom: any = document.getElementById('bottom');
    bottom?.scrollIntoView({ behavior: 'smooth' });
  };

  const insertTimeBar = (data: any) => {
    // only insert timeBar if it's today
    // double check, redundant, for present calls to insertTimeBar
    // from show time bar useEffect and dataLoaded useEffect
    if (props.displayDateTime.onToday) {

      const currentTime = getMinutesElapsed(props.displayDateTime.time, timeZero);

      const graphWithTimeBar = [...data];

      for (let i = 0; i < data.length; i++) {
        if (data[i].timeBar) {
          graphWithTimeBar[i].timeBar = false;
        }
        const timeDiff = currentTime - data[i].time;

        if (timeDiff >= 0 && timeDiff < 10) {
          graphWithTimeBar[i].timeBar = true;
          graphWithTimeBar[i].timeBarText = `Current time is: ${timeFormatted(currentTime, timeZero)}`;
          return graphWithTimeBar;
        }
      }
      console.log('returning data: ', graphWithTimeBar);
      return graphWithTimeBar;
    }
    return data;
  };

  useEffect(() => {
    textareaRef.current.setSelectionRange(text.length, text.length);
  }, []);

  useEffect(() => {
    if (props.scroll) scrollScreen();
  }, [props.scroll]);

  useEffect(() => {
    const dataLoaded = getDataForDate(props.displayDateTime.date);
    console.log('dataLoaded:', dataLoaded);
    if (dataLoaded) {
      const [minutesDataLoaded, gaveBasal] = transformLogDataToMinutesData(dataLoaded);
      dataLoaded.gaveBasal = gaveBasal;

      let graphDataLoaded = transformMinutesDataToGraph(minutesDataLoaded);
      if (props.displayDateTime.onToday) {
        graphDataLoaded = insertTimeBar(graphDataLoaded);
      }

      setGraphData(graphDataLoaded);
      setGraphError('');
      setCurrentData(dataLoaded);
      if (dataLoaded.basalTime) setBasalTime(dataLoaded.basalTime);

      // set lastOpened in logIndex
      updateLogIndex(props.displayDateTime.date, 'lastOpened');

    } else {
      setGraphError('Error loading entries');
    }
  }, [props.displayDateTime.date]);

  // scroll with graphData update?? NO, use currentData
  // so not affected by timeBar update to graphData
  useEffect(() => {
    if (props.scroll) scrollScreen();
  }, [currentData]);

  // // insert/show time bar in graph if it's today
  useEffect(() => {
    if (props.displayDateTime.onToday && graphData.length) {
      setGraphData(insertTimeBar(graphData));
    }
  }, [props.displayDateTime.time]);



  const process = (val: string) => {
    // currently is a sample process, TODO: write real process/parse functions

    // if (val === 'reset') {
    //   fs.writeFileSync(`${__dirname}/../data/current.json`, '{}');
    // } else {
    //   const objToWrite = JSON.stringify({...currentData, [val]: val});
    //   fs.writeFileSync(`${__dirname}/../data/current.json`, objToWrite);
    // }
    const res = updateLogIndex('log' + props.displayDateTime.date, 'index');
    console.log('res:', res, val);

  };

  const navigate = (direction: string) => {
    console.log('direction:', direction);
    textareaRef.current.focus();

    const currentDate = props.displayDateTime.date;

    if (direction === 'back' || direction === 'forward') {
      const targetDate = getTargetDateFromLogIndex(currentDate, direction === 'back' ? -1 : 1);

      console.log('currentDate, targetDate:', currentDate, targetDate);
      if (typeof targetDate === 'string') {
        const onToday = isTargetToday(targetDate, getCurrentDateTime().date);
        console.log('ontoday:', onToday);

        props.setDisplayDateTime((state: any) => ({...state, date: targetDate, onToday}));

        props.setScroll(onToday);
      } else {
        console.log('Cannot get target date from logIndex');
      }
    }

    if (direction === 'now') {
      props.setDisplayDateTime((state: any) => ({...state, ...getCurrentDateTime(), onToday: true}));
      props.setScroll(true);
      scrollScreen();
    }
  };


  // basal warning/success message logic

  useEffect(() => {
    let gaveBasalMessage = <span></span>;

    // const onToday = isTargetToday(props.displayDateTime.date, getCurrentDateTime().date);
    const onToday = props.displayDateTime.onToday;

    // console.log('basalTime:', basalTime);
    if (currentData.gaveBasal && !graphError) {
      const isWas = onToday ? ` Basal is DONE!!! (${currentData.gaveBasal} units)` : '';
      gaveBasalMessage = <div className="basalMessage">{ isWas }</div>
    } else if (!currentData.gaveBasal && props.displayDateTime.onToday && (getMinutesElapsed(props.displayDateTime.time, timeZero) >= basalTime) && !graphError) {
      gaveBasalMessage = <div className="basalMessage" style={ {color: "red"} }>
      Basal NOT YET GIVEN!?!?!?

      <div>
      <button className="dateButton" onClick={ () => {
        navigate('back');
        // change this onClick to retrieve the basal given at the most recent entry
        // when basal was given (within 10 days?)
        // or else either don't add or prompt for basal amount?
        // then create an entry with this info and call insertEntry
      }
    } >
    GIVE BASAL?
    </button>
    </div>

    </div>
  } else if (!currentData.gaveBasal && !props.displayDateTime.onToday && !graphError) {
    gaveBasalMessage = <div className="basalMessage" style={ {color: "black"} }>
    No basal recorded on this date!
    </div>
  }

  setBasalMessage(gaveBasalMessage);
}, [graphData]);


const consoleObj = {text, displayDateTimeDOM, basalMessage, textareaRef, process, navigate};

const graphWrapperObj = {graphError, graphData};

return (
  <div className="home">

  <GraphWrapper { ...graphWrapperObj }/>

  <Console { ...props } { ...consoleObj } />

  </div>
  );
};

export default Home;
