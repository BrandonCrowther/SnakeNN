import React from 'react';
import './App.css';
import GameBoard from './GameBoard'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <h1>Snake Neural Network</h1>
      <p>
        <span>By Brandon Crowther</span> 
        <strong>&nbsp;&nbsp;|&nbsp;&nbsp;</strong> 
        <a href="https://github.com/BrandonCrowther/SnakeNN">Github</a>
        <strong>&nbsp;&nbsp;|&nbsp;&nbsp;</strong> 
        <a href="mailto:bcrowthe11@gmail.com">bcrowthe11@gmail.com</a>
      </p>
      <div className="game">
        <div>
          <GameBoard></GameBoard>
        </div>
      </div>
    </div>
  );
}

export default App;
