import React from "react";
import Spinner from "react-bootstrap/Spinner";
import "./GameBoard.css";
import * as tf from "@tensorflow/tfjs";
import { NeuralPreloadedInterface } from "./game/NeuralPreloadedInterface";
import { NeuralTrainingInterface } from "./game/NeuralTrainingInterface";
import { Game } from "./game/Game";

class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      board: [[]],
      speed: 25,
      trainingMode: false,
    };
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async componentDidMount() {
    await tf.ready();

    const tfModel = await tf.loadLayersModel("model/model.json");
    const modelInterface = new NeuralPreloadedInterface(tfModel);

    this.setState(
      {
        isLoaded: true,
        modelInterface: modelInterface,
      },
      this.gameLoop
    );
  }

  async gameLoop() {
    while (!this.state.trainingMode) {
      let game = new Game(this.state.modelInterface);

      let done = false;
      while (!done) {
        done = game.tick();
        this.setState({ board: game.board });
        await this.sleep(this.state.speed);
      }

      await this.sleep(1000);
    }
    this.train();
  }

  async train() {
    var topScore = 0;
    var run = 1;
    const trainingInterface = new NeuralTrainingInterface();
    while (this.state.trainingMode) {
      run++;
      var game = new Game(trainingInterface);
      var done = false;
      while (!done) {
        done = game.tick();
        await this.sleep(this.state.speed);
        this.setState({ board: game.board, run: run });
      }

      await trainingInterface.fitReplay();

      if (game.score > topScore) {
        topScore = game.score;
        // await trainingInterface.save('downloads://" + ' + topScore)
        this.setState({ topScore: topScore });
      }
    }
    this.gameLoop();
  }

  increaseSpeed = (_) => {
    this.setState({ speed: Math.max(this.state.speed - 5, 0) });
  };

  decreaseSpeed = (_) => {
    this.setState({ speed: this.state.speed + 5 });
  };

  toggleMode = (_) => {
    this.setState({ trainingMode: !this.state.trainingMode });
  };

  render() {
    const { trainingMode, isLoaded, board, run } = this.state;

    const fatSpinnerStyle = { width: 4 + "rem", height: 4 + "rem" };

    const colorMap = {
      0: "gray",
      1: "red",
      2: "black",
      3: "yellow",
    };

    if (!isLoaded) {
      return (
        <Spinner animation="border" role="status" style={fatSpinnerStyle}>
          <span className="sr-only">Loading...</span>
        </Spinner>
      );
    }
    return (
      <div>
        <div>
          <button onClick={this.toggleMode}>Toggle Mode</button>{" "}
          {trainingMode ? "Training Mode" : "Pre-trained Mode"}
        </div>
        <div>{/* Run: {run} */}</div>
        <div>
          <button onClick={this.decreaseSpeed}>-</button>
          Game Speed
          <button onClick={this.increaseSpeed}>+</button>
        </div>
        <div className="board">
          {board.map((e) => {
            return e.map((f) => <div className={"block " + colorMap[f]}></div>);
          })}
        </div>
      </div>
    );
  }
}
export default GameBoard;
