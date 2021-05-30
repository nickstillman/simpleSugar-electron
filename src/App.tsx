import React from 'react';
// import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Link, HashRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import './App.global.css';

const { useState, useEffect } = React;

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

const Hello = () => {
  return (
    <div>
    <div className="basic-centered">
    <img width="200px" alt="icon" src={icon} />
    </div>
    <h1 className="basic-centered">simpleSugar</h1>
    <h2 className="basic-centered">Diabetes Tech for Diabetics Who Don't Use Tech</h2>
    <div className="basic-centered">
    <Link to="/home">
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


  const Home = () => {
    const [ text, setText ] = useState('');
    const [ currentInput, setCurrentInput ] = useState('');

    const handleInput = (e: any) => {
      const val = e.target.value;
      const char = val.charCodeAt(val.length - 1)
      setText(val);
      console.log('TYPED:', val);
      console.log('text:', text);
      // console.log('endChar', char);
      if (char === 10) {
        setCurrentInput(val);
        setText('');
        console.log('process:', val, 'input:', currentInput);
      }
    }

    useEffect(() => {
      console.log('textEFFECT:', text);
      console.log('currentInputEFFECT:', currentInput);
    })

    return (
      <div>
      <div className="basic-centered">
      <h1>Hi from simpleSugar!</h1>
      </div>
      <div>
      <Link className="basic-centered" to="/">
      <button type="button">
      <span role="img" aria-label="books">
      📚
      </span>
      Back to Title Page
      </button>
      </Link>
      </div>

      {/* <form className="inputArea">
      <label>
      <textarea autoComplete="off" autoFocus className="textArea" value={ text } onChange={ setText( text ) } />
      </label>
    </form> */}

    <form className="inputArea">
    <label>
    <textarea autoComplete="off" autoFocus className="textArea" value={ text } onChange={ (e) => {
      handleInput(e);
    }
  } />
  </label>
  </form>
  <div>
  <div className="basic-centered">
  <h1>NOW:
  { currentInput }
  </h1>
  </div>
  </div>
  {/* <p>
    { text }
    </p>

  <button onClick={() => setText(text + '!')}></button> */}


  </div>
  );
};

export default function App() {
  return (
    <Router>
    <Switch>
    <Route exact path="/" component={Hello} />
    <Route path="/home" component={Home} />
    </Switch>
    </Router>
    );
  }
