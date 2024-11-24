
// Obtener el selector de tablas y la tabla de datos en el HTML
const tablaSelector = document.getElementById('tablaSelector');
const tablaDatos = document.getElementById('tablaDatos');

// Mapeo de nombres personalizados para las tablas
const nombrePersonalizado = {
    'atractivos_turisticos_wgs84': 'Atractivos Turísticos',
    'acopio_taxiswgs84': 'Acopio de Taxis',
    'estaciones_wgs84': 'Estaciones Metro',
    'wgs84pot48_2014_red_hidrica_': 'Red Hidríca',
    // Agrega más mapeos según sea necesario
};

// Objeto para controlar las capas que ya se han cargado
let capasCargadas = {};

// Función para cargar las tablas en el selector
async function cargarTablas() {
    try {
        const respuesta = await fetch('/tablas');
        const tablas = await respuesta.json();
        if (!Array.isArray(tablas) || tablas.length === 0) {
            console.log('No se encontraron tablas disponibles');
            return;
        }

        tablas.forEach(tabla => {
            const option = document.createElement('option');
            option.value = tabla.table_name; // Nombre original
            option.textContent = nombrePersonalizado[tabla.table_name] || tabla.table_name; // Usa el nombre personalizado, si existe
            tablaSelector.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar las tablas:', error);
    }
}

// Función para cargar los datos de la tabla seleccionada
async function cargarDatosTabla(nombreTabla) {
    try {
        const respuesta = await fetch(`/tablas/${nombreTabla}`);
        const datos = await respuesta.json();

        // Limpiar la tabla existente
        tablaDatos.querySelector('thead tr').innerHTML = '';
        tablaDatos.querySelector('tbody').innerHTML = '';

        // Si no hay datos, no mostramos la tabla
        if (datos.length === 0) {
            console.log('No hay datos disponibles para la tabla:', nombreTabla);
            return;
        }

        // Crear los encabezados de la tabla basados en los campos del primer registro
        const headers = Object.keys(datos[0]);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tablaDatos.querySelector('thead tr').appendChild(th);
        });

        // Crear las filas de la tabla
        datos.forEach(fila => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = fila[header];
                tr.appendChild(td);
            });
            tablaDatos.querySelector('tbody').appendChild(tr);
        });

        // Estilo para la capa correspondiente (obtenido del mapeo de estilos)
        const estilo = estilosCapas[nombreTabla];

        // Cargar la capa en el mapa con el estilo
        cargarCapaGeoJSON(nombreTabla, datos, estilo);

    } catch (error) {
        console.error('Error al cargar los datos de la tabla:', error);
    }
}

// Función para cargar la capa GeoJSON en el mapa
function cargarCapaGeoJSON(nombreTabla, datos) {
    // Crear la capa GeoJSON
    const capa = L.geoJSON(datos, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                // Aquí puedes personalizar el popup si lo deseas
                layer.bindPopup(JSON.stringify(feature.properties));
            }
        }
    }).addTo(map);

    // Almacenar la capa en el objeto capasCargadas para evitar duplicados
    capasCargadas[nombreTabla] = capa;

    // Agregar la capa al control de capas
    layerControl.addOverlay(capa, nombreTabla);
}

// Evento para cuando se seleccione una tabla
tablaSelector.addEventListener('change', (event) => {
    const nombreTabla = event.target.value;
    if (nombreTabla) {
        cargarDatosTabla(nombreTabla);
    }
});

// Cargar las tablas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarTablas();
});