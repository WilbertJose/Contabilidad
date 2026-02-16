// Catálogo de cuentas original
const cuentas = [
    { code: '1101', name: 'Efectivo y Equivalentes' },
    { code: '1103', name: 'Cuentas por Cobrar Clientes' },
    { code: '1104', name: 'IVA Crédito Fiscal (13%)' },
    { code: '1105', name: 'Inventarios' },
    { code: '1201', name: 'Propiedad, Planta y Equipo' },
    { code: '2101', name: 'Cuentas por Pagar Proveedores' },
    { code: '2102', name: 'IVA Débito Fiscal (13%)' },
    { code: '3101', name: 'Capital Social' },
    { code: '4101', name: 'Ventas' },
    { code: '4102', name: 'Rebajas y Devoluciones s/ Ventas' },
    { code: '5101', name: 'Compras' },
    { code: '5102', name: 'Gastos de Venta' }
];

let partidas = [];
let contadorPartidas = 1;

// Referencias del DOM.
const tbodyNuevaPartida = document.getElementById('filas-partida');
const btnAgregarFila = document.getElementById('btn-agregar-fila');
const btnGuardarPartida = document.getElementById('btn-guardar-partida');
const totalDebeSpan = document.getElementById('total-debe');
const totalHaberSpan = document.getElementById('total-haber');
const descripcionInput = document.getElementById('descripcion');
const listaPartidas = document.getElementById('lista-partidas');
const listaMayor = document.getElementById('lista-mayor');

// Generar select con las cuentas.
function generarOpcionesCuenta() {
    return cuentas.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
}

// Agregar nueva fila a la tabla de creación.
function agregarFila() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="cuenta-select">
                <option value="">Seleccione cuenta</option>
                ${generarOpcionesCuenta()}
            </select>
        </td>
        <td><input type="number" class="debe-input" min="0" step="0.01" placeholder="0.00"></td>
        <td><input type="number" class="haber-input" min="0" step="0.01" placeholder="0.00"></td>
        <td><button class="btn danger btn-eliminar">X</button></td>
    `;
    tbodyNuevaPartida.appendChild(tr);
}

// Calcular sumatorias de Debe y Haber.
function calcularTotales() {
    let totalDebe = 0;
    let totalHaber = 0;

    document.querySelectorAll('.debe-input').forEach(input => {
        totalDebe += parseFloat(input.value) || 0;
    });

    document.querySelectorAll('.haber-input').forEach(input => {
        totalHaber += parseFloat(input.value) || 0;
    });

    totalDebeSpan.textContent = totalDebe.toFixed(2);
    totalHaberSpan.textContent = totalHaber.toFixed(2);

    return { totalDebe, totalHaber };
}

// Delegación de eventos para las celdas dinámicas
tbodyNuevaPartida.addEventListener('input', (e) => {
    if (e.target.classList.contains('debe-input') || e.target.classList.contains('haber-input')) {
        calcularTotales();
    }
});

tbodyNuevaPartida.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        e.target.closest('tr').remove();
        calcularTotales();
    }
});

btnAgregarFila.addEventListener('click', agregarFila);

// Lógica principal para guardar y validar la partida
btnGuardarPartida.addEventListener('click', () => {
    const { totalDebe, totalHaber } = calcularTotales();
    const descripcion = descripcionInput.value.trim();

    if (!descripcion) {
        alert("Por favor ingrese una descripción para la operación.");
        return;
    }

    if (totalDebe === 0 && totalHaber === 0) {
        alert("La partida no puede estar en cero.");
        return;
    }

    // Validación de la Partida Doble
    if (totalDebe.toFixed(2) !== totalHaber.toFixed(2)) {
        alert("ATENCIÓN: El Total Debe y el Total Haber no cuadran.");
        return;
    }

    const filas = document.querySelectorAll('#filas-partida tr');
    let movimientos = [];
    let error = false;

    filas.forEach(fila => {
        const codigoCuenta = fila.querySelector('.cuenta-select').value;
        const debe = parseFloat(fila.querySelector('.debe-input').value) || 0;
        const haber = parseFloat(fila.querySelector('.haber-input').value) || 0;

        if (debe > 0 || haber > 0) {
            if (!codigoCuenta) {
                error = true;
                alert("Debe seleccionar una cuenta para los montos ingresados.");
                return;
            }

            const cuentaObj = cuentas.find(c => c.code === codigoCuenta);
            movimientos.push({
                codigo: codigoCuenta,
                cuenta: cuentaObj.name,
                debe: debe,
                haber: haber
            });
        }
    });

    if (error) return;

    if (movimientos.length < 2) {
        alert("Toda partida debe tener al menos dos movimientos.");
        return;
    }

    // Fecha actual para el guardado
    const fecha = new Date().toISOString().split('T')[0];
    
    const nuevaPartida = {
        id: contadorPartidas++,
        fecha: fecha,
        descripcion: descripcion,
        movimientos: movimientos
    };

    partidas.push(nuevaPartida);
    
    // Limpiar campos luego de guardar
    descripcionInput.value = '';
    tbodyNuevaPartida.innerHTML = '';
    agregarFila();
    agregarFila(); // Comenzar siempre con dos filas limpias
    calcularTotales();

    // Actualizar Vistas
    renderizarPartidasGuardadas();
    renderizarLibroMayor();
});

// Formateador de moneda para las tablas
function formatMoney(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Pintar la sección de Partidas Guardadas
function renderizarPartidasGuardadas() {
    listaPartidas.innerHTML = '';

    if (partidas.length === 0) {
        listaPartidas.innerHTML = '<p class="empty-state">No hay partidas guardadas aún.</p>';
        return;
    }

    // Clonamos y volteamos para que la más nueva salga arriba.
    [...partidas].reverse().forEach(p => {
        let tablaHTML = `
            <div class="partida-card">
                <div class="partida-header">
                    Partida #${p.id} | ${p.fecha} | ${p.descripcion}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th>Debe</th>
                            <th>Haber</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        p.movimientos.forEach(m => {
            tablaHTML += `
                <tr>
                    <td>${m.codigo}</td>
                    <td>${m.cuenta}</td>
                    <td>${formatMoney(m.debe)}</td>
                    <td>${formatMoney(m.haber)}</td>
                </tr>
            `;
        });

        tablaHTML += `
                    </tbody>
                </table>
            </div>
        `;

        listaPartidas.innerHTML += tablaHTML;
    });
}

