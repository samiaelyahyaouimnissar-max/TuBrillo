// ===== MENÚ MÓVIL =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ===== CARRITO =====
let cart = JSON.parse(localStorage.getItem('tubrillo_cart')) || [];

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (countEl) countEl.textContent = cart.length;

    if (itemsEl) {
        if (cart.length === 0) {
            itemsEl.innerHTML = '<p style="color:#999; text-align:center;">Tu carrito está vacío</p>';
        } else {
            itemsEl.innerHTML = cart.map((item, i) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f3d1e0;">
                    <div>
                        <strong>${item.tipo}</strong><br>
                        <small>${item.material} · ${item.grosor}</small><br>
                        <small>${item.texto || 'Sin grabado'}</small>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#ff6b9d; font-weight:700;">${item.precio}€</div>
                        <button onclick="removeFromCart(${i})" style="background:none; border:none; color:#999; cursor:pointer; font-size:0.8rem;">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }
    }

    if (totalEl) {
        const total = cart.reduce((sum, item) => sum + item.precio, 0);
        totalEl.textContent = total + '€';
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('tubrillo_cart', JSON.stringify(cart));
    updateCartUI();
}

// Abrir / cerrar carrito
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');

if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });
}
if (closeCart) {
    closeCart.addEventListener('click', closeCartFn);
}
if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartFn);
}
function closeCartFn() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
}

// ===== CONFIGURADOR =====
const tipoJoya = document.getElementById('tipoJoya');
const material = document.getElementById('material');
const grosor = document.getElementById('grosor');
const piedra = document.getElementById('piedra');
const textoGrabado = document.getElementById('textoGrabado');
const usarArabe = document.getElementById('usarArabe');
const textoArabe = document.getElementById('textoArabe');
const arabeGroup = document.getElementById('arabeGroup');

function actualizarResumen() {
    if (!tipoJoya) return;

    document.getElementById('sumTipo').textContent = tipoJoya.options[tipoJoya.selectedIndex].text;
    document.getElementById('sumMaterial').textContent = material.options[material.selectedIndex].text;
    document.getElementById('sumGrosor').textContent = grosor.options[grosor.selectedIndex].text;
    document.getElementById('sumPiedra').textContent = piedra.options[piedra.selectedIndex].text;
    document.getElementById('sumTexto').textContent = textoGrabado.value || '—';

    if (usarArabe && usarArabe.checked) {
        document.getElementById('sumArabeLine').style.display = 'block';
        document.getElementById('sumArabe').textContent = textoArabe.value || '—';
    } else {
        document.getElementById('sumArabeLine').style.display = 'none';
    }

    // Precio estimado simple
    let precio = 49;
    if (material.value === 'oro' || material.value === 'rosa') precio += 40;
    if (piedra.value === 'diamante') precio += 80;
    if (piedra.value === 'zafiro') precio += 50;
    if (grosor.value === 'grueso') precio += 15;
    if (textoGrabado.value) precio += 10;

    document.getElementById('precioEstimado').textContent = precio + '€';
}

if (tipoJoya) {
    [tipoJoya, material, grosor, piedra, textoGrabado, textoArabe].forEach(el => {
        if (el) el.addEventListener('input', actualizarResumen);
        if (el) el.addEventListener('change', actualizarResumen);
    });
}

if (usarArabe) {
    usarArabe.addEventListener('change', () => {
        arabeGroup.style.display = usarArabe.checked ? 'block' : 'none';
        actualizarResumen();
    });
}

// Añadir al carrito
// ===== AÑADIR AL CARRITO =====

const addToCartBtn = document.getElementById('addToCartBtn');

