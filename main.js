import Phaser from "phaser";
import GameScene from "./Game";
import GameOverScene from "./GameOver";
import MainMenuScene from "./MainMenu";
import PauseMenu from "./Pause";
import "./index.css";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [MainMenuScene, GameScene, GameOverScene, PauseMenu],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "app",
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
