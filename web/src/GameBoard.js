import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import * as tf from "@tensorflow/tfjs";
import { Game } from "snakenn-shared/Game";
import { runner } from "snakenn-shared/runner";
import { V1AlgorithmAgent } from "snakenn-shared/agents/V1AlgorithmAgent";
import { ENTITY_CODES } from "snakenn-shared/config";
import { KeyboardWebAgent } from "snakenn-shared/agents/KeyboardWebAgent";
import { V1NeuralAgent } from "snakenn-shared/agents/V1NeuralAgent";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { EMPTY, HEAD, TAIL, CHEESE } = ENTITY_CODES;

const colorMap = {
  [EMPTY]: "gray",
  [HEAD]: "red",
  [TAIL]: "black",
  [CHEESE]: "yellow",
};

export default function GameBoardV2(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [gameBoard, setGameBoard] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);

  useEffect(() => {
    (async () => {
      await tf.ready();
      const tfModel = await tf.loadLayersModel("v1_neural_model/model.json");
      const agent = new V1NeuralAgent(tf, tfModel);

      runner(agent, setGameBoard);
      setIsLoaded(true);
    })();
  }, []);

  if (!isLoaded) {
    return (
      <Spinner
        animation="border"
        role="status"
        style={{ width: 4 + "rem", height: 4 + "rem" }}
      />
    );
  }

  return (
    <div>
      <div>
        {/* <button onClick={this.toggleMode}>Toggle Mode</button>{" "} */}
        {/* {trainingMode ? "Training Mode" : "Pre-trained Mode"} */}
      </div>
      <div>{/* Run: {run} */}</div>
      <div>
        <button onClick={() => setGameSpeed(gameSpeed - 5)}>-</button>
        Game Speed
        <button onClick={() => setGameSpeed(gameSpeed + 5)}>+</button>
      </div>
      <div className="board">
        {gameBoard.map((e) => {
          return e.map((f) => {
            return <div className={"block " + colorMap[f]}></div>;
          });
        })}
      </div>
    </div>
  );
}
