import idleAnimation from "./images/animations/idle.png";
import shootAnimation from "./images/animations/shoot.png";
import walkAnimation from "./images/animations/walk.png";
import zombieWalkAnimation from "./images/animations/zombie-walk.png";
import bullet from "./images/bullet.png";
import backgroundImage from "./images/grass.png";
import gunShotSound from "./sounds/gun-shot.mp3";
import themeMusic from "./sounds/terror-ambience.mp3";
import zombieAttackSound from "./sounds/Zombie-Attack.mp3";
import zombieDeathSound from "./sounds/zombie-death.mp3";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("background", backgroundImage);
    this.load.image("bullet", bullet);
    this.load.audio("gunShot", gunShotSound);
    this.load.audio("zombieDeath", zombieDeathSound);
    this.load.audio("theme", themeMusic);
    this.load.audio("zombieAttack", zombieAttackSound);
    this.load.spritesheet("walk", walkAnimation, {
      frameWidth: 313,
      frameHeight: 206,
    });
    this.load.spritesheet("shoot", shootAnimation, {
      frameWidth: 313,
      frameHeight: 206,
    });
    this.load.spritesheet("player", idleAnimation, {
      frameWidth: 313,
      frameHeight: 206,
    });
    this.load.spritesheet("zombie", zombieWalkAnimation, {
      frameWidth: 288,
      frameHeight: 311,
    });
  }

  create() {
    this.add.image(0, 0, "background").setScale(3);
    this.createPlayer();
    this.createControls();
    this.setWorldBounds();
    this.createGroups();
    this.createColliders();
    this.createHealthBar();
    this.setEvents();
    this.setupScore();
    this.handleSound();
    this.createAnimations();
  }

  update() {
    this.movePlayerManager();
    this.moveEnemyManager();
    this.updateHealthBar();
  }

  createAnimations() {
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("walk", {
        start: 0,
        end: 19,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "shoot",
      frames: this.anims.generateFrameNumbers("shoot"),
      frameRate: 20,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "zombieWalk",
      frames: this.anims.generateFrameNumbers("zombie"),
      frameRate: 20,
      repeat: -1,
    });
  }

  handleSound() {
    this.sound.play("theme", {
      volume: 0.1,
      loop: true,
    });
  }

  createControls() {
    // create cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create WASD keys
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  setWorldBounds() {
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width,
      this.game.config.height
    );
  }

  createGroups() {
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.spawnEnemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.createEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  createColliders() {
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
  }

  setEvents() {
    this.input.on("pointerdown", (pointer) => {
      this.fireBullet(pointer);
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
    });
  }

  createPlayer() {
    this.player = this.physics.add
      .sprite(this.game.config.width / 2, this.game.config.height / 2, "player")
      .setScale(0.25);
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

  fireBullet(pointer) {
    const BULLET_SPEED = 500;
    const GUN_LENGTH = 40;

    // Calculate the position of the gun tip
    let gunTip = new Phaser.Math.Vector2();
    gunTip.setToPolar(this.player.rotation, GUN_LENGTH);

    let bullet = this.physics.add
      .sprite(this.player.x + gunTip.x, this.player.y + gunTip.y, "bullet")
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
    this.physics.velocityFromRotation(
      angle,
      BULLET_SPEED,
      bullet.body.velocity
    );

    this.sound.play("gunShot", {
      volume: 0.7,
    });

    this.player.anims.play("shoot", true);
  }

  movePlayerManager() {
    let velocity = new Phaser.Math.Vector2();

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocity.x = -1;
      this.player.anims.play("walk", true);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocity.x = 1;
      this.player.anims.play("walk", true);
    } else {
      velocity.x = 0;
      this.player.anims.play("idle", true);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocity.y = -1;
      this.player.anims.play("walk", true);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocity.y = 1;
      this.player.anims.play("walk", true);
    } else {
      velocity.y = 0;
      this.player.anims.play("idle", true);
    }

    velocity.normalize();
    velocity.scale(200);

    this.player.setVelocity(velocity.x, velocity.y);

    // Calculate the angle between the player and the pointer
    let pointer = this.input.activePointer;
    let angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // Set the player's rotation to this angle
    this.player.rotation = angle;
  }

  createEnemy() {
    const MAX_ENEMIES = 10;

    if (this.enemies.getChildren().length >= MAX_ENEMIES) return;

    let x = Phaser.Math.Between(0, 800);
    let y = Phaser.Math.Between(0, 600);

    // check that the enemy is not spawned on the player, if so, move it
    while (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        new Phaser.Geom.Rectangle(x, y, 50, 50)
      )
    ) {
      x = Phaser.Math.Between(0, 800);
      y = Phaser.Math.Between(0, 600);
    }

    let enemy = this.physics.add.sprite(x, y, "zombie").setScale(0.25);
    enemy.hit = false;

    this.enemies.add(enemy);

    enemy.anims.play("zombieWalk", true);
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

      if (player.health === 0) {
        this.handleGameOver();
      }

      enemy.hit = true;
      enemy.setTint(0xff0000);

      this.sound.play("zombieAttack", {
        volume: 0.2,
      });

      this.time.delayedCall(1000, () => {
        enemy.hit = false;
        enemy.clearTint();
      });

      this.cameras.main.shake(100, 0.01);
    }
  }

  bulletHit(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();

    this.sound.play("zombieDeath", {
      volume: 0.2,
    });

    this.score += 10;
    this.updateScore();
  }

  setupScore() {
    this.score = 0;
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  handleGameOver() {
    this.physics.pause();

    this.spawnEnemyTimer.remove();

    // destroy all enemies and bullets
    this.enemies.getChildren().forEach((enemy) => {
      enemy.destroy();
    });

    this.bullets.getChildren().forEach((bullet) => {
      bullet.destroy();
    });

    this.sound.stopAll();

    this.scene.start("GameOverScene", { score: this.score });
  }
}

export default GameScene;
