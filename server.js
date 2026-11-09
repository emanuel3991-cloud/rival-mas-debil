const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const CLAVE = process.env.CLAVE || 'ases';
const TIEMPO = 15000; // 15 segundos por pregunta

const PREGUNTAS = [
  { q: '¿Cuál es el planeta más grande?', o: ['Marte', 'Júpiter', 'Saturno', 'Tierra'], c: 1 },
  { q: '¿En qué año inició la Independencia de México?', o: ['1810', '1821', '1910', '1776'], c: 0 },
  { q: '¿Cuál es la capital de Canadá?', o: ['Toronto', 'Montreal', 'Ottawa', 'Vancouver'], c: 2 },
  { q: '¿Cuántos lados tiene un hexágono?', o: ['5', '6', '7', '8'], c: 1 },
  { q: '¿Quién pintó "La noche estrellada"?', o: ['Picasso', 'Dalí', 'Monet', 'Van Gogh'], c: 3 },
  { q: '¿Cuál es el símbolo químico del oro?', o: ['Au', 'Ag', 'Or', 'Go'], c: 0 },
  { q: '¿Cuál es el estado más grande de México?', o: ['Sonora', 'Chihuahua', 'Coahuila', 'Durango'], c: 1 },
  { q: '¿Cuál es el hueso más largo del cuerpo?', o: ['Húmero', 'Tibia', 'Fémur', 'Radio'], c: 2 },
  { q: '¿Cuánto es 12 al cuadrado?', o: ['124', '144', '132', '164'], c: 1 },
  { q: '¿De qué planta se hace el tequila?', o: ['Maguey pulquero', 'Nopal', 'Caña', 'Agave azul'], c: 3 }
];

let s = nuevo();
function nuevo() {
  return { fase: 'espera', qi: -1, abierta: false, t0: 0, jug: {}, resp: {}, cand: [], votos: {}, fuera: [] };
}

function publico() {
  const q = PREGUNTAS[s.qi];
  return {
    fase: s.fase, qi: s.qi, total: PREGUNTAS.length, abierta: s.abierta,
    restante: s.abierta ? Math.max(0, TIEMPO - (Date.now() - s.t0)) : 0,
    pregunta: q ? { q: q.q, o: q.o } : null,
    correcta: q && !s.abierta ? q.c : null,
    respondieron: Object.keys(s.resp).length,
    jugadores: Object.entries(s.jug)
      .map(([id, j]) => ({ id, nombre: j.nombre, pts: j.pts }))
      .sort((a, b) => b.pts - a.pts),
    cand: s.cand.map(id => ({
      id, nombre: s.jug[id] ? s.jug[id].nombre : '?',
      votos: Object.values(s.votos).filter(v => v === id).length
    })),
    fuera: s.fuera.map(id => (s.jug[id] ? s.jug[id].nombre : '?'))
  };
}
const avisar = () => io.emit('estado', publico());

io.on('connection', sock => {
  sock.emit('estado', publico());

  sock.on('unirse', ({ id, nombre }) => {
    if (!id || !nombre) return;
    if (!s.jug[id]) s.jug[id] = { nombre: String(nombre).trim().slice(0, 20), pts: 0 };
    avisar();
  });

  sock.on('responder', ({ id, op }) => {
    if (!s.abierta || !s.jug[id] || s.resp[id] !== undefined) return;
    s.resp[id] = op;
    if (op === PREGUNTAS[s.qi].c) {
      const t = Date.now() - s.t0;
      s.jug[id].pts += Math.max(500, Math.round(1000 - (t / TIEMPO) * 500));
    }
    avisar();
  });

  sock.on('votar', ({ id, cand }) => {
    if (s.fase !== 'voto' || !s.cand.includes(cand)) return;
    s.votos[id] = cand;
    avisar();
  });

  sock.on('host', ({ clave, acc, n }) => {
    if (clave !== CLAVE) return sock.emit('clave', false);
    sock.emit('clave', true);
    if (acc === 'siguiente' && s.qi < PREGUNTAS.length - 1) {
      s.fase = 'preguntas'; s.qi++; s.abierta = true; s.resp = {}; s.t0 = Date.now();
      const esta = s.qi;
      setTimeout(() => { if (s.qi === esta && s.abierta) { s.abierta = false; avisar(); } }, TIEMPO);
    }
    if (acc === 'cerrar') s.abierta = false;
    if (acc === 'clasificar') {
      s.cand = publico().jugadores.slice(0, n || 15).map(j => j.id);
      s.fase = 'escenario'; s.fuera = [];
    }
    if (acc === 'abrirVoto') { s.fase = 'voto'; s.votos = {}; }
    if (acc === 'eliminar') {
      const lista = publico().cand.sort((a, b) => b.votos - a.votos);
      if (lista.length && lista[0].votos > 0) {
        s.cand = s.cand.filter(id => id !== lista[0].id);
        s.fuera.push(lista[0].id);
      }
      s.fase = 'escenario';
    }
    if (acc === 'reiniciar') s = nuevo();
    avisar();
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Listo'));
