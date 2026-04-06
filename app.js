// Variables globales
let conceptosPresupuesto = [];

// Navegación entre secciones
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(seccion).classList.add('active');
    event.target.classList.add('active');
    
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
    const tbody = document.getElementById('listaClientes');
    
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay clientes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientes.map(c => `
        <tr>
            <td>${c.nombre} ${c.apellidos}</td>
            <td>${c.telefono}</td>
            <td>${c.email || '-'}</td>
            <td>${c.direccion || '-'}</td>
            <td>
                <button onclick="editarCliente(${c.id})" class="btn-edit">✏️ Editar</button>
                <button onclick="eliminarCliente(${c.id})" class="btn-danger">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function mostrarFormCliente() {
    document.getElementById('formCliente').style.display = 'block';
    limpiarFormCliente();
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
    cancelarCliente();
    alert('Cliente guardado correctamente');
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
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        DB.deleteCliente(id);
        cargarClientes();
    }
}

// ========== PRECIOS ==========

function mostrarPrecios() {
    const categoria = document.getElementById('filtroCategoriaPrecios').value;
    const precios = DB.getPrecios(categoria || null);
    const tbody = document.getElementById('listaPrecios');
    
    const categoriaTexto = {
        'averias': 'Averías',
        'piso': 'Piso Completo',
        'bano-cocina': 'Baño/Cocina'
    };
    
    tbody.innerHTML = precios.map(p => `
        <tr>
            <td>${p.concepto}</td>
            <td>${categoriaTexto[p.categoria]}</td>
            <td>
                <input type="number" 
                       value="${p.precio}" 
                       onchange="actualizarPrecio(${p.id}, this.value)"
                       style="width: 100px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                €
            </td>
            <td>-</td>
        </tr>
    `).join('');
}

function actualizarPrecio(id, nuevoPrecio) {
    DB.updatePrecio(id, parseFloat(nuevoPrecio));
    alert('Precio actualizado');
}

// ========== PRESUPUESTOS ==========

function cargarSelectClientes() {
    const clientes = DB.getClientes();
    const select = document.getElementById('clienteSelect');
    
    select.innerHTML = '<option value="">Seleccionar cliente...</option>' +
        clientes.map(c => `<option value="${c.id}">${c.nombre} ${c.apellidos}</option>`).join('');
}

function cargarConceptos() {
    const tipo = document.getElementById('tipoPresupuesto').value;
    const conceptos = DB.getPrecios(tipo);
    const select = document.getElementById('conceptoSelect');
    
    select.innerHTML = '<option value="">Seleccionar concepto...</option>' +
        conceptos.map(c => `<option value="${c.id}">${c.concepto} - ${c.precio}€</option>`).join('');
}

function agregarConcepto() {
    const conceptoId = parseInt(document.getElementById('conceptoSelect').value);
    const cantidad = parseInt(document.getElementById('cantidadInput').value);
    
    if (!conceptoId || !cantidad) {
        alert('Selecciona un concepto y una cantidad');
        return;
    }
    
    const precio = DB.getPrecios().find(p => p.id === conceptoId);
    
    conceptosPresupuesto.push({
        id: conceptoId,
        concepto: precio.concepto,
        cantidad: cantidad,
        precioUnitario: precio.precio,
        total: precio.precio * cantidad
    });
    
    actualizarTablaConceptos();
    calcularTotales();
    
    document.getElementById('cantidadInput').value = 1;
}

function actualizarTablaConceptos() {
    const tbody = document.getElementById('listaConceptos');
    
    if (conceptosPresupuesto.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay conceptos añadidos</td></tr>';
        return;
    }
    
    tbody.innerHTML = conceptosPresupuesto.map((c, index) => `
        <tr>
            <td>${c.concepto}</td>
            <td>${c.cantidad}</td>
            <td>${c.precioUnitario.toFixed(2)} €</td>
            <td>${c.total.toFixed(2)} €</td>
            <td>
                <button onclick="eliminarConcepto(${index})" class="btn-danger">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function eliminarConcepto(index) {
    conceptosPresupuesto.splice(index, 1);
    actualizarTablaConceptos();
    calcularTotales();
}

function calcularTotales() {
    const subtotal = conceptosPresupuesto.reduce((sum, c) => sum + c.total, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('iva').textContent = iva.toFixed(2) + ' €';
    document.getElementById('total').textContent = total.toFixed(2) + ' €';
}

function guardarPresupuesto() {
    const clienteId = parseInt(document.getElementById('clienteSelect').value);
    
    if (!clienteId) {
        alert('Selecciona un cliente');
        return;
    }
    
    if (conceptosPresupuesto.length === 0) {
        alert('Añade al menos un concepto');
        return;
    }
    
    const cliente = DB.getClientes().find(c => c.id === clienteId);
    const subtotal = conceptosPresupuesto.reduce((sum, c) => sum + c.total, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    const presupuesto = {
        tipo: document.getElementById('tipoPresupuesto').value,
        cliente: cliente,
        conceptos: [...conceptosPresupuesto],
        notas: document.getElementById('notasPresupuesto').value,
        subtotal: subtotal,
        iva: iva,
        total: total
    };
    
    DB.savePresupuesto(presupuesto);
    alert('Presupuesto guardado correctamente');
    limpiarPresupuesto();
    cargarHistorialPresupuestos();
}

function limpiarPresupuesto() {
    conceptosPresupuesto = [];
    actualizarTablaConceptos();
    calcularTotales();
    document.getElementById('clienteSelect').value = '';
    document.getElementById('notasPresupuesto').value = '';
    document.getElementById('cantidadInput').value = 1;
}

function cargarHistorialPresupuestos() {
    const presupuestos = DB.getPresupuestos();
    const tbody = document.getElementById('historialPresupuestos');
    
    if (presupuestos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay presupuestos guardados</td></tr>';
        return;
    }
    
    const tipoTexto = {
        'averias': 'Averías',
        'piso': 'Piso Completo',
        'bano-cocina': 'Baño/Cocina'
    };
    
    tbody.innerHTML = presupuestos.reverse().map(p => `
        <tr>
            <td>${p.fecha}</td>
            <td>${p.cliente.nombre} ${p.cliente.apellidos}</td>
            <td>${tipoTexto[p.tipo]}</td>
            <td>${p.total.toFixed(2)} €</td>
            <td>
                <button onclick="verPresupuesto(${p.id})" class="btn-edit">👁️ Ver</button>
                <button onclick="eliminarPresupuesto(${p.id})" class="btn-danger">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function verPresupuesto(id) {
    const presupuesto = DB.getPresupuestos().find(p => p.id === id);
    generarPDFGuardado(presupuesto);
}

function eliminarPresupuesto(id) {
    if (confirm('¿Eliminar este presupuesto?')) {
        DB.deletePresupuesto(id);
        cargarHistorialPresupuestos();
    }
}

// ========== GENERAR PDF ==========

function generarPDF() {
    const clienteId = parseInt(document.getElementById('clienteSelect').value);
    
    if (!clienteId || conceptosPresupuesto.length === 0) {
        alert('Completa el presupuesto antes de generar el PDF');
        return;
    }
    
    const cliente = DB.getClientes().find(c => c.id === clienteId);
    const tipo = document.getElementById('tipoPresupuesto').value;
    const notas = document.getElementById('notasPresupuesto').value;
    const subtotal = conceptosPresupuesto.reduce((sum, c) => sum + c.total, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    generarPDFHTML(cliente, tipo, conceptosPresupuesto, notas, subtotal, iva, total);
}

function generarPDFGuardado(presupuesto) {
    generarPDFHTML(
        presupuesto.cliente,
        presupuesto.tipo,
        presupuesto.conceptos,
        presupuesto.notas,
        presupuesto.subtotal,
        presupuesto.iva,
        presupuesto.total
    );
}

function generarPDFHTML(cliente, tipo, conceptos, notas, subtotal, iva, total) {
    const tipoTexto = {
        'averias': 'AVERÍAS',
        'piso': 'PISO COMPLETO',
        'bano-cocina': 'REFORMA BAÑO/COCINA'
    };
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Presupuesto</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
                .header h1 { color: #667eea; margin: 0; }
                .info { margin-bottom: 20px; }
                .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #667eea; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                .totales { margin-top: 20px; text-align: right; }
                .totales div { margin: 8px 0; font-size: 16px; }
                .total-final { font-size: 22px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px; }
                .notas { margin-top: 30px; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚡ PRESUPUESTO ELÉCTRICO</h1>
                <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            
            <div class="info">
                <h3>DATOS DEL CLIENTE</h3>
                <div class="info-row"><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellidos}</div>
                <div class="info-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
                ${cliente.email ? `<div class="info-row"><strong>Email:</strong> ${cliente.email}</div>` : ''}
                ${cliente.direccion ? `<div class="info-row"><strong>Dirección:</strong> ${cliente.direccion}</div>` : ''}
            </div>
            
            <h3>TIPO: ${tipoTexto[tipo]}</h3>
            
            <table>
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th style="text-align: center;">Cantidad</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${conceptos.map(c => `
                        <tr>
                            <td>${c.concepto}</td>
                            <td style="text-align: center;">${c.cantidad}</td>
                            <td style="text-align: right;">${c.precioUnitario.toFixed(2)} €</td>
                            <td style="text-align: right;">${c.total.toFixed(2)} €</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totales">
                <div>Subtotal: ${subtotal.toFixed(2)} €</div>
                <div>IVA (21%): ${iva.toFixed(2)} €</div>
                <div class="total-final">TOTAL: ${total.toFixed(2)} €</div>
            </div>
            
            ${notas ? `<div class="notas"><strong>Notas:</strong><br>${notas}</div>` : ''}
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}

// Inicializar al cargar la página
window.onload = function() {
    cargarSelectClientes();
    cargarConceptos();
    cargarHistorialPresupuestos();
};