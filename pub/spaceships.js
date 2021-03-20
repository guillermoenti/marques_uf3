const scene_w = 640;
const scene_h = 480;

let that;

let player_init_x = 64;

//Dos background para intercambiarlos
//y dar la sensación de movimiento
let bg1;
let bg2;

let player;
let enemies = [];
let bullets = [];

let up_key;
let down_key;
let space_key;

let score;
let points;

//Array de meteoritos, parecida a la de coches
//Cada uno tiene:
//name para referirse a cada uno
//img ruta de la imagen
//sizeX e Y para cambar el tamaño de la hitbox de las fisicas más adelante
let meteor_list = [
	{
		name: "meteorDL",
		img: "meteor_detailedLarge.png",
		sizeX: 36,
		sizeY: 36,
	},
	{
		name: "meteorSDL",
		img: "meteor_squareDetailedLarge.png",
		sizeX: 36,
		sizeY: 36,
	},
	{
		name: "meteorDS",
		img: "meteor_detailedSmall.png",
		sizeX: 24,
		sizeY: 24,
	},
	{
		name: "meteorSDS",
		img: "meteor_squareDetailedSmall.png",
		sizeX: 24,
		sizeY: 24,
	}
];

//Variable para hacer que solo se dispare una bala por pulsación
let before_up; 

let particle;

const BULLET_INIT_X = -1000;
const BULLET_INIT_Y = -1000;

const MAX_ENEMIES = 128;
const MAX_BULLETS = 3;

const SCREEN_MARGIN = 32;

function preload () {
	
	//Esto lo usaremos para los problemas con scope más adelante
	that = this;

	this.load.image("background", "stars.jpg");
	this.load.image("ship", "PNG/Spaceships/ship_L.png");
	meteor_list.forEach( meteor => this.load.image(meteor.name, "PNG/Spaceships/"+meteor.img));
	this.load.image("bullet", "PNG/Spaceships/star_small.png");
	this.load.image("explosion", "PNG/Particles/fire1.png");
}

function create () {

	points = 0;

	enemies = [];
	bullets = [];

	before_up = true;

	bg1 = this.add.image(scene_w/2, scene_h/2, "background");
	bg1.setScale(1.25);

	bg2 = this.add.image(scene_w/2 + 626, scene_h/2, "background");
	bg2.setScale(1.25);

	player = this.physics.add.image(player_init_x, scene_h/2, "ship");
	//Cambiamos el tamaño de la hitbox de la nave
	player.setSize(42, 32);
	player.setOffset(8, 16);
	player.setScale(1);
	//La rotamos para que mire hacia la derecha
	player.angle = 90;



	for (let i = 0; i < MAX_ENEMIES; i++){
		let x = Math.random()*scene_w*10 + scene_w/2;
		let y = Math.random()*scene_h;
		//Este random decide qué tipo de meteorito crea
		let rand_type = Math.floor(Math.random()*4);
		enemies.push(this.physics.add.image(x, y, meteor_list[rand_type].name));
		//Cambiamos el tamaño de la hitbox de cada meteorito
		//según lo que hemos decidido antes
		enemies[i].setSize(meteor_list[rand_type].sizeX, meteor_list[rand_type].sizeY);	

	}


	for (let i = 0; i < MAX_BULLETS; i++){
		bullets.push(this.physics.add.image(BULLET_INIT_X, BULLET_INIT_Y, "bullet"));
		bullets[i].setSize(10, 10);
		bullets[i].moving = false;
	}


	up_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
	down_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

	//Colisión de meteorito con player
	enemies.forEach(function(element){
		that.physics.add.overlap(player, element, function (p, m){
			that.scene.restart();
		}, null, that);
	});

	//Colisión de meteorito con bala
	enemies.forEach(function(element){
		that.physics.add.overlap(bullets, element, function (b, m){
			m.destroy();
			particle.emitParticleAt(element.x, element.y, 1);
			b.x = BULLET_INIT_X;
			b.y = BULLET_INIT_Y;
			b.moving = false;
			points++;
	}, null, that);
	});

	score = this.add.text(10,10, 'Meteoritos destruidos: 0', {
		font: 'bold 26px Arial',
		fill: '#ffffff'
	});

	particle = this.add.particles('explosion');
	particle.createEmitter({
		alpha: {start: 1, end: 0},
		scaleX: 1,
		scaleY: 1,
		speed: 20,
		acceleration: -300,
		angle: {min: 0, max: 360},
		rotate: {min: 0, max: 360 },
		lifespan: {min: 700, max: 1000 },
		blendMode: 'ADD',
		frequency: 110,
		maxParticles: 10,
		on: false
	});
}

function update () {

	if (up_key.isDown && player.y > 20){
		player.y--;
	}
	else if (down_key.isDown && player.y < scene_h - 20){
		player.y++;
	}

	if (space_key.isDown && before_up){
		let found = false;
		before_up = false;

		for (let i = 0; i < MAX_BULLETS && !found; i++){
			if (!bullets[i].moving){
				bullets[i].moving = true;
				bullets[i].x = player.x;
				bullets[i].y = player.y;

				found = true;
			}
		}
	}
	
	//Este simple if hace posible que solo se dispare una
	//sola bala por cada vez que se pulsa al espacio
	//(Mirar la condición if de arriba)
	if(space_key.isUp){
		before_up = true;
	}


	for (let i = 0; i < MAX_BULLETS; i++){
		if (bullets[i].moving){
			bullets[i].x++;

			if (bullets[i].x >= scene_w + SCREEN_MARGIN){
				bullets[i].x = BULLET_INIT_X;
				bullets[i].y = BULLET_INIT_Y;

				bullets[i].moving = false;
			}
		}
	}

	for (let i = 0; i < MAX_ENEMIES; i++){
		enemies[i].x--;
	}

	bg1.x--;
	bg2.x--;

	if (bg1.x <= -313 ){
		bg1.x = scene_w + 313;
	}
	if (bg2.x <= -313 ){
		bg2.x = scene_w + 313;
	}

score.setText('Meteoritos destruidos: ' + points);

}

const config = {
	type: Phaser.CANVAS,
	width: scene_w,
	height: scene_h,
	pixelArt: true,
	physics: {
		default: 'arcade',
		arcade: {
			debug:true,
//			gravity: { x: 10 }
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

let game = new Phaser.Game(config);