if (addToCartBtn) {

    addToCartBtn.addEventListener('click', function () {

        // Comprobar que los elementos existen
        if (!tipoJoya || !material || !grosor || !piedra || !textoGrabado) {
            console.error('Faltan elementos del configurador.');
            alert('No se ha podido añadir el producto. Falta algún elemento del configurador.');
            return;
        }

        // Calcular precio
        let precio = 49;

        if (material.value === 'oro' || material.value === 'rosa') {
            precio += 40;
        }

        if (piedra.value === 'diamante') {
            precio += 80;
        }

        if (piedra.value === 'zafiro') {
            precio += 50;
        }

        if (grosor.value === 'grueso') {
            precio += 15;
        }

        if (textoGrabado.value.trim() !== '') {
            precio += 10;
        }

        // Crear producto
        const item = {
            tipo: tipoJoya.options[tipoJoya.selectedIndex].text,
            material: material.options[material.selectedIndex].text,
            grosor: grosor.options[grosor.selectedIndex].text,
            piedra: piedra.options[piedra.selectedIndex].text,
            texto: textoGrabado.value.trim(),
            arabe: usarArabe && usarArabe.checked
                ? textoArabe.value.trim()
                : null,
            precio: precio
        };

        // Añadir al carrito
        cart.push(item);

        // Guardar carrito
        localStorage.setItem('tubrillo_cart', JSON.stringify(cart));

        // Actualizar interfaz
        updateCartUI();

        // Mostrar mensaje
        alert('Producto añadido al carrito.');

        // Abrir carrito
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }

        if (cartOverlay) {
            cartOverlay.classList.add('open');
        }

        console.log('Producto añadido:', item);
        console.log('Carrito actual:', cart);
    });
}

// ===== CHECKOUT =====
const checkoutForm = document.getElementById('checkoutForm');

if (checkoutForm) {

    // Mostrar resumen del carrito
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    if (cart.length === 0) {
        if (orderItems) {
            orderItems.innerHTML = `
                <p style="color:#999; text-align:center;">
                    Tu carrito está vacío.
                </p>
            `;
        }

        if (orderTotal) {
            orderTotal.textContent = '0€';
        }
    } else {

        if (orderItems) {
            orderItems.innerHTML = cart.map(item => `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>${item.tipo} (${item.material})</span>
                    <span>${item.precio}€</span>
                </div>
            `).join('');
        }

        if (orderTotal) {
            const total = cart.reduce((sum, item) => sum + Number(item.precio), 0);
            orderTotal.textContent = total + '€';
        }
    }

    // Guardar pedido en la base de datos (+ Stripe si está configurado)
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        const formData = new FormData(checkoutForm);
        const cliente = Object.fromEntries(formData.entries());

        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando pedido...';
        }

        try {
            // 1) Guardar siempre en la base de datos
            const resPedido = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cliente, items: cart })
            });
            const dataPedido = await resPedido.json();

            if (!resPedido.ok || !dataPedido.ok) {
                throw new Error(dataPedido.mensaje || 'No se pudo guardar el pedido');
            }

            // 2) Intentar Stripe (si está configurado)
            let stripeUrl = null;
            try {
                const resPago = await fetch('/api/crear-pago', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cliente, items: cart })
                });
                const dataPago = await resPago.json();
                if (dataPago.ok && dataPago.url) {
                    stripeUrl = dataPago.url;
                }
            } catch (_) {
                // Stripe opcional
            }

            // Vaciar carrito
            cart = [];
            localStorage.setItem('tubrillo_cart', JSON.stringify(cart));
            updateCartUI();

            if (stripeUrl) {
                window.location.href = stripeUrl;
                return;
            }

            alert(
                '¡Pedido #' + dataPedido.pedidoId + ' guardado!\n' +
                'Total: ' + dataPedido.total + '€\n\n' +
                'Te contactaremos en ' + cliente.email
            );
            window.location.href = 'index.html?pago=exitoso&pedido=' + dataPedido.pedidoId;

        } catch (error) {
            console.error(error);
            alert('Error: ' + (error.message || 'No se pudo completar el pedido'));
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-lock"></i> Pagar ahora de forma segura';
            }
        }
    });
}

// Inicializar
updateCartUI();
if (typeof actualizarResumen === 'function') actualizarResumen();