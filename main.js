import Phaser from "phaser";
import bullet from "./images/bullet.png";
import backgroundImage from "./images/grass.png";
import playerImage from "./images/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image("background", backgroundImage);
    this.load.image("player", playerImage);
    this.load.image("bullet", bullet);
  }

  create() {
    this.add.image(0, 0, "background").setScale(2);
    this.createPlayer();

    // create cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create WASD keys
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.physics.world.setBounds(0, 0, 800, 600);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 100, "player").setScale(0.25);
  }

  update() {
    this.movePlayerManager();

    this.input.on("pointerdown", (pointer) => {
      let bullet = this.physics.add
        .sprite(this.player.x, this.player.y, "bullet")
        .setScale(4);

      bullet.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;

      this.physics.world.on("worldbounds", (body) => {
        if (body.gameObject === bullet) {
          bullet.destroy();
        }
      });

      // Calculate the direction of the bullet
      let direction = new Phaser.Math.Vector2();
      this.physics.velocityFromRotation(this.player.rotation, 500, direction);

      // Set the bullet's velocity
      bullet.setVelocity(direction.x, direction.y);
    });
  }

  movePlayerManager() {
    let velocity = new Phaser.Math.Vector2();

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocity.x = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocity.x = 1;
    } else {
      velocity.x = 0;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocity.y = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocity.y = 1;
    } else {
      velocity.y = 0;
    }

    velocity.normalize();
    velocity.scale(200);

    this.player.setVelocity(velocity.x, velocity.y);

    if (velocity.length() > 0) {
      let targetAngle = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y);

      // Interpolate between the current angle and the target angle
      if (this.player.rotation !== targetAngle) {
        let delta = Phaser.Math.Angle.Wrap(targetAngle - this.player.rotation);

        if (delta > Math.PI) {
          delta -= 2 * Math.PI;
        }

        if (delta < -Math.PI) {
          delta += 2 * Math.PI;
        }

        this.player.rotation = Phaser.Math.Angle.Wrap(
          this.player.rotation + delta * 0.2
        );
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
