import Phaser from "phaser";
import GameScene from "./Game";
import GameOverScene from "./GameOver";
import MainMenuScene from "./MainMenu";
import PauseMenu from "./Pause";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainMenuScene, GameScene, GameOverScene, PauseMenu],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
