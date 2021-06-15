
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
        }

        const scrollScreen = () => {
          // console.log('scroll!!!!');
          const bottom: any = document.getElementById('bottom');
          bottom?.scrollIntoView({ behavior: 'smooth' });
        }

        const insertTimeBar = (data: any) => {
          // only insert timeBar if it's today
          // double check, redundant, for present calls to insertTimeBar
          // from show time bar useEffect and dataLoaded useEffect
          if (props.displayDateTime.onToday) {

            const currentTime = getMinutesElapsed(props.displayDateTime.time, timeZero);

            const graphWithTimeBar = [...data];
            // let removeOldTimeBarIndex;

            for (let i = 0; i < data.length; i++) {
              if (data[i].timeBar) {
                graphWithTimeBar[i].timeBar = false;
                // clear timeBar text?
              }
              const timeDiff = currentTime - data[i].time;
              if (timeDiff >= 0 && timeDiff < 5) {
                graphWithTimeBar[i].timeBar = true;
                graphWithTimeBar[i].timeBarText = `Current time is: ${timeFormatted(currentTime, timeZero)}`;
                return graphWithTimeBar;
              }
            }
            return graphWithTimeBar;
          }
          return data;
        }

        useEffect(() => {
          textareaRef.current.setSelectionRange(text.length, text.length);
        }, []);

        // insert/show time bar in graph if it's today
        useEffect(() => {
          if (props.displayDateTime.onToday) {
            setGraphData(insertTimeBar(graphData));
          }
        }, [props.displayDateTime.time]);

        useEffect(() => {
          if (props.scroll) scrollScreen();
        }, [props.scroll]);

        useEffect(() => {
          const dataLoaded = getDisplayDateData(props.displayDateTime.date);
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


        // OLD pre-dataLoaded hook?
        // const currentData = getDisplayDateData(props.displayDate);
        // const minutesData = transformLogDataToMinutesData(currentData);
        // const graphData = transformMinutesDataToGraph(minutesData);


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

        }

        const submit = (val: string) => {
          props.setTextState('');
          textareaRef.current.focus();
          if (val.length) process(val);
        }

        const clearText = () => {
          props.setTextState('');
          textareaRef.current.focus();
        }

        const handleInput = (e: any) => {
          const val: string = e.target.value;
          const char: Number = val.charCodeAt(val.length - 1)
          props.setTextState(val);
          // this logic works for now but if text is pasted in with a ending CR and
          // is one char longer than current text, it will submit
          // rare occurrence though
          // how to prevent that? detect actual CR keypress??
          if (char === 10 && (val.length - props.textState.length === 1)) submit(val.trim());
        }

        const inputBox: any =  <textarea ref={ textareaRef } autoComplete="off" autoFocus className="textArea" style={ {justifyContent: "right", color: "red"} } value={ text } onChange={ (e) => {
          handleInput(e);
        }
      } />

      const navigate = (direction: string) => {
        console.log('direction:', direction);
        textareaRef.current.focus();

        const currentDate = props.displayDateTime.date;

        if (direction === 'back' || direction === 'forward') {
          const targetDate = getTargetDateFromLogIndex(currentDate, direction === 'back' ? -1 : 1);

          console.log('currentDate, targetDate:', currentDate, targetDate);

          const onToday = isTargetToday(targetDate, getCurrentDateTime().date);
          console.log('ontoday:', onToday);

          props.setDisplayDateTime((state: any) => ({...state, date: targetDate, onToday}));

          props.setScroll(onToday);
        }

        if (direction === 'now') {
          props.setDisplayDateTime((state: any) => ({...state, ...getCurrentDateTime(), onToday: true}));
          props.setScroll(true);
          scrollScreen();
        }
      }



      // basal warning/success message logic


      useEffect(() => {
        let gaveBasalMessage = <span></span>;

        // const onToday = isTargetToday(props.displayDateTime.date, getCurrentDateTime().date);
        const onToday = props.displayDateTime.onToday;

        // console.log('basalTime:', basalTime);
        if (currentData.gaveBasal && !graphError) {
          const isWas = onToday ? ` Basal is DONE!!! (${currentData.gaveBasal} units)` : '';
          gaveBasalMessage = <div className="basalMessage">{ isWas }</div>
        } else if (!currentData.gaveBasal && props.displayDateTime.onToday && (getMinutesElapsed(props.displayDateTime.time, timeZero) >= basalTime) && !graphError) { // need a minutes elapsed time to compare for past-basalTime check
          gaveBasalMessage = <div className="basalMessage" style={ {color: "red"} }>
          Basal NOT YET GIVEN!?!?!?

          <div>
          <button className="dateButton" onClick={ () => {
            navigate('back');
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

    return (
      <div className="home">

      <div className="graphArea">
      { graphError ? <div className="graphError"> { graphError } </div> : <Graph data={ graphData }/> }
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

      <div className="console">
      {/* give console a border and make it draggable? */}

      <div className="gaveBasal">
      {/* { gaveBasalMessage } */}
      { basalMessage }

      </div>

      <div className="inputArea">
      {/* give inputArea a border and make it draggable? NO, USE CONSOLE! */}

      <div className="dateButtons">
      <button className="dateButton" onClick={ () => {
        navigate('back');
      }
    } >
    Back
    </button>

    <button className="dateButton" onClick={ () => {
      navigate('forward');
    }
  } >
  Forward
  </button>

  <button className="dateButton" onClick={ () => {
    navigate('now');
  }
} >
Now
</button>
</div>

<div className="dateDisplay">
{ displayDateTimeDOM }
</div>
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

</div>
);
};

export default Home;
