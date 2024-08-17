import React, { useEffect, useState } from "react";
import { Game } from "./shared/Game";
import { Spinner } from "react-bootstrap";
import * as tf from "@tensorflow/tfjs";
import { NeuralTrainingInterface } from "./node/NeuralTrainingInterface";
import { runner } from "./shared/runner";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EMPTY = "-";
const HEAD = "H";
const TAIL = "S";
const CHEESE = "C";

const colorMap = {
  [EMPTY]: "gray",
  [HEAD]: "red",
  [TAIL]: "black",
  [CHEESE]: "yellow",
};

export default function GameBoardV2(props) {
  // const [modelInterface, setModelInterface] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gameBoard, setGameBoard] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);

  useEffect(() => {
    (async () => {
      await tf.ready();
      const tfModel = await tf.loadLayersModel("model/model.json");
      const inter = new NeuralTrainingInterface(tfModel);
      // setModelInterface(new NeuralTrainingInterface(tfModel));
      runner(inter, setGameBoard);
      setIsLoaded(true);
    })();
  }, []);

  if (!isLoaded) {
    return (
      <Spinner
        animation="border"
        role="status"
        style={{ width: 4 + "rem", height: 4 + "rem" }}
      >
        <span className="sr-only">Loading...</span>
      </Spinner>
    );
  }

  return (
    <div>
      <div>
        <button onClick={this.toggleMode}>Toggle Mode</button>{" "}
        {/* {trainingMode ? "Training Mode" : "Pre-trained Mode"} */}
      </div>
      <div>{/* Run: {run} */}</div>
      <div>
        <button onClick={() => setGameSpeed(gameSpeed - 5)}>-</button>
        Game Speed
        <button onClick={() => setGameSpeed(gameSpeed + 5)}>+</button>
      </div>
      <div className="board">
        {gameBoard.getState().map((e) => {
          return e.map((f) => <div className={"block " + colorMap[f]}></div>);
        })}
      </div>
    </div>
  );
}
