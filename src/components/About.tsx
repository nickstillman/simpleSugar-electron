import React from 'react';
import { Link } from 'react-router-dom';

// import icon from '../../assets/icon.svg';


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

export default About;
