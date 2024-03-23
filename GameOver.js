class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "Game Over, press R to restart the game",
        { fontSize: "32px", fill: "#fff" }
      )
      .setOrigin(0.5);

    this.input.keyboard.on("keydown-R", () => {
      this.scene.start("GameScene");
    });
  }
}

export default GameOverScene;
