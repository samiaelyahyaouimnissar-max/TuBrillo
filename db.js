const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'tubrillo.json');

function load() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { pedidos: [], contactos: [], nextPedidoId: 1, nextContactoId: 1 };
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return { pedidos: [], contactos: [], nextPedidoId: 1, nextContactoId: 1 };
  }
}

function save(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function crearPedido(cliente, items) {
  const data = load();
  const total = (items || []).reduce((s, i) => s + Number(i.precio || 0), 0);
  const pedido = {
    id: data.nextPedidoId++,
    nombre: cliente.nombre || '',
    email: cliente.email || '',
    telefono: cliente.telefono || '',
    pais: cliente.pais || '',
    direccion: cliente.direccion || '',
    ciudad: cliente.ciudad || '',
    cp: cliente.cp || '',
    pago: cliente.pago || 'tarjeta',
    total,
    items: items || [],
    estado: 'pendiente',
    creado_en: new Date().toISOString()
  };
  data.pedidos.unshift(pedido);
  save(data);
  return { id: pedido.id, total };
}

function listarPedidos(limit) {
  limit = limit || 50;
  return load().pedidos.slice(0, limit);
}

function getPedido(id) {
  return load().pedidos.find(function (p) { return p.id === Number(id); }) || null;
}

function crearContacto(input) {
  const data = load();
  const row = {
    id: data.nextContactoId++,
    nombre: input.nombre || '',
    email: input.email || '',
    asunto: input.asunto || '',
    mensaje: input.mensaje || '',
    creado_en: new Date().toISOString()
  };
  data.contactos.unshift(row);
  save(data);
  return { id: row.id };
}

function listarContactos(limit) {
  limit = limit || 50;
  return load().contactos.slice(0, limit);
}

module.exports = {
  crearPedido,
  listarPedidos,
  getPedido,
  crearContacto,
  listarContactos
};
