// Base de datos en LocalStorage con autenticación
const DB = {
    // Contraseña por defecto (puedes cambiarla)
    PASSWORD_KEY: 'app_password',
    SESSION_KEY: 'app_session',
    
    // Inicializar base de datos
    init() {
        // Establecer contraseña por defecto si no existe
        if (!localStorage.getItem(this.PASSWORD_KEY)) {
            // Contraseña inicial: "1234"
            this.setPassword('1234');
        }
        
        if (!localStorage.getItem('clientes')) {
            localStorage.setItem('clientes', JSON.stringify([]));
        }
        if (!localStorage.getItem('precios')) {
            localStorage.setItem('precios', JSON.stringify(this.preciosIniciales()));
        }
        if (!localStorage.getItem('presupuestos')) {
            localStorage.setItem('presupuestos', JSON.stringify([]));
        }
    },

    // Gestión de contraseña
    setPassword(password) {
        // Encriptar contraseña (simple hash)
        const hash = btoa(password); // Base64 encoding
        localStorage.setItem(this.PASSWORD_KEY, hash);
    },

    checkPassword(password) {
        const storedHash = localStorage.getItem(this.PASSWORD_KEY);
        const inputHash = btoa(password);
        return storedHash === inputHash;
    },

    changePassword(oldPassword, newPassword) {
        if (this.checkPassword(oldPassword)) {
            this.setPassword(newPassword);
            return true;
        }
        return false;
    },

    // Gestión de sesión
    createSession() {
        const sessionToken = Date.now().toString();
        localStorage.setItem(this.SESSION_KEY, sessionToken);
        return sessionToken;
    },

    isSessionActive() {
        return localStorage.getItem(this.SESSION_KEY) !== null;
    },

    destroySession() {
        localStorage.removeItem(this.SESSION_KEY);
    },

    // Precios iniciales por categoría
    preciosIniciales() {
        return [
            // AVERÍAS
            { id: 1, concepto: 'Reparación avería eléctrica general', precio: 45, categoria: 'averias' },
            { id: 2, concepto: 'Sustitución magnetotérmico', precio: 35, categoria: 'averias' },
            { id: 3, concepto: 'Sustitución diferencial', precio: 55, categoria: 'averias' },
            { id: 4, concepto: 'Revisión cuadro eléctrico', precio: 40, categoria: 'averias' },
            { id: 5, concepto: 'Reparación cortocircuito', precio: 50, categoria: 'averias' },
            { id: 6, concepto: 'Sustitución caja de derivación', precio: 30, categoria: 'averias' },
            { id: 7, concepto: 'Reparación toma de corriente', precio: 25, categoria: 'averias' },
            { id: 8, concepto: 'Reparación punto de luz', precio: 28, categoria: 'averias' },

            // PISO COMPLETO
            { id: 9, concepto: 'Punto de luz sencillo', precio: 45, categoria: 'piso' },
            { id: 10, concepto: 'Punto de luz conmutado', precio: 55, categoria: 'piso' },
            { id: 11, concepto: 'Punto de luz conmutado de cruzamiento', precio: 65, categoria: 'piso' },
            { id: 12, concepto: 'Enchufe schuko 16A', precio: 30, categoria: 'piso' },
            { id: 13, concepto: 'Enchufe con toma de tierra', precio: 32, categoria: 'piso' },
            { id: 14, concepto: 'Interruptor simple', precio: 25, categoria: 'piso' },
            { id: 15, concepto: 'Conmutador', precio: 35, categoria: 'piso' },
            { id: 16, concepto: 'Conmutador de cruzamiento', precio: 45, categoria: 'piso' },
            { id: 17, concepto: 'Toma TV', precio: 35, categoria: 'piso' },
            { id: 18, concepto: 'Toma teléfono/datos RJ45', precio: 35, categoria: 'piso' },
            { id: 19, concepto: 'Timbre/portero automático', precio: 60, categoria: 'piso' },
            { id: 20, concepto: 'Cuadro eléctrico vivienda (8 módulos)', precio: 180, categoria: 'piso' },
            { id: 21, concepto: 'Cuadro eléctrico vivienda (12 módulos)', precio: 240, categoria: 'piso' },
            { id: 22, concepto: 'Cuadro eléctrico vivienda (18 módulos)', precio: 320, categoria: 'piso' },
            { id: 23, concepto: 'Línea de alimentación (por metro)', precio: 8, categoria: 'piso' },
            { id: 24, concepto: 'Canalización empotrada (por metro)', precio: 6, categoria: 'piso' },
            { id: 25, concepto: 'Caja de derivación', precio: 18, categoria: 'piso' },

            // BAÑO/COCINA
            { id: 26, concepto: 'Punto de luz baño', precio: 48, categoria: 'bano-cocina' },
            { id: 27, concepto: 'Enchufe baño (IP44)', precio: 38, categoria: 'bano-cocina' },
            { id: 28, concepto: 'Extractor baño conexión', precio: 45, categoria: 'bano-cocina' },
            { id: 29, concepto: 'Termo eléctrico conexión', precio: 55, categoria: 'bano-cocina' },
            { id: 30, concepto: 'Punto de luz cocina', precio: 45, categoria: 'bano-cocina' },
            { id: 31, concepto: 'Enchufe cocina 16A', precio: 32, categoria: 'bano-cocina' },
            { id: 32, concepto: 'Enchufe especial horno/vitro', precio: 65, categoria: 'bano-cocina' },
            { id: 33, concepto: 'Campana extractora conexión', precio: 40, categoria: 'bano-cocina' },
            { id: 34, concepto: 'Lavavajillas conexión', precio: 35, categoria: 'bano-cocina' },
            { id: 35, concepto: 'Línea independiente electrodomésticos', precio: 75, categoria: 'bano-cocina' }
        ];
    },

    // CLIENTES
    getClientes() {
        return JSON.parse(localStorage.getItem('clientes'));
    },

    saveCliente(cliente) {
        const clientes = this.getClientes();
        if (cliente.id) {
            const index = clientes.findIndex(c => c.id === cliente.id);
            clientes[index] = cliente;
        } else {
            cliente.id = Date.now();
            clientes.push(cliente);
        }
        localStorage.setItem('clientes', JSON.stringify(clientes));
    },

    deleteCliente(id) {
        let clientes = this.getClientes();
        clientes = clientes.filter(c => c.id !== id);
        localStorage.setItem('clientes', JSON.stringify(clientes));
    },

    // PRECIOS
    getPrecios(categoria = null) {
        const precios = JSON.parse(localStorage.getItem('precios'));
        if (categoria) {
            return precios.filter(p => p.categoria === categoria);
        }
        return precios;
    },

    updatePrecio(id, nuevoPrecio) {
        const precios = JSON.parse(localStorage.getItem('precios'));
        const index = precios.findIndex(p => p.id === id);
        if (index !== -1) {
            precios[index].precio = parseFloat(nuevoPrecio);
            localStorage.setItem('precios', JSON.stringify(precios));
        }
    },

    // PRESUPUESTOS
    getPresupuestos() {
        return JSON.parse(localStorage.getItem('presupuestos'));
    },

    savePresupuesto(presupuesto) {
        const presupuestos = this.getPresupuestos();
        presupuesto.id = Date.now();
        presupuesto.numero = presupuestos.length + 1;
        presupuesto.fecha = new Date().toLocaleDateString('es-ES');
        presupuestos.push(presupuesto);
        localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
        return presupuesto;
    },

    deletePresupuesto(id) {
        let presupuestos = this.getPresupuestos();
        presupuestos = presupuestos.filter(p => p.id !== id);
        localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    }
};

// Inicializar base de datos al cargar
DB.init();