// Lógica de "Cuentas T" - Generar el Libro Mayor
function renderizarLibroMayor() {
    listaMayor.innerHTML = '';

    if (partidas.length === 0) {
        listaMayor.innerHTML = '<p class="empty-state">No hay registros en el mayor aún.</p>';
        return;
    }

    const mayor = {};

    // Agrupar todas las transacciones según su código de cuenta
    partidas.forEach(p => {
        p.movimientos.forEach(m => {
            if (!mayor[m.codigo]) {
                mayor[m.codigo] = { nombre: m.cuenta, movimientos: [], totalDebe: 0, totalHaber: 0 };
            }
            mayor[m.codigo].movimientos.push({
                fecha: p.fecha,
                partidaId: p.id,
                debe: m.debe,
                haber: m.haber
            });
            mayor[m.codigo].totalDebe += m.debe;
            mayor[m.codigo].totalHaber += m.haber;
        });
    });

    for (const codigo in mayor) {
        const c = mayor[codigo];
        let saldo = 0;
        let tipoSaldo = '';

        // Determinación de saldo Deudor/Acreedor
        if (c.totalDebe > c.totalHaber) {
            saldo = c.totalDebe - c.totalHaber;
            tipoSaldo = 'Deudor';
        } else if (c.totalHaber > c.totalDebe) {
            saldo = c.totalHaber - c.totalDebe;
            tipoSaldo = 'Acreedor';
        } else {
            saldo = 0;
            tipoSaldo = 'Saldada';
        }

        let html = `
            <div class="cuenta-mayor">
                <h3>${codigo} - ${c.nombre}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Partida</th>
                            <th>Debe</th>
                            <th>Haber</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        c.movimientos.forEach(m => {
            html += `
                <tr>
                    <td>${m.fecha}</td>
                    <td>#${m.partidaId}</td>
                    <td>${formatMoney(m.debe)}</td>
                    <td>${formatMoney(m.haber)}</td>
                </tr>
            `;
        });

        html += `
                    <tr>
                        <td colspan="2"><strong>TOTALES</strong></td>
                        <td><strong>${formatMoney(c.totalDebe)}</strong></td>
                        <td><strong>${formatMoney(c.totalHaber)}</strong></td>
                    </tr>
                    </tbody>
                </table>
                <div class="saldo-final">
                    Saldo Final: ${formatMoney(saldo)} (${tipoSaldo})
                </div>
            </div>
        `;
        listaMayor.innerHTML += html;
    }
}
agregarFila();
agregarFila();