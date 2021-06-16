import React from 'react';
import Graph from './Graph';


const GraphWrapper = (props: any) => {

  const { graphError, graphData } = props;

  return (
    <div className="graphArea">
    { graphError ? <div className="graphError"> { graphError } </div> : <Graph data={ graphData }/> }
    </div>
    );
  };

  export default GraphWrapper;

