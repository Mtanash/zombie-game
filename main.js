import Phaser from "phaser";
import bullet from "./images/bullet.png";
import backgroundImage from "./images/grass.png";
import enemyImage from "./images/tds_zombie/export/Attack/skeleton-attack_0.png";
import playerImage from "./images/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image("background", backgroundImage);
    this.load.image("player", playerImage);
    this.load.image("bullet", bullet);
    this.load.image("enemy", enemyImage);
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

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.time.addEvent({
      delay: 1000,
      callback: this.createEnemy,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(
      this.player,
      this.enemies,
      this.playerHit,
      null,
      this
    );

    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.bulletHit,
      null,
      this
    );

    this.createHealthBar();

    this.input.on("pointerdown", (pointer) => {
      this.fireBullet(pointer);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 100, "player").setScale(0.25);
    this.player.setCollideWorldBounds(true);
    this.player.health = 100;
  }

  createHealthBar() {
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x2ecc71, 1);

    // Calculate the width of the health bar based on the player's health
    let healthBarWidth = this.player.health;

    this.healthBar.fillRect(
      this.player.x - 50,
      this.player.y - 70,
      healthBarWidth,
      10
    );

    this.healthBar.lineStyle(2, 0x000000, 1);
    this.healthBar.strokeRect(this.player.x - 50, this.player.y - 70, 100, 10);
  }

  update() {
    this.movePlayerManager();
    this.moveEnemyManager();
    this.updateHealthBar();
  }

  fireBullet(pointer) {
    let bullet = this.physics.add
      .sprite(this.player.x, this.player.y, "bullet")
      .setScale(4);

    this.bullets.add(bullet);

    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;

    this.physics.world.on("worldbounds", (body) => {
      if (body.gameObject === bullet) {
        bullet.destroy();
      }
    });

    // Calculate the direction of the bullet
    let angle = Phaser.Math.Angle.BetweenPoints(this.player, pointer);

    // Set the bullet's velocity
    this.physics.velocityFromRotation(angle, 500, bullet.body.velocity);
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

  createEnemy() {
    const MAX_ENEMIES = 10;

    if (this.enemies.getChildren().length >= MAX_ENEMIES) return;

    let x = Phaser.Math.Between(0, 800);
    let y = Phaser.Math.Between(0, 600);

    let enemy = this.physics.add.sprite(x, y, "enemy").setScale(0.25);
    enemy.hit = false;

    this.enemies.add(enemy);

    // Stop the enemy when it overlaps with the player
    this.physics.add.overlap(
      this.player,
      enemy,
      () => {
        enemy.setVelocity(0, 0);
      },
      null,
      this
    );
  }

  moveEnemyManager() {
    this.enemies.getChildren().forEach((enemy) => {
      let angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // Set the enemy's rotation to face the player
      enemy.rotation = angle;

      // Only move the enemy if it's not overlapping with the player
      if (
        !Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          enemy.getBounds()
        )
      ) {
        this.physics.velocityFromRotation(angle, 100, enemy.body.velocity);
      } else {
        enemy.setVelocity(0, 0);
      }
    });
  }

  playerHit(player, enemy) {
    if (!enemy.hit) {
      player.health = Math.max(player.health - 10, 0);
      enemy.hit = true;
      enemy.setTint(0xff0000);

      this.time.delayedCall(1000, () => {
        enemy.hit = false;
        enemy.clearTint();
      });
    }
  }

  bulletHit(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
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
