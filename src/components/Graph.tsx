import React from 'react';

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

      const timeBar = entry.timeBar ? <span className="timeBar" key={ `timeBar${i}` }>{ entry.timeBarText }</span>: null;

      return (
        <div className="graphBarWrapper" key={ `graphBarWrapper${i}` }>
        <div className="graphBar" key={ `graphBar${i}` }>
        { spaceBar }
        { leftBar }
        { centerBar }
        { rightBar }
        { rightSpaceBar }
        </div>
        { timeBar }
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

export default Graph;
