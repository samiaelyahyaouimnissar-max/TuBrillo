# TuBrillo – Joyas personalizadas

Web de joyas personalizadas con **base de datos SQLite** (pedidos + contactos).

## Qué incluye

- Catálogo, personalizador, carrito
- Checkout que **guarda pedidos** en la base de datos
- Formulario de contacto que **guarda mensajes**
- Panel admin: `/admin`
- Stripe opcional

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/test` | Health check |
| POST | `/api/pedidos` | Guardar pedido |
| GET | `/api/pedidos` | Listar pedidos |
| POST | `/api/contacto` | Guardar mensaje |
| GET | `/api/contactos` | Listar mensajes |
| POST | `/api/crear-pago` | Stripe (opcional) |

## Local

```bash
npm install
npm start
```

- Web: http://localhost:3000  
- Admin: http://localhost:3000/admin  

La base de datos se crea sola en `data/tubrillo.db`.

## Render

1. Push del repo
2. Web Service → Start Command: `npm start`
3. **Importante:** en el plan free el disco es efímero (se pierde al redeploy).  
   Para datos permanentes: añade un **Persistent Disk** montado en `/opt/render/project/src/data`  
   o usa PostgreSQL de Render.

### Variables opcionales

- `STRIPE_SECRET_KEY`
- `BASE_URL` = URL pública de Render
- `DB_PATH` = ruta del archivo SQLite (por defecto `data/tubrillo.db`)
