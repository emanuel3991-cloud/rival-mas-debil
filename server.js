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
const CADENA = [0, 20, 50, 100, 200, 300, 450, 600, 800, 1000];

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
// Preguntas rápidas para la final de El Rival Más Débil
const FINAL = [
  { q: '¿Cuántos estados tiene México, sin contar la CDMX?', a: '31' },
  { q: '¿Cuánto es 7 por 8?', a: '56' },
  { q: '¿Qué océano baña la costa oeste de México?', a: 'Pacífico' },
  { q: '¿Quién escribió Don Quijote?', a: 'Miguel de Cervantes' },
  { q: '¿Cuántos minutos hay en hora y media?', a: '90' },
  { q: '¿En qué país están las pirámides de Giza?', a: 'Egipto' },
  { q: '¿Qué instrumento mide la temperatura?', a: 'Termómetro' },
  { q: '¿En qué estado está Cancún?', a: 'Quintana Roo' },
  { q: '¿Cuántos jugadores tiene un equipo de futbol en la cancha?', a: '11' },
  { q: '¿Cuál es la capital de Jalisco?', a: 'Guadalajara' },
  { q: '¿Qué metal es líquido a temperatura ambiente?', a: 'Mercurio' },
  { q: '¿Quién escribió "Cien años de soledad"?', a: 'Gabriel García Márquez' },
  { q: '¿Qué número es la C en números romanos?', a: '100' },
  { q: '¿Qué órgano bombea la sangre?', a: 'El corazón' },
  { q: '¿Qué color sale al mezclar azul y amarillo?', a: 'Verde' },
  { q: '¿Cuántas patas tiene una araña?', a: '8' },
  { q: '¿Qué inventó Alexander Graham Bell?', a: 'El teléfono' },
  { q: '¿Cuál es la moneda de Japón?', a: 'Yen' },
  { q: '¿Cuál es la raíz cuadrada de 81?', a: '9' },
  { q: '¿Cuál es el país más grande del mundo?', a: 'Rusia' },
  { q: '¿Cuál es la capital de Nuevo León?', a: 'Monterrey' },
  { q: '¿Cuántos centímetros tiene un metro?', a: '100' },
  { q: '¿Quién fue el primer hombre en pisar la Luna?', a: 'Neil Armstrong' },
  { q: '¿En qué continente está Kenia?', a: 'África' },
  { q: '¿Cuántos colores tiene el arcoíris?', a: '7' },
  { q: '¿A quién llaman "Benemérito de las Américas"?', a: 'Benito Juárez' },
  { q: '¿Cuál es el animal terrestre más rápido?', a: 'Guepardo' },
  { q: '¿Cuál es la capital de Argentina?', a: 'Buenos Aires' },
  { q: '¿Cuántas horas tiene una semana?', a: '168' },
  { q: '¿Quién propuso la teoría de la relatividad?', a: 'Albert Einstein' },
  { q: '¿En qué país está la Torre Eiffel?', a: 'Francia' },
  { q: '¿Cuál es la capital de Yucatán?', a: 'Mérida' },
  { q: '¿Cuánto es el 10% de 250?', a: '25' },
  { q: '¿Qué planeta es el planeta rojo?', a: 'Marte' },
  { q: '¿Qué país tiene forma de bota?', a: 'Italia' },
  { q: '¿Cuántos grados tiene un ángulo recto?', a: '90' },
  { q: '¿Cuál es la capital de Alemania?', a: 'Berlín' },
  { q: '¿Cuál es el desierto cálido más grande?', a: 'Sahara' },
  { q: '¿Quién pintó la Mona Lisa?', a: 'Leonardo da Vinci' },
  { q: '¿Cuántos años tiene un siglo?', a: '100' },
  { q: '¿Qué instrumento tiene 88 teclas?', a: 'Piano' },
  { q: '¿Cuántas cuerdas tiene una guitarra común?', a: '6' },
  { q: '¿Qué presidente expropió el petróleo en 1938?', a: 'Lázaro Cárdenas' },
  { q: '¿Cuál es la capital de Perú?', a: 'Lima' },
  { q: '¿Cuánto es 12 al cuadrado?', a: '144' },
  { q: '¿En qué año llegó Colón a América?', a: '1492' },
  { q: '¿Con qué fruta se hace el guacamole?', a: 'Aguacate' },
  { q: '¿La ballena es pez o mamífero?', a: 'Mamífero' },
  { q: '¿Cuántos ceros tiene un millón?', a: '6' },
  { q: '¿Cuál es el planeta más cercano al Sol?', a: 'Mercurio' },
  { q: '¿Cuál es la capital de Brasil?', a: 'Brasilia' },
  { q: '¿Cuál es la fórmula química del agua?', a: 'H2O' },
  { q: '¿En qué estado se celebra la Guelaguetza?', a: 'Oaxaca' },
  { q: '¿Cuántos jugadores tiene un equipo de basquetbol en la cancha?', a: '5' },
  { q: '¿Cuántos segundos tiene un minuto?', a: '60' },
  { q: '¿Cuál es el animal más grande del planeta?', a: 'La ballena azul' },
  { q: '¿Cuánto es 15 más 27?', a: '42' },
  { q: '¿Cuántas semanas tiene un año?', a: '52' },
  { q: '¿Qué deporte practica un "pitcher"?', a: 'Beisbol' },
  { q: '¿Qué río marca la frontera entre México y Estados Unidos?', a: 'Río Bravo' }
];

