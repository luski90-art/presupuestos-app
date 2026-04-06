// Variables globales
let conceptosPresupuesto = [];

// ========== VERIFICAR SESIÓN AL CARGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
});

function verificarSesion() {
    if (DB.isSessionActive()) {
        mostrarApp();
    } else {
        mostrarLogin();
    }
}

function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('cambiarPasswordScreen').style.display = 'none';
}

function mostrarApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('cambiarPasswordScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    cargarSelectClientes();
    cargarConceptos();
    cargarHistorialPresupuestos();
}

// ========== AUTENTICACIÓN ==========

function iniciarSesion(event) {
    event.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    
    if (DB.checkPassword(password)) {
        DB.createSession();
        document.getElementById('passwordInput').value = '';
        mostrarApp();
    } else {
        document.getElementById('loginError').textContent = '❌ Contraseña incorrecta';
        document.getElementById('passwordInput').value = '';
        setTimeout(() => {
            document.getElementById('loginError').textContent = '';
        }, 3000);
    }
}

function cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
        DB.destroySession();
        mostrarLogin();
        limpiarPresupuesto();
    }
}

function mostrarCambiarPassword() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('cambiarPasswordScreen').style.display = 'flex';
}

function cancelarCambioPassword() {
    document.getElementById('cambiarPasswordScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('changeError').textContent = '';
}

function cambiarPassword(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        document.getElementById('changeError').textContent = '❌ Las contraseñas no coinciden';
        return;
    }
    
    if (newPassword.length < 4) {
        document.getElementById('changeError').textContent = '❌ La contraseña debe tener al menos 4 caracteres';
        return;
    }
    
    if (DB.changePassword(oldPassword, newPassword)) {
        alert('✅ Contraseña cambiada correctamente');
        cancelarCambioPassword();
    } else {
        document.getElementById('changeError').textContent = '❌ Contraseña actual incorrecta';
    }
}

// ========== NAVEGACIÓN ==========

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(seccion).classList.add('active');
    event.target.closest('.nav-btn').classList.add('active');
    
    if (seccion === 'clientes') cargarClientes();
    if (seccion === 'precios') mostrarPrecios();
    if (seccion === 'presupuestos') {
        cargarSelectClientes();
        cargarConceptos();
        cargarHistorialPresupuestos();
    }
}

// ========== CLIENTES ==========

function cargarClientes() {
    const clientes = DB.getClientes();
    const container = document.getElementById('listaClientesMobile');
    
    if (clientes.length === 0) {
        container.innerHTML = '<p class="empty">No hay clientes registrados</p>';
        return;
    }
    
    container.innerHTML = clientes.map(c => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${c.nombre} ${c.apellidos}</div>
                    <div class="card-info">📞 ${c.telefono}</div>
                    ${c.email ? `<div class="card-info">✉️ ${c.email}</div>` : ''}
                    ${c.direccion ? `<div class="card-info">📍 ${c.direccion}</div>` : ''}
                </div>
            </div>
            <div class="card-actions">
                <button onclick="editarCliente(${c.id})" class="btn-edit">✏️ Editar</button>
                <button onclick="eliminarCliente(${c.id})" class="btn-danger">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function mostrarFormCliente() {
    document.getElementById('formCliente').style.display = 'block';
    limpiarFormCliente();
    window.scrollTo(0, 0);
}

function cancelarCliente() {
    document.getElementById('formCliente').style.display = 'none';
    limpiarFormCliente();
}

function limpiarFormCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteApellidos').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('clienteDireccion').value = '';
    document.getElementById('clienteNIF').value = '';
}

function guardarCliente() {
    const cliente = {
        id: document.getElementById('clienteId').value || null,
        nombre: document.getElementById('clienteNombre').value.trim(),
        apellidos: document.getElementById('clienteApellidos').value.trim(),
        telefono: document.getElementById('clienteTelefono').value.trim(),
        email: document.getElementById('clienteEmail').value.trim(),
        direccion: document.getElementById('clienteDireccion').value.trim(),
        nif: document.getElementById('clienteNIF').value.trim()
    };
    
    if (!cliente.nombre || !cliente.apellidos || !cliente.telefono) {
        alert('Por favor, completa los campos obligatorios (Nombre, Apellidos y Teléfono)');
        return;
    }
    
    if (cliente.id) cliente.id = parseInt(cliente.id);
    
    DB.saveCliente(cliente);
    cargarClientes();
    cargarSelectClientes();
    cancelarCliente();
    alert('✅ Cliente guardado correctamente');
}

function editarCliente(id) {
    const cliente = DB.getClientes().find(c => c.id === id);
    
    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('clienteNombre').value = cliente.nombre;
    document.getElementById('clienteApellidos').value = cliente.apellidos;
    document.getElementById('clienteTelefono').value = cliente.telefono;
    document.getElementById('clienteEmail').value = cliente.email || '';
    document.getElementById('clienteDireccion').value = cliente.direccion || '';
    document.getElementById('clienteNIF').value = cliente.nif || '';
    
    document.getElementById('formCliente').style.display = 'block';
    window.scrollTo(0, 0);
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        DB.deleteCliente(id);
        cargarClientes();
        cargarSelectClientes();
    }
}

// ========== PRECIOS ==========

function mostrarPrecios() {
    const categoria = document.getElementById('filtroCategoriaPrecios').value;
    const precios = 
