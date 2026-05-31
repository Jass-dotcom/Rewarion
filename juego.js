const { Game, AUTO } = Phaser;
var jugador;
var cursors;
var enemigosHoy = 0;
var enemigos; 
var attackKey;
var pocionKey;
var fuerzaKey;
var velocidadKey;

var isGrounded = true;
var ultimaDistanciaGenerada = 0;
var enAnimacion = false;


//       vida
var vidaJugador = 100; 
var vidaEnemigoBase = 40; 
var puedeAtacar = true;   
var puedeRecibirDaño = true; 
var jugadorMuerto = false;


// Phaser Graphics
var barraVidaContainer; 
const NUM_BLOQUES_VIDA = 10;
var bloquesVida = []; 

var danoJugador = 25; 
const COSTO_POCION_SALUD = 5; 
const CURACION_POCION_SALUD = 5; 
// === variables de pociones ===
const COSTO_POCION_FUERZA = 20; 
const COSTO_POCION_VELOCIDAD = 35; 
var timerFuerza = null;
var timerVelocidad = null;

const VELOCIDAD_BASE = 160;
const COOLDOWN_ATAQUE_BASE = 700; // en ms, el tiempo que dura el setTimeout en el ataque

var enemigosEliminados = 0;
var stamina = 4;
var staminaMax = 10;
var oro = 200;
let mensajeSinStamina;

// boss
var killsSinceLastBoss = 0;
const BOSS_KILL_THRESHOLD = 3; 
const VIDA_JEFE_BASE = 100;
const DANO_JEFE_BASE = 30; 

// textos
var textoEnemigos;
var textoMuerte; 
var teclaReiniciar;

//endless
var fondos = [];
var anchoFondo = 720; 
var suelo;

