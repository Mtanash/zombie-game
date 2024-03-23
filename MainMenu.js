class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create() {
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "Main Menu",
        { fontSize: "32px", fill: "#fff" }
      )
      .setOrigin(0.5);

    this.input.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }
}

export default MainMenuScene;
