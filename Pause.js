class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "Game Paused",
        { fontSize: "32px", fill: "#fff" }
      )
      .setOrigin(0.5, 0.5);

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.stop("PauseMenu");
      this.scene.resume("GameScene");
    });
  }
}

export default PauseMenu;
