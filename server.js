const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const CLAVE = process.env.CLAVE || 'ases';
const PUNTOS = 100;

const PREGUNTAS = [
  { q: '¿Cuál es el planeta más grande del sistema solar?', a: 'Júpiter' },
  { q: '¿En qué año inició la Independencia de México?', a: '1810' },
  { q: '¿Cuál es la capital de Canadá?', a: 'Ottawa' },
  { q: '¿Cuántos lados tiene un hexágono?', a: '6' },
  { q: '¿Quién pintó "La noche estrellada"?', a: 'Vincent van Gogh' },
  { q: '¿Cuál es el símbolo químico del oro?', a: 'Au' },
  { q: '¿Cuál es el estado más grande de México?', a: 'Chihuahua' },
  { q: '¿Cuál es el hueso más largo del cuerpo humano?', a: 'El fémur' },
  { q: '¿Cuánto es 12 al cuadrado?', a: '144' },
  { q: '¿De qué planta se hace el tequila?', a: 'Agave azul' },
  { q: '¿Qué pintora mexicana es famosa por sus autorretratos?', a: 'Frida Kahlo' },
  { q: '¿Cuál es el océano más grande del mundo?', a: 'Pacífico' },
  { q: '¿Qué cultura construyó Chichén Itzá?', a: 'La maya' },
  { q: '¿Cuántos días tiene un año bisiesto?', a: '366' },
  { q: '¿Cuál es la montaña más alta de México?', a: 'Pico de Orizaba' }
];

const nuevo = () => ({
  equipos: [
    { nombre: 'Equipo Rojo', color: '#ef4444', pts: 0 },
    { nombre: 'Equipo Azul', color: '#3b82f6', pts: 0 },
    { nombre: 'Equipo Amarillo', color: '#eab308', pts: 0 },
    { nombre: 'Equipo Verde', color: '#22c55e', pts: 0 }
  ],
  jug: {}, qi: -1, fase: 'espera', turno: null, bloqueados: []
});
let s = nuevo();

function publico() {
  const q = PREGUNTAS[s.qi];
  return {
    equipos: s.equipos, fase: s.fase, qi: s.qi, total: PREGUNTAS.length,
    pregunta: q ? q.q : null,
    respuesta: q && s.fase === 'revelada' ? q.a : null,
    turno: s.turno, bloqueados: s.bloqueados,
    conteo: s.equipos.map((_, i) => Object.values(s.jug).filter(j => j.eq === i).length)
  };
}
const avisar = () => io.emit('estado', publico());

io.on('connection', sock => {
  sock.emit('estado', publico());

  sock.on('unirse', ({ id, nombre, eq }) => {
    if (!id || !nombre || !(eq >= 0 && eq < 4)) return;
    s.jug[id] = { nombre: String(nombre).trim().slice(0, 20), eq };
    avisar();
  });

  sock.on('presionar', ({ id }) => {
    const j = s.jug[id];
    if (s.fase !== 'abierta' || !j || s.bloqueados.includes(j.eq)) return;
    s.fase = 'turno';
    s.turno = { eq: j.eq, nombre: j.nombre };
    avisar();
  });

  sock.on('host', ({ clave, acc }) => {
    if (clave !== CLAVE) return sock.emit('clave', false);
    sock.emit('clave', true);
    if (acc === 'siguiente' && s.qi < PREGUNTAS.length - 1) {
      s.qi++; s.fase = 'abierta'; s.turno = null; s.bloqueados = [];
    }
    if (acc === 'correcta' && s.turno) {
      s.equipos[s.turno.eq].pts += PUNTOS; s.fase = 'revelada';
    }
    if (acc === 'incorrecta' && s.turno) {
      s.bloqueados.push(s.turno.eq); s.turno = null;
      s.fase = s.bloqueados.length >= 4 ? 'revelada' : 'abierta';
    }
    if (acc === 'revelar' && s.qi >= 0) { s.fase = 'revelada'; }
    if (acc === 'reiniciar') s = nuevo();
    avisar();
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Listo'));
