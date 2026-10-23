const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {
  crearPedido,
  listarPedidos,
  getPedido,
  crearContacto,
  listarContactos
} = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe opcional
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.warn('Stripe no disponible:', e.message);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname)));

// ---------- API ----------

app.get('/api/test', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Backend de TuBrillo funcionando correctamente',
    db: true
  });
});

// Guardar pedido (checkout)
app.post('/api/pedidos', (req, res) => {
  try {
    const { cliente, items } = req.body;

    if (!cliente || !cliente.nombre || !cliente.email) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan nombre o email' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío' });
    }

    const pedido = crearPedido(cliente, items);
    console.log(`Pedido #${pedido.id} guardado · ${cliente.email} · ${pedido.total}€`);

    res.json({
      ok: true,
      mensaje: 'Pedido guardado correctamente',
      pedidoId: pedido.id,
      total: pedido.total
    });
  } catch (error) {
    console.error('Error al guardar pedido:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el pedido' });
  }
});

// Listar pedidos (admin simple)
app.get('/api/pedidos', (req, res) => {
  try {
    const pedidos = listarPedidos(100);
    res.json({ ok: true, pedidos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al listar pedidos' });
  }
});

app.get('/api/pedidos/:id', (req, res) => {
  try {
    const pedido = getPedido(Number(req.params.id));
    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }
    res.json({ ok: true, pedido });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error' });
  }
});

// Formulario de contacto
app.post('/api/contacto', (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, email y mensaje son obligatorios'
      });
    }

    const row = crearContacto({ nombre, email, asunto, mensaje });
    console.log(`Contacto #${row.id} de ${email}`);

    res.json({
      ok: true,
      mensaje: 'Mensaje recibido. Te responderemos pronto.',
      id: row.id
    });
  } catch (error) {
    console.error('Error contacto:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el mensaje' });
  }
});

app.get('/api/contactos', (req, res) => {
  try {
    const contactos = listarContactos(100);
    res.json({ ok: true, contactos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error' });
  }
});

// Stripe (opcional) — también guarda el pedido antes de redirigir
app.post('/api/crear-pago', async (req, res) => {
  try {
    const { cliente, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío' });
    }

    // Siempre guardar en la base de datos
    let pedidoId = null;
    if (cliente && cliente.nombre && cliente.email) {
      const pedido = crearPedido(cliente, items);
      pedidoId = pedido.id;
    }

    if (!stripe) {
      return res.json({
        ok: true,
        sinStripe: true,
        pedidoId,
        mensaje: 'Pedido guardado. Stripe no está configurado.'
      });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.tipo || 'Joya personalizada',
          description: [item.material, item.grosor].filter(Boolean).join(' · ')
        },
        unit_amount: Math.round(Number(item.precio) * 100)
      },
      quantity: 1
    }));

    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: cliente && cliente.email ? cliente.email : undefined,
      metadata: pedidoId ? { pedidoId: String(pedidoId) } : {},
      success_url: `${baseUrl}/index.html?pago=exitoso&pedido=${pedidoId || ''}`,
      cancel_url: `${baseUrl}/checkout.html?pago=cancelado`
    });

    res.json({ ok: true, url: session.url, pedidoId });
  } catch (error) {
    console.error('Error al crear el pago:', error);
    res.status(500).json({ ok: false, mensaje: 'No se ha podido crear el pago' });
  }
});

// Página admin sencilla
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor TuBrillo en puerto ${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
