import React from 'react';


const Console = (props: any) => {

const {text, displayDateTimeDOM, basalMessage, textareaRef, process, navigate} = props;

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

  return (
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
);
};

export default Console;