const nuevo = () => ({
  ronda: 1, qi: -1, fase: 'espera', turno: null, bloqueados: [],
  equipos: [
    { nombre: 'Equipo Rojo', color: '#ef4444', pts: 0, vivo: true },
    { nombre: 'Equipo Azul', color: '#3b82f6', pts: 0, vivo: true },
    { nombre: 'Equipo Amarillo', color: '#eab308', pts: 0, vivo: true },
    { nombre: 'Equipo Verde', color: '#22c55e', pts: 0, vivo: true }
  ],
  jug: {}, fin: null
});
let s = nuevo();
const lista = () => (s.ronda === 1 ? RONDA1 : RONDA2);

/* ---------- Final: El Rival Más Débil ---------- */
const tiempoRonda = n => Math.max(60, 120 - (n - 1) * 10) * 1000;
const qFinal = f => FINAL[f.qp % FINAL.length];
function ranking(f) {
  return f.vivos.map(id => ({ id, ...(f.stats[id] || { c: 0, w: 0, b: 0 }) }))
    .sort((a, b) => b.b - a.b || b.c - a.c || a.w - b.w);
}
function iniciarRondaFinal(f, inicia) {
  f.modo = 'ronda'; f.k = 0; f.banco = 0; f.corriendo = false; f.restante = tiempoRonda(f.n);
  f.stats = {}; f.vivos.forEach(id => { f.stats[id] = { c: 0, w: 0, b: 0 }; });
  f.cur = Math.max(0, f.vivos.indexOf(inicia)); f.votos = {}; f.eliminado = null;
}
function cerrarRondaFinal(f) {
  if (f.corriendo) { f.restante = 0; f.corriendo = false; }
  const mult = f.vivos.length === 2 ? 3 : 1;
  f.ultimoBanco = f.banco * mult; f.total += f.ultimoBanco;
  f.modo = f.vivos.length === 2 ? 'preduelo' : 'resumen';
}
function avanzar(f) { f.prev = qFinal(f); f.qp++; }

setInterval(() => {
  const f = s.fin;
  if (f && f.modo === 'ronda' && f.corriendo && Date.now() >= f.finEn) { cerrarRondaFinal(f); avisar(); }
}, 500);

function publico() {
  const q = lista()[s.qi];
  const f = s.fin;
  let fin = null;
  if (f) {
    const conteo = {};
    Object.values(f.votos).forEach(c => { conteo[c] = (conteo[c] || 0) + 1; });
    fin = {
      modo: f.modo, n: f.n, k: f.k, cadena: CADENA, banco: f.banco, total: f.total,
      ultimoBanco: f.ultimoBanco, mult: f.vivos.length === 2 ? 3 : 1,
      restante: Math.max(0, f.corriendo ? f.finEn - Date.now() : f.restante), corriendo: f.corriendo,
      vivos: f.vivos, todos: f.todos, cur: f.vivos[f.cur],
      pregunta: (f.modo === 'ronda' || f.modo === 'duelo') ? qFinal(f).q : null,
      prev: f.prev, stats: ranking(f), conteo, votantes: Object.keys(f.votos).length,
      eliminado: f.eliminado, fuera: f.fuera, duelo: f.duelo, ganador: f.ganador
    };
  }
  return {
    ronda: s.ronda, fase: s.fase, qi: s.qi, total: lista().length,
    pregunta: q ? q.q : null,
    respuesta: q && s.fase === 'revelada' ? q.a : null,
    turno: s.turno, bloqueados: s.bloqueados, equipos: s.equipos,
    jugadores: Object.entries(s.jug).map(([id, j]) => ({ id, ...j })),
    fin
  };
}
function avisar() {
  io.emit('estado', publico());
  if (s.fin) io.to('host').emit('secreto', { a: qFinal(s.fin).a });
}