var config = {
    type: AUTO,
    width: 720,
    height: 480,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Game(config);


function preload() {

    
    // Fondos 
    this.load.image('campo', 'assets/campo.png');
    this.load.image('fondo1', 'assets/fondo.png');
    this.load.image('fondo2', 'assets/fondo2.png');
    this.load.image('fondo3', 'assets/fondo3.png');
    this.load.image('ground_noche', 'assets/ground_noche.png');

    // Sprites
    this.load.spritesheet('jugador', 'assets/spritesheet.png', { frameWidth: 144, frameHeight: 195 });
    this.load.spritesheet('morir', 'assets/spritesheet-morir.png', { frameWidth: 153, frameHeight: 330 });
    this.load.spritesheet('atacar', 'assets/spritesheet-atacar.png', { frameWidth: 288, frameHeight: 195 });
    
    this.load.spritesheet('enemigo', 'assets/enemigo-spritesheet.png', { frameWidth: 297, frameHeight: 349 });
    // this.load.spritesheet('enemigo_atacar', 'assets/enemigo-atacar-spritesheet.png', { frameWidth: 297, frameHeight: 349 });
}

function create() {
    enAnimacion = false;
    puedeAtacar = true;
    puedeRecibirDaño = true;
    isGrounded = true;

    this.anims.resumeAll();
    this.physics.resume();
    // Fondos endless
    fondos = [
        this.add.image(360, 240, 'campo').setScrollFactor(1, 0),
        this.add.image(1080, 240, 'fondo1').setScrollFactor(1, 0),
        this.add.image(1800, 240, 'fondo2').setScrollFactor(1, 0),
        this.add.image(2520, 240, 'fondo3').setScrollFactor(1, 0)
        
    ];

    fondos.forEach(fondo => {
    fondo.setOrigin(0.5, 0.5);
    fondo.setDisplaySize(anchoFondo + 1, 480); 
});


    // Suelo
    suelo = this.add.tileSprite(1620, 465, 3240, 64, 'ground_noche');
    this.physics.add.existing(suelo, true);


    // Mundo 
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 480);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 480);

    

    // Suelo
    // var plataformas = this.physics.add.staticGroup();
    // plataformas.create(3240, 465, 'ground_noche').setScale(3).refreshBody();

    enemigosHoy = 5; 
    vidaJugador = 100;

    // Jugador
    jugador = this.physics.add.sprite(100, 350, 'jugador');
    jugador.setName('jugador')
    jugador.setBounce(0.2);
    jugador.setCollideWorldBounds(true);
    jugador.setGravityY(450);
    this.physics.add.collider(jugador, suelo);



    jugador.body.setSize(144, 195, true);


    // Cámara
    const cam = this.cameras.main;
    cam.startFollow(jugador, true, 0.08, 0.08);
    cam.setZoom(1);

    // Grupo de enemigos
    enemigos = this.physics.add.group();

    // colisiones varias
    this.physics.add.collider(enemigos, suelo);
    this.physics.add.collider(jugador, enemigos, atacarJugador, null, this);

    // animaciones
    if (!this.anims.exists('atacar')) {
    this.anims.create({
        key: 'atacar',
        frames: this.anims.generateFrameNumbers('atacar', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
}

    if (!this.anims.exists('izquierda')) {
    this.anims.create({ key: 'izquierda', frames: this.anims.generateFrameNumbers('jugador', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
}

if (!this.anims.exists('centro')) {
    this.anims.create({ key: 'centro', frames: [{ key: 'jugador', frame: 4 }], frameRate: 20 });
}

if (!this.anims.exists('derecha')) {
    this.anims.create({ key: 'derecha', frames: this.anims.generateFrameNumbers('jugador', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });
}

if (!this.anims.exists('morir')) {
    this.anims.create({ key: 'morir', frames: this.anims.generateFrameNumbers('morir', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
}

if (!this.anims.exists('enemigo_caminar')) {
    this.anims.create({ key: 'enemigo_caminar', frames: this.anims.generateFrameNumbers('enemigo', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
}

    // Controles
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    pocionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    fuerzaKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    velocidadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // INICIO
    const BORDER_COLOR = 0x555555;
    const BLOCK_COLOR = 0xf3f5c8;
    const BLOCK_WIDTH = 18;
    const BLOCK_HEIGHT = 10;
    const SPACING = 5;
    const BAR_TOTAL_WIDTH = (BLOCK_WIDTH + SPACING) * NUM_BLOQUES_VIDA;
    const START_X = 720 - 16 - BAR_TOTAL_WIDTH; //anclaje a la derecha
    const START_Y = 20;

    barraVidaContainer = this.add.container(0, 0);

    for (let i = 0; i < NUM_BLOQUES_VIDA; i++) {
        const xPos = START_X + (i * (BLOCK_WIDTH + SPACING));
        let block = this.add.graphics({ fillStyle: { color: BLOCK_COLOR } });
        block.fillRect(xPos, START_Y, BLOCK_WIDTH, BLOCK_HEIGHT);
        block.lineStyle(1, BORDER_COLOR, 1);
        block.strokeRect(xPos, START_Y, BLOCK_WIDTH, BLOCK_HEIGHT);

        block.setScrollFactor(0);
        bloquesVida.push(block);
        barraVidaContainer.add(block);
    }bloquesVida.reverse(); 

    // FIN
//GAME OVER   
textoMuerte = this.add.text(360, 120, "💀 Has muerto 💀\nPresiona R para reiniciar", {
    fontSize: '28px',
    fill: '#ff0000',
    fontStyle: 'bold',
    align: 'center'
        });
            textoMuerte.setOrigin(0.5);
            textoMuerte.setScrollFactor(0);
            textoMuerte.setVisible(false);

mensajeSinStamina = this.add.text(360, 140, '', {
    fontSize: '28px',
    fill: '#ffcc00',
    fontStyle: 'bold',
    fontFamily: 'monospace',
    stroke: '#000000',
    strokeThickness: 4,
    align: 'center'
})
mensajeSinStamina.setScrollFactor(0)
mensajeSinStamina.setOrigin(0.5)
mensajeSinStamina.setDepth(999); 
mensajeSinStamina.setVisible(false);

    // texto de enemigos restantes
textoEnemigos = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3
});
textoEnemigos.setScrollFactor(0);
textoEnemigos.setDepth(999); 


    actualizarHUD();
    actualizarBarraVida();


// reloadd
teclaReiniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

}


function update() {
    if (!jugador.active) return; 

    // Movimiento del jugador (solo si no está atacando o muriendo)
    if (!enAnimacion) {
    const velocidadActual = timerVelocidad !== null ? VELOCIDAD_BASE * 1.5 : VELOCIDAD_BASE;
    if (cursors.left.isDown) {
        jugador.setVelocityX(velocidadActual * -1);
        jugador.anims.play('izquierda', true);
    } else if (cursors.right.isDown) {
        jugador.setVelocityX(velocidadActual);
        jugador.anims.play('derecha', true);
    } else {
        jugador.setVelocityX(0);
        jugador.anims.play('centro', true);
    }
}


    // Salto
    if (cursors.up.isDown && isGrounded) {
        jugador.setVelocityY(-350);
        isGrounded = false;
        setTimeout(() => (isGrounded = true), 1000);
    }

    // generar enemigos 
    if (jugador.x > ultimaDistanciaGenerada + 400 && enemigosHoy > 0) {
        ultimaDistanciaGenerada = jugador.x;
        if (killsSinceLastBoss >= BOSS_KILL_THRESHOLD) {
            generarEnemigo(this, jugador.x + 300, true); // true para Jefe
            killsSinceLastBoss = 0; 
        } else {
            generarEnemigo(this, jugador.x + 300); 
        }
    }

    // IA de enemigos
    if (jugador && jugador.active && !jugadorMuerto){
        enemigos.getChildren().forEach(enemigo => {
        if (!enemigo || enemigo.vida <= 0) return;
        const distancia = Phaser.Math.Distance.Between(jugador.x, jugador.y, enemigo.x, enemigo.y);

        if (distancia < 300 && distancia > 60) {
            if (jugador.x < enemigo.x) {
                enemigo.setVelocityX(-80);
                enemigo.flipX = true;
                enemigo.anims.play('enemigo_caminar', true);
            } else {
                enemigo.setVelocityX(80);
                enemigo.flipX = false;
                enemigo.anims.play('enemigo_caminar', true);
            }
        } else if (distancia <= 60) {
            enemigo.setVelocityX(0);
            atacarJugador(jugador, enemigo);
        } else {
            enemigo.setVelocityX(0);
        }
    });
    }
    

    
// aqui abajo vienen los JustDown
if (Phaser.Input.Keyboard.JustDown(attackKey)) {
    if (stamina >= 0.5 && puedeAtacar && jugador.active) {
        
        puedeAtacar = false;
        enAnimacion = true;
        jugador.setVelocityX(0);
        jugador.anims.play('atacar', true);
        let golpeoAlgo = false;
        enemigos.getChildren().forEach(enemigo => {
            if (!enemigo.active || enemigo.vida <= 0) return;
            const distancia = Phaser.Math.Distance.Between(jugador.x, jugador.y, enemigo.x, enemigo.y);

            if (distancia < 250 && Math.abs(jugador.y - enemigo.y) < 100) {
                golpeoAlgo = true;
                enemigo.vida -= danoJugador;
                enemigo.setTint(0xff0000);
                setTimeout(() => enemigo.clearTint(), 200);

                if (enemigo.vida <= 0) {
                    enemigo.disableBody(true, true);
                    enemigosEliminados++;
                    
                    if (enemigo.isBoss) {
                        oro += 50; // Oro extra por Jefe
                        // killsSinceLastBoss no se incrementa, se mantiene en 0 para el siguiente enemigo normal
                    } else {
                        killsSinceLastBoss++; // Suma 1 para el siguiente jefe
                    }

                    oro += 5;
                    actualizarHUD();
                }
            }
        });

        // gastar stamina jsjsa
        stamina -= 0.5;
        const cooldownActual = timerVelocidad !== null ? COOLDOWN_ATAQUE_BASE * 0.5 : COOLDOWN_ATAQUE_BASE; // 350ms o 700ms
        if (stamina < 0) stamina = 0;
        actualizarHUD();
        setTimeout(() => {
            jugador.anims.stop();
            enAnimacion = false;
            puedeAtacar = true;
        }, cooldownActual);
    } else if (stamina < 0.5) {
        mostrarMensajeSinStamina("Sin stamina\nJuega un minijuego para recuperarla");
        console.log("¡Mensaje de sin estamina ACTIVADO!");
    }
}
if (Phaser.Input.Keyboard.JustDown(pocionKey)) {
    usarPocionSalud();
}
if (Phaser.Input.Keyboard.JustDown(fuerzaKey)) {
    usarPocionFuerza();
}
if (Phaser.Input.Keyboard.JustDown(velocidadKey)) {
    usarPocionVelocidad();
}
//Fin
// ----------------------------------------------------------------------


fondos.forEach(fondo => {
    if (fondo.x + anchoFondo / 2 < jugador.x - anchoFondo) {
        let maxX = Math.max(...fondos.map(f => f.x));
        fondo.x = maxX + anchoFondo;
    }
});

// endless del suelo
suelo.tilePositionX = Math.floor(jugador.x * 0.5);


}

function actualizarBarraVida() {
    const bloquesVisibles = Math.ceil(vidaJugador / (100 / NUM_BLOQUES_VIDA));

    // array
    for (let i = 0; i < NUM_BLOQUES_VIDA; i++) {
        // Si el indice es menor que el numero de bloques visibles, el bloque se muestra.
        //si no, se oculta
        bloquesVida[i].setVisible(i < bloquesVisibles);
    }

}


// generar enemigos x2 
function generarEnemigo(scene, posX, isBoss = false) {
    var enemigo = enemigos.create(posX, 350, 'enemigo');
    enemigo.setCollideWorldBounds(true);
    enemigo.setBounce(0.1);
    enemigo.setGravityY(450);
    if (isBoss) {
        enemigo.vida = VIDA_JEFE_BASE; // 100 HP
        enemigo.isBoss = true;
        enemigo.damage = DANO_JEFE_BASE; // 30 Daño
        enemigo.setScale(1.5); 
        enemigo.setTint(0x800080); // Tinte morado para Jefe
        console.log("¡Jefe Generado!");
    } else {
        enemigo.vida = vidaEnemigoBase; // 40 HP
        enemigo.isBoss = false;
        enemigo.damage = 10; // 10 Daño (Regular)
        enemigo.setScale(1);
        enemigo.clearTint();
    }
    enemigo.morir = false;
}

// atacar ajugador
function atacarJugador(jugador, enemigo) {
    if (!puedeRecibirDaño || !jugador.active || enemigo.vida <= 0) return;

    puedeRecibirDaño = false;
    const danoRecibido = enemigo.damage || 10;
    vidaJugador -= danoRecibido;
    actualizarBarraVida();
    jugador.setTint(0xff0000);
    console.log("El enemigo golpeó al jugador. Vida restante: " + vidaJugador);

    // Knockback 25
    if (jugador.x < enemigo.x) {
        jugador.setVelocityX(-150);
    } else {
        jugador.setVelocityX(150);
    }

    setTimeout(() => jugador.clearTint(), 300);
    setTimeout(() => (puedeRecibirDaño = true), 1000);

// muerte del jugador

    if (vidaJugador <= 0) {
    jugadorMuerto = true;
    console.log("💀 El jugador ha muerto");
    enAnimacion = true;
    jugador.setVelocity(0, 0);
    jugador.anims.play('morir', true);

    enemigos.children.iterate(e => {
        e.setVelocity(0, 0);
        if (e.anims) e.anims.stop();
        e.body.enable = false;
        e.setVelocity(0);
    });

    // esperar fin de anim muerte  
    setTimeout(() => {
        jugador.disableBody(true, true);
        textoMuerte.setVisible(true);
        jugador.scene.physics.pause(); 

        jugador.scene.input.keyboard.removeAllListeners('keydown-R');
        jugador.scene.input.keyboard.once('keydown-R', () => {

            

            enAnimacion = false;
            puedeAtacar = true;
            puedeRecibirDaño = true;

            const escenaActual = jugador.scene;

            jugador.scene.scene.restart();

             escenaActual.events.once('create', () => {
        escenaActual.time.delayedCall(100, () => {
            const nuevoJugador = escenaActual.children.getByName('jugador');

            if (nuevoJugador) {
                jugadorMuerto = false;
                
                const flash = escenaActual.add.circle(
                    nuevoJugador.x,
                    nuevoJugador.y - 50,
                    100,
                    0x913595,
                    1
                ).setScrollFactor(0).setDepth(999);

                escenaActual.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => flash.destroy()
                });

                
                                }
                        });
                });
        });
    }, 1500);
}

// close atacarJugador function (was missing)
}


function actualizarHUD() {
    textoEnemigos.setText(
        `Enemigos eliminados: ${enemigosEliminados}\nOro: ${Math.floor(oro)}\nStamina: ${Math.floor(stamina)}`
    );
}

function mostrarMensajeSinStamina(texto) {
    if (!mensajeSinStamina) return;

    const escena = mensajeSinStamina.scene || game.scene.keys.default;
    if (!escena) return;

    mensajeSinStamina.setText(texto);
    
if (mensajeSinStamina.visible) {
    escena.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 600,
        yoyo: true,
        repeat: 2,
        onUpdate: tween => {
                const value = Math.floor(tween.getValue());
                mensajeSinStamina.setTint(Phaser.Display.Color.GetColor(255, value, value));
            },
            onComplete: () => mensajeSinStamina.clearTint()
        });
        return;
}

    mensajeSinStamina.setAlpha(1);
    mensajeSinStamina.setVisible(true);
    mensajeSinStamina.setScale(1.3);
    escena.tweens.add({
        targets: mensajeSinStamina,
        scale: 1,
        duration: 250,
        ease: 'Back.Out'
    });

    escena.tweens.add({
        targets: mensajeSinStamina,
        alpha: 0,
        duration: 2000,
        delay: 1000,
        ease: 'Power2',
        onComplete: () => mensajeSinStamina.setVisible(false)
    });
}

function usarPocionSalud() {
    if (oro >= COSTO_POCION_SALUD && vidaJugador < 100) {
        
        oro -= COSTO_POCION_SALUD;
        
        vidaJugador = Math.min(100, vidaJugador + CURACION_POCION_SALUD);
        jugador.scene.add.tween({
            targets: jugador,
            alpha: { from: 1, to: 0.5 },
            ease: 'Power1',
            duration: 150,
            repeat: 1, 
            yoyo: true,
            onComplete: () => jugador.setAlpha(1)
        });
        actualizarHUD();
        actualizarBarraVida();

        console.log(`Poción de Salud usada. Vida: ${vidaJugador}, Oro: ${oro}`);
    } else if (vidaJugador >= 100) {
        mostrarMensajeSinStamina("Vida al máximo.");
    } else {
        mostrarMensajeSinStamina(`Falta oro (Costo: ${COSTO_POCION_SALUD})`);
    }
}

function usarPocionFuerza() {
    // Verificar si tiene suficiente oro Y si el efecto NO está activo
    if (oro >= COSTO_POCION_FUERZA && timerFuerza === null) {
        
        // Gasto de oro
        oro -= COSTO_POCION_FUERZA;
        actualizarHUD();

        // Aplicar el efecto de fuerza (danoJugador = 50)
        danoJugador *= 2; 
        mostrarMensajeSinStamina("💥 ¡Poción de Fuerza Activa! 💥");
        jugador.setTint(0xffaa00); // Tinte naranja/dorado para el efecto

        // Establecer el temporizador
        timerFuerza = jugador.scene.time.delayedCall(10000, () => {
            danoJugador /= 2; // Restaurar el daño
            jugador.clearTint();
            mostrarMensajeSinStamina("Poción de Fuerza Terminada.");
            timerFuerza = null; // Liberar el slot del timer 160
            console.log("Efecto de Fuerza finalizado. Daño: " + danoJugador);
        }, [], jugador.scene);
        
        console.log(`Poción de Fuerza usada. Daño: ${danoJugador}, Oro: ${oro}`);

    } else if (timerFuerza !== null) {
        mostrarMensajeSinStamina("El efecto de Fuerza ya está activo.");
    } else {
        mostrarMensajeSinStamina(`Falta oro (Costo: ${COSTO_POCION_FUERZA})`);
    }
}

function usarPocionVelocidad() {
    // Verificar si tiene suficiente oro Y si el efecto NO está activo
    if (oro >= COSTO_POCION_VELOCIDAD && timerVelocidad === null) {
        
        // Gasto de oro
        oro -= COSTO_POCION_VELOCIDAD;
        actualizarHUD();

        // Aplicar el efecto visual y mensaje
        mostrarMensajeSinStamina("⚡ ¡Poción de Velocidad Activa! ⚡");
        jugador.setTint(0x00ff00); // Tinte verde para el efecto

        // Establecer la nueva velocidad de movimiento (50% más rápido)
        // Ojo: En update(), ya no usaremos 160, sino una variable de velocidad si quieres que afecte al jugador al moverse.
        
        // Establecer el temporizador
        timerVelocidad = jugador.scene.time.delayedCall(15000, () => {
            jugador.clearTint();
            mostrarMensajeSinStamina("Poción de Velocidad Terminada.");
            timerVelocidad = null; // Liberar el slot del timer
            console.log("Efecto de Velocidad finalizado.");
            
            // 🚨 Reestablecer velocidad y cooldown de ataque (esto se hará en update/ataque)
            // (La restauración de estos valores la haremos en la Tarea 3)

        }, [], jugador.scene);
        
        console.log(`Poción de Velocidad usada. Oro: ${oro}`);

    } else if (timerVelocidad !== null) {
        mostrarMensajeSinStamina("El efecto de Velocidad ya está activo.");
    } else {
        mostrarMensajeSinStamina(`Falta oro (Costo: ${COSTO_POCION_VELOCIDAD})`);
    }
}