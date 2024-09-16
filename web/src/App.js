import React from "react";
import "./App.css";
import GameBoard from "./GameBoard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <h1>Snake Neural Network</h1>
      <div>
        <a href="https://github.com/BrandonCrowther/SnakeNN">Github</a>
        &nbsp;|&nbsp;
        <a href="mailto:bcrowthe11@gmail.com">bcrowthe11@gmail.com</a>
      </div>

      <div className="game pt-4">
        <GameBoard />
      </div>
    </div>
  );
}

export default App;
