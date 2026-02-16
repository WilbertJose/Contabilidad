// Catálogo base requerido
const catalogo = {
    '1105': 'Inventarios',
    '1104': 'IVA Credito Fiscal (13%)',
    '1101': 'Efectivo y Equivalentes'
};

// Variables para almacenar datos globales
let diario = []; 
let cuentasMayor = {};

// Elementos del DOM
const btnRegistrar = document.getElementById('btn-registrar');
const inputOperacion = document.getElementById('input-operacion');
const diarioBody = document.getElementById('diario-body');
const diarioFoot = document.getElementById('diario-foot');
const mayorGrid = document.getElementById('mayor-grid');

// Formato de Moneda ($X,XXX.XX)
function formatMoney(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function procesarOperacion() {
    const texto = inputOperacion.value.trim();
    if (!texto) {
        alert('Por favor, escribe una descripción con el monto.');
        return;
    }

    // Usamos Expresiones Regulares (Regex) para extraer SOLO el número de la frase
    const matchNumeros = texto.match(/(\d+(?:\.\d+)?)/);
    
    if (!matchNumeros) {
        alert('No pude detectar ningún monto numérico en tu texto.');
        return;
    }

    // Convertir el texto encontrado a un número real
    const montoBase = parseFloat(matchNumeros[0]);

    // CÁLCULOS AUTOMÁTICOS (Según la fórmula de tu imagen)
    const montoInventario = montoBase;            // Ej: 5000
    const montoIVA = montoBase * 0.13;            // Ej: 650
    const montoEfectivo = montoInventario + montoIVA; // Ej: 5650

    // Construir la partida doble
    const partidaNueva = [
        { codigo: '1105', cuenta: catalogo['1105'], debe: montoInventario, haber: 0 },
        { codigo: '1104', cuenta: catalogo['1104'], debe: montoIVA, haber: 0 },
        { codigo: '1101', cuenta: catalogo['1101'], debe: 0, haber: montoEfectivo }
    ];

    // Reiniciar los arreglos para que se comporte como en tu imagen (una partida a la vez en pantalla)
    // Si quisieras que se sumen infinitamente, simplemente borra estas dos siguientes líneas:
    diario = []; 
    cuentasMayor = {}; 

    // Guardar en las variables globales
    diario.push(...partidaNueva);

    partidaNueva.forEach(mov => {
        if (!cuentasMayor[mov.codigo]) {
            cuentasMayor[mov.codigo] = { nombre: mov.cuenta, debe: 0, haber: 0 };
        }
        cuentasMayor[mov.codigo].debe += mov.debe;
        cuentasMayor[mov.codigo].haber += mov.haber;
    });

    // Limpiar Input y Mostrar Datos
    inputOperacion.value = '';
    renderizarVistas();
}

function renderizarVistas() {
    // 1. DIBUJAR LIBRO DIARIO
    diarioBody.innerHTML = '';
    let totalDebe = 0;
    let totalHaber = 0;

    diario.forEach(mov => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mov.codigo}</td>
            <td>${mov.cuenta}</td>
            <td>${mov.debe > 0 ? formatMoney(mov.debe) : '$0.00'}</td>
            <td>${mov.haber > 0 ? formatMoney(mov.haber) : '$0.00'}</td>
        `;
        diarioBody.appendChild(tr);
        totalDebe += mov.debe;
        totalHaber += mov.haber;
    });

    // Pie de tabla con totales
    diarioFoot.innerHTML = `
        <tr>
            <th colspan="2">TOTALES</th>
            <th>${formatMoney(totalDebe)}</th>
            <th>${formatMoney(totalHaber)}</th>
        </tr>
    `;

    // 2. DIBUJAR CUENTAS T MAYOR
    mayorGrid.innerHTML = '';
    
    // El orden específico para que salgan como en tu captura
    const ordenTarjetas = ['1105', '1104', '1101']; 
    
    ordenTarjetas.forEach(codigo => {
        if (cuentasMayor[codigo]) {
            const cuenta = cuentasMayor[codigo];
            // Fórmula estricta de tu captura: Saldo = Debe - Haber
            const saldoFinal = cuenta.debe - cuenta.haber; 
            
            const div = document.createElement('div');
            div.className = 'cuenta-t-card';
            div.innerHTML = `
                <h3>${cuenta.nombre}</h3>
                <p><strong>Debe:</strong> ${formatMoney(cuenta.debe)}</p>
                <p><strong>Haber:</strong> ${formatMoney(cuenta.haber)}</p>
                <p class="saldo">Saldo: ${formatMoney(saldoFinal)}</p>
            `;
            mayorGrid.appendChild(div);
        }
    });
}

// Eventos de click y tecla "Enter"
btnRegistrar.addEventListener('click', procesarOperacion);
inputOperacion.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        procesarOperacion();
    }
});