io.on('connection', sock => {
  sock.emit('estado', publico());

  sock.on('unirse', ({ id, nombre, eq }) => {
    if (!id || !nombre || !(eq >= 0 && eq < 4)) return;
    const n = String(nombre).trim().slice(0, 20);
    if (s.jug[id]) { s.jug[id].nombre = n; if (s.ronda === 1 && s.qi < 0) s.jug[id].eq = eq; }
    else s.jug[id] = { nombre: n, eq, pts: 0, fuera: s.ronda !== 1 || !!s.fin };
    avisar();
  });

  sock.on('presionar', ({ id }) => {
    const j = s.jug[id];
    if (s.fin || s.fase !== 'abierta' || !j || j.fuera) return;
    if (s.ronda === 1 && s.bloqueados.includes(j.eq)) return;
    if (s.ronda === 2 && s.bloqueados.includes(id)) return;
    s.fase = 'turno';
    s.turno = { id, eq: j.eq, nombre: j.nombre };
    avisar();
  });

  sock.on('votar', ({ id, cand }) => {
    const f = s.fin;
    if (!f || f.modo !== 'voto' || !s.jug[id] || !f.vivos.includes(cand) || cand === id) return;
    f.votos[id] = cand;
    avisar();
  });

  sock.on('host', ({ clave, acc }) => {
    if (clave !== CLAVE) return sock.emit('clave', false);
    sock.emit('clave', true);
    sock.join('host');
    const f = s.fin;

    if (!f) {
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
          Object.values(s.jug).filter(j => j.eq === i && !j.fuera)
            .sort((a, b) => b.pts - a.pts).slice(PASAN_POR_EQUIPO).forEach(j => { j.fuera = true; });
        });
        s.fase = 'final'; s.turno = null;
      }
      if (acc === 'iniciarFinal' && s.fase === 'final') {
        const ids = Object.keys(s.jug).filter(id => !s.jug[id].fuera);
        if (ids.length >= 2) {
          s.fin = { vivos: ids, todos: ids.slice(), n: 1, qp: 0, prev: null, total: 0, fuera: [], duelo: null, ganador: null, ultimoBanco: 0 };
          iniciarRondaFinal(s.fin, ids[0]);
          s.fase = 'rmd';
        }
      }
    } else {
      if (acc === 'fReloj' && f.modo === 'ronda') {
        if (f.corriendo) { f.restante = Math.max(0, f.finEn - Date.now()); f.corriendo = false; }
        else { f.finEn = Date.now() + f.restante; f.corriendo = true; }
      }
      if (acc === 'fOk' && f.modo === 'ronda' && f.corriendo) {
        f.stats[f.vivos[f.cur]].c++; f.k++;
        if (f.k >= CADENA.length - 1) {
          f.banco += CADENA[f.k]; f.stats[f.vivos[f.cur]].b += CADENA[f.k]; f.k = 0;
          avanzar(f); cerrarRondaFinal(f);
        } else { avanzar(f); f.cur = (f.cur + 1) % f.vivos.length; }
      }
      if (acc === 'fNo' && f.modo === 'ronda' && f.corriendo) {
        f.stats[f.vivos[f.cur]].w++; f.k = 0; avanzar(f); f.cur = (f.cur + 1) % f.vivos.length;
      }
      if (acc === 'fBanco' && f.modo === 'ronda' && f.corriendo && f.k > 0) {
        f.banco += CADENA[f.k]; f.stats[f.vivos[f.cur]].b += CADENA[f.k]; f.k = 0;
      }
      if (acc === 'fCambiar' && (f.modo === 'ronda' || f.modo === 'duelo')) f.qp++;
      if (acc === 'fTerminar' && f.modo === 'ronda') cerrarRondaFinal(f);
      if (acc === 'fAbrirVoto' && f.modo === 'resumen') { f.modo = 'voto'; f.votos = {}; }
      if (acc === 'fCerrarVoto' && f.modo === 'voto') {
        const conteo = {};
        Object.values(f.votos).forEach(c => { conteo[c] = (conteo[c] || 0) + 1; });
        const max = Math.max(0, ...f.vivos.map(id => conteo[id] || 0));
        const r = ranking(f);
        const empatados = r.filter(x => (conteo[x.id] || 0) === max);
        const sale = empatados[empatados.length - 1].id; // en empate sale el de peores números
        f.eliminado = sale; f.fuera.push(sale);
        f.vivos = f.vivos.filter(id => id !== sale);
        f.modo = 'eliminado';
      }
      if (acc === 'fSigRonda' && f.modo === 'eliminado') {
        const fuerte = ranking(f)[0];
        f.n++; iniciarRondaFinal(f, fuerte ? fuerte.id : f.vivos[0]);
      }
      if (acc === 'fDuelo' && f.modo === 'preduelo') {
        const r = ranking(f);
        f.duelo = { p: [r[0].id, r[1].id], res: [[], []], turno: 0 };
        f.modo = 'duelo';
      }
      if ((acc === 'fDok' || acc === 'fDno') && f.modo === 'duelo') {
        const d = f.duelo;
        d.res[d.turno].push(acc === 'fDok'); avanzar(f);
        const [a, b] = d.res, sa = a.filter(Boolean).length, sb = b.filter(Boolean).length;
        let gana = null;
        if (a.length <= 5 && b.length <= 5) {
          if (sa > sb + (5 - b.length)) gana = 0; else if (sb > sa + (5 - a.length)) gana = 1;
        }
        if (gana === null && a.length >= 5 && a.length === b.length && sa !== sb) gana = sa > sb ? 0 : 1;
        if (gana !== null) { f.ganador = d.p[gana]; f.modo = 'ganador'; }
        else d.turno = d.turno ? 0 : 1;
      }
    }
    if (acc === 'reiniciar') s = nuevo();
    avisar();
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Listo'));
