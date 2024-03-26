import idleAnimation from "./images/animations/idle.png";
import shootAnimation from "./images/animations/shoot.png";
import walkAnimation from "./images/animations/walk.png";
import zombieWalkAnimation from "./images/animations/zombie-walk.png";
import bullet from "./images/bullet.png";
import backgroundImage from "./images/grass.png";
import healthPotion from "./images/health potion.png";
import gunShotSound from "./sounds/gun-shot.mp3";
import themeMusic from "./sounds/terror-ambience.mp3";
import zombieAttackSound from "./sounds/Zombie-Attack.mp3";
import zombieDeathSound from "./sounds/zombie-death.mp3";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("healthPotion", healthPotion);
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
    this.initializeGameModifiers();
    this.createPlayer();
    this.createControls();
    this.setWorldBounds();
    this.createGroups();
    this.createOverlaps();
    this.createHealthBar();
    this.setEvents();
    this.setupScore();
    this.handleSound();
    this.createAnimations();
  }

  initializeGameModifiers() {
    this.score = 0;
    this.enemySpawnThreshold = 1000;
    this.powerupSpawnThreshold = 15000;

    this._enemiesKilled = 0;

    this.MAX_ENEMIES_PER_SPAWN = 10;
  }

  get enemiesKilled() {
    return this._enemiesKilled;
  }

  set enemiesKilled(value) {
    this._enemiesKilled = value;
    this.enemySpawnThreshold = Math.max(1000 - this._enemiesKilled * 50, 500);
    this.powerupSpawnThreshold = Math.max(
      15000 - this._enemiesKilled * 100,
      5000
    );
    this.MAX_ENEMIES_PER_SPAWN = Math.min(
      10 + Math.floor(this._enemiesKilled / 5),
      20
    );
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
    this.powerups = this.physics.add.group();

    this.spawnEnemyTimer = this.time.addEvent({
      delay: this.enemySpawnThreshold,
      callback: this.createEnemy,
      callbackScope: this,
      loop: true,
    });

    this.spawnPowerupTimer = this.time.addEvent({
      delay: this.powerupSpawnThreshold,
      callback: this.createPowerup,
      callbackScope: this,
      loop: true,
    });
  }

  createOverlaps() {
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.powerups,
      this.playerPowerup,
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
    const BULLET_SPEED = 600;
    const GUN_LENGTH = 40;

    // Calculate the position of the gun tip
    let gunTip = new Phaser.Math.Vector2();
    gunTip.setToPolar(this.player.rotation, GUN_LENGTH);

    let bullet = this.physics.add
      .sprite(this.player.x + gunTip.x, this.player.y + gunTip.y, "bullet")
      .setScale(0.5)
      .setCircle(20, 50, 40);

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

    // rotate the bullet to face the direction it's moving
    bullet.rotation = angle;

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
    if (this.enemies.getChildren().length >= this.MAX_ENEMIES_PER_SPAWN) return;

    // Determine which quadrant the player is in
    const playerQuadrant = {
      x: Math.floor(this.player.x / (this.game.config.width / 2)),
      y: Math.floor(this.player.y / (this.game.config.height / 2)),
    };

    // Get a random quadrant that is not the player's quadrant
    let spawnQuadrant;
    do {
      spawnQuadrant = {
        x: Phaser.Math.Between(0, 1),
        y: Phaser.Math.Between(0, 1),
      };
    } while (
      spawnQuadrant.x === playerQuadrant.x &&
      spawnQuadrant.y === playerQuadrant.y
    );

    // Calculate the spawn position within the chosen quadrant
    let distance;
    const minDistance = 400;
    let x, y;
    do {
      x = Phaser.Math.Between(
        spawnQuadrant.x * (this.game.config.width / 2),
        (spawnQuadrant.x + 1) * (this.game.config.width / 2)
      );
      y = Phaser.Math.Between(
        spawnQuadrant.y * (this.game.config.height / 2),
        (spawnQuadrant.y + 1) * (this.game.config.height / 2)
      );
      distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        x,
        y
      );
    } while (distance < minDistance);

    const enemy = this.physics.add
      .sprite(x, y, "zombie")
      .setScale(0.25)
      .setCircle(90, 60, 60);

    enemy.hit = false;

    this.enemies.add(enemy);

    enemy.anims.play("zombieWalk", true);
  }

  moveEnemyManager() {
    const stopDistance = 60;

    this.enemies.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      if (distance < stopDistance) {
        enemy.setVelocity(0, 0);
        return;
      }

      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // Set the enemy's rotation to face the player
      enemy.rotation = angle;

      this.physics.velocityFromRotation(angle, 100, enemy.body.velocity);
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

    this.enemiesKilled++;

    this.score += 10;
    this.updateScore();
  }

  setupScore() {
    this.scoreText = this.add.text(10, 10, `Score: ${this.score} `, {
      fontSize: "32px",
      fill: "#fff",
      fontFamily: "Arial",
      stroke: "#000",
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000",
        blur: 5,
        stroke: true,
        fill: true,
      },
    });
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  handleGameOver() {
    this.physics.pause();

    this.spawnEnemyTimer.remove();
    this.spawnPowerupTimer.remove();

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

  createPowerup() {
    const maxPowerups = 3;

    if (this.powerups.getChildren().length >= maxPowerups) return;

    let x = Phaser.Math.Between(0, this.game.config.width);
    let y = Phaser.Math.Between(0, this.game.config.height);

    while (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        new Phaser.Geom.Rectangle(x, y, 50, 50)
      )
    ) {
      x = Phaser.Math.Between(0, this.game.config.width);
      y = Phaser.Math.Between(0, this.game.config.height);
    }

    // for now we'll just spawn a health potion
    const powerup = this.physics.add
      .sprite(x, y, "healthPotion")
      .setScale(0.05);

    this.powerups.add(powerup);
  }

  playerPowerup(player, powerup) {
    powerup.destroy();

    // check powerup type
    switch (powerup.texture.key) {
      case "healthPotion":
        player.health = Math.min(player.health + 20, 100);
        break;
    }
  }
}

export default GameScene;
