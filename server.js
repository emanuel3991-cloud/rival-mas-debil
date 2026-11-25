const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const CLAVE = process.env.CLAVE || 'ases';
const PUNTOS = 100;
const PASAN_POR_EQUIPO = 5;

const RONDA1 = [
  { q: '¿Cuántos años cumple de aniversario Grupo Petro?', a: '35 años' },
  { q: '¿Cuál es el planeta más grande del sistema solar?', a: 'Júpiter' },
  { q: '¿Qué significa "ASAP" en un correo?', a: 'As Soon As Possible (lo antes posible)' },
  { q: '¿Qué área se encarga de realizar pagos a proveedores?', a: 'Egresos' },
  { q: '¿En qué año inició la Independencia de México?', a: '1810' },
  { q: '¿Qué significa "CC" al enviar un correo?', a: 'Con copia' },
  { q: '¿Quién es el coordinador de Contraloría y Fiscal?', a: 'Alberto Robledo' },
  { q: '¿Cuál es la capital de Canadá?', a: 'Ottawa' },
  { q: '¿Qué atajo de teclado sirve para copiar?', a: 'Ctrl + C' },
  { q: 'Menciona 3 requisitos que debe tener una factura', a: 'Forma de pago, RFC y método de pago' },
  { q: '¿Quién pintó "La noche estrellada"?', a: 'Vincent van Gogh' },
  { q: '¿Qué atajo de teclado sirve para deshacer?', a: 'Ctrl + Z' },
  { q: '¿Cuántos días antes del vencimiento se hace la cobranza preventiva?', a: '3 días antes de su vencimiento' },
  { q: '¿Cuál es el estado más grande de México?', a: 'Chihuahua' },
  { q: '¿Qué día se celebra el Día del Trabajo en México?', a: '1 de mayo' }
];
const RONDA2 = [
  { q: 'Menciona dos empresas de Grupo Petro', a: 'Flimsa, Operadora Valtoca o Gasopias (cualquiera de dos)' },
  { q: '¿Cuál es el hueso más largo del cuerpo humano?', a: 'El fémur' },
  { q: '¿Cuántas horas tiene una jornada laboral diurna máxima en México?', a: '8 horas' },
  { q: '¿Con cuántas estaciones cuenta Grupo Petro?', a: '28 estaciones' },
  { q: '¿De qué planta se hace el tequila?', a: 'Agave azul' },
  { q: '¿Qué significa "KPI"?', a: 'Indicador clave de desempeño' },
  { q: '¿Qué pintora mexicana es famosa por sus autorretratos?', a: 'Frida Kahlo' },
  { q: '¿Qué programa de Microsoft se usa para hojas de cálculo?', a: 'Excel' },
  { q: '¿Cuál es el océano más grande del mundo?', a: 'Pacífico' },
  { q: '¿Qué significa "RR. HH."?', a: 'Recursos Humanos' },
  { q: '¿Qué cultura construyó Chichén Itzá?', a: 'La maya' },
  { q: '¿Qué es el "home office"?', a: 'Trabajar desde casa' },
  { q: '¿Cómo se llama el pago extra de fin de año obligatorio en México?', a: 'Aguinaldo' },
  { q: '¿Cuál es la montaña más alta de México?', a: 'Pico de Orizaba' },
  { q: '¿Cuántos días de aguinaldo da la ley como mínimo en México?', a: '15 días' }
];

const nuevo = () => ({
  ronda: 1, qi: -1, fase: 'espera', turno: null, bloqueados: [],
  equipos: [
    { nombre: 'Equipo Rojo', color: '#ef4444', pts: 0, vivo: true },
    { nombre: 'Equipo Azul', color: '#3b82f6', pts: 0, vivo: true },
    { nombre: 'Equipo Amarillo', color: '#eab308', pts: 0, vivo: true },
    { nombre: 'Equipo Verde', color: '#22c55e', pts: 0, vivo: true }
  ],
  jug: {}
});
let s = nuevo();
const lista = () => (s.ronda === 1 ? RONDA1 : RONDA2);

function publico() {
  const q = lista()[s.qi];
  return {
    ronda: s.ronda, fase: s.fase, qi: s.qi, total: lista().length,
    pregunta: q ? q.q : null,
    respuesta: q && s.fase === 'revelada' ? q.a : null,
    turno: s.turno, bloqueados: s.bloqueados, equipos: s.equipos,
    jugadores: Object.entries(s.jug).map(([id, j]) => ({ id, ...j }))
  };
}
const avisar = () => io.emit('estado', publico());

io.on('connection', sock => {
  sock.emit('estado', publico());

  sock.on('unirse', ({ id, nombre, eq }) => {
    if (!id || !nombre || !(eq >= 0 && eq < 4)) return;
    if (s.jug[id]) { s.jug[id].nombre = String(nombre).trim().slice(0, 20); if (s.ronda === 1 && s.qi < 0) s.jug[id].eq = eq; }
    else s.jug[id] = { nombre: String(nombre).trim().slice(0, 20), eq, pts: 0, fuera: s.ronda !== 1 };
    avisar();
  });

  sock.on('presionar', ({ id }) => {
    const j = s.jug[id];
    if (s.fase !== 'abierta' || !j || j.fuera) return;
    if (s.ronda === 1 && s.bloqueados.includes(j.eq)) return;
    if (s.ronda === 2 && s.bloqueados.includes(id)) return;
    s.fase = 'turno';
    s.turno = { id, eq: j.eq, nombre: j.nombre };
    avisar();
  });

  sock.on('host', ({ clave, acc }) => {
    if (clave !== CLAVE) return sock.emit('clave', false);
    sock.emit('clave', true);

    if (acc === 'siguiente' && s.qi < lista().length - 1 && s.fase !== 'final') {
      s.qi++; s.fase = 'abierta'; s.turno = null; s.bloqueados = [];
    }
    if (acc === 'correcta' && s.turno) {
      if (s.ronda === 1) s.equipos[s.turno.eq].pts += PUNTOS;
      else if (s.jug[s.turno.id]) s.jug[s.turno.id].pts += PUNTOS;
      s.fase = 'revelada';
    }
    if (acc === 'incorrecta' && s.turno) {
      s.bloqueados.push(s.ronda === 1 ? s.turno.eq : s.turno.id);
      s.turno = null;
      s.fase = (s.ronda === 1 && s.bloqueados.length >= 4) ? 'revelada' : 'abierta';
    }
    if (acc === 'revelar' && s.qi >= 0) s.fase = 'revelada';

    if (acc === 'terminarRonda1' && s.ronda === 1) {
      const orden = s.equipos.map((e, i) => ({ i, pts: e.pts })).sort((a, b) => b.pts - a.pts);
      orden.slice(2).forEach(x => { s.equipos[x.i].vivo = false; });
      Object.values(s.jug).forEach(j => { if (!s.equipos[j.eq].vivo) j.fuera = true; j.pts = 0; });
      s.ronda = 2; s.qi = -1; s.fase = 'espera'; s.turno = null; s.bloqueados = [];
    }
    if (acc === 'terminarRonda2' && s.ronda === 2) {
      s.equipos.forEach((e, i) => {
        if (!e.vivo) return;
        const del = Object.values(s.jug).filter(j => j.eq === i && !j.fuera).sort((a, b) => b.pts - a.pts);
        del.slice(PASAN_POR_EQUIPO).forEach(j => { j.fuera = true; });
      });
      s.fase = 'final'; s.turno = null;
    }
    if (acc === 'reiniciar') s = nuevo();
    avisar();
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Listo'));
