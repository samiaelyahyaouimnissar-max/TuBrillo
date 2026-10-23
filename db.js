const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'tubrillo.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    pais TEXT,
    direccion TEXT,
    ciudad TEXT,
    cp TEXT,
    pago TEXT,
    total REAL NOT NULL DEFAULT 0,
    items_json TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    asunto TEXT,
    mensaje TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

function crearPedido(cliente, items) {
  const total = (items || []).reduce((s, i) => s + Number(i.precio || 0), 0);
  const stmt = db.prepare(`
    INSERT INTO pedidos (nombre, email, telefono, pais, direccion, ciudad, cp, pago, total, items_json, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    cliente.nombre || '',
    cliente.email || '',
    cliente.telefono || '',
    cliente.pais || '',
    cliente.direccion || '',
    cliente.ciudad || '',
    cliente.cp || '',
    cliente.pago || 'tarjeta',
    total,
    JSON.stringify(items || []),
    'pendiente'
  );
  return { id: Number(result.lastInsertRowid), total };
}

function listarPedidos(limit = 50) {
  return db.prepare('SELECT * FROM pedidos ORDER BY id DESC LIMIT ?').all(limit).map((row) => ({
    ...row,
    items: JSON.parse(row.items_json || '[]')
  }));
}

function getPedido(id) {
  const row = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, items: JSON.parse(row.items_json || '[]') };
}

function crearContacto(data) {
  const stmt = db.prepare(`
    INSERT INTO contactos (nombre, email, asunto, mensaje)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.nombre || '',
    data.email || '',
    data.asunto || '',
    data.mensaje || ''
  );
  return { id: Number(result.lastInsertRowid) };
}

function listarContactos(limit = 50) {
  return db.prepare('SELECT * FROM contactos ORDER BY id DESC LIMIT ?').all(limit);
}

module.exports = {
  db,
  crearPedido,
  listarPedidos,
  getPedido,
  crearContacto,
  listarContactos
};
