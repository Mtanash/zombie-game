class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create() {
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "Click to start!",
        { fontSize: "32px", fill: "#fff" }
      )
      .setOrigin(0.5);

    // add game instructions
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 50,
        "Use arrow keys or WASD to move",
        { fontSize: "24px", fill: "#fff" }
      )
      .setOrigin(0.5);

    // add game instructions
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 100,
        "Press LMB to shoot",
        { fontSize: "24px", fill: "#fff" }
      )
      .setOrigin(0.5);

    this.input.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }
}

export default MainMenuScene;
