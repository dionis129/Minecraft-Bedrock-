//--------------- 💻 🤖 I N D E X -------------

const mc = require('bedrock-protocol');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const HOST = 'dionis169.aternos.me';
const PORT = 30590; // Verifica tu puerto de Bedrock
const BOT_NAME = 'DionisBot';

let bot;
let isConnected = false;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  socket.emit('status', isConnected ? 'Conectado' : 'Desconectado');
});

server.listen(3000, () => {
  console.log('Página de estado corriendo en http://localhost:3000');
});

// Función para conectar el bot con reintento si el servidor está apagado
function connectBot() {
  console.log('Intentando conectar el bot...');
  bot = mc.createClient({
    host: HOST,
    port: PORT,
    username: BOT_NAME,
    version: '1.21.111'
  });

  bot.on('connect', () => {
    console.log('Bot conectado ✅');
    isConnected = true;
    io.emit('status', 'Conectado');
    antiafk();
  });

  bot.on('disconnect', () => {
    console.log('Bot desconectado, reconectando en 15s...');
    isConnected = false;
    io.emit('status', 'Desconectado');
    setTimeout(connectBot, 15000);
  });

  bot.on('error', (err) => {
    console.error('Error del bot:', err.message);
    // Si da timeout de RakNet, esperar 15s antes de reconectar
    if (err.message.includes('RakTimeout')) {
      console.log('Servidor apagado o no responde, reintentando en 15s...');
      setTimeout(connectBot, 15000);
    }
  });
}

// AntiAFK: enviar movimiento cada 10s
function antiafk() {
  setInterval(() => {
    if (bot && isConnected) {
      bot.queue('move', { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, onGround: true });
    }
  }, 10000);
}

// Conectar el bot por primera vez
connectBot();