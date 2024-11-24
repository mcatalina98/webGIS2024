// Inicializar el mapa
var map = L.map('map').setView([6.268658, -75.565801], 13);


//Información cartográfica
var marker = L.marker([6.257257, -75.575508]).addTo(map);
marker.bindPopup("<b>Medellín</b><br>").openPopup();


var frontera;
fetch('geoJSON/barrios_y_veredasgeoj.geojson')
    .then(response => response.json())
    .then(data => {
        frontera = L.geoJSON(data, {
            style: estiloBarrio,  // Aplica la función de estilo
            onEachFeature: function (feature, layer) {
                // Mostrar el nombre del barrio en un popup cuando se hace clic
                if (feature.properties && feature.properties.nombre) {
                    layer.bindPopup("Barrio: " + feature.properties.nombre);
                }

                // Mostrar el nombre del barrio al pasar el cursor (tooltip)
                if (feature.properties && feature.properties.nombre) {
                    layer.bindTooltip(feature.properties.nombre, {
                        permanent: false, // No es permanente, solo aparece al pasar el mouse
                        direction: "top", // Dirección del tooltip (puede ser "top", "right", "bottom", "left")
                        offset: L.point(0, -10), // Ajusta la posición del tooltip
                        opacity: 0.8 // Opacidad del tooltip
                    });
                }

                // Opcional: Puedes agregar eventos para cambiar el estilo al pasar el ratón
                layer.on('mouseover', function () {
                    layer.setStyle({
                        weight: 3, // Cambia el grosor del borde
                        color: '#ff6347', // Cambia el color del borde
                        fillOpacity: 0.9 // Aumenta la opacidad del relleno
                    });
                });

                // Restablecer el estilo cuando el mouse sale de la capa
                layer.on('mouseout', function () {
                    layer.setStyle(estiloBarrio(feature)); // Restablecer el estilo original
                });
            }
        }).addTo(map);

        // Agregar la capa GeoJSON al control de capas
        layerControl.addOverlay(frontera, 'Barrios de Medellín');
    })
    .catch(err => console.error('Error cargando el archivo GeoJSON: ', err));

    // Función de estilo para personalizar el color de los barrios
    function estiloBarrio(feature) {
        var baseStyle = {
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        };
    
       
    };



// Cargar y agregar las capas GeoJSON al mapa
function cargarGeoJSON(url, capaNombre, estilo) {
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // Crear una capa para el GeoJSON
      var capa = L.geoJSON(data, {
        style: estilo,  // Estilo aplicado a la capa
        onEachFeature: function (feature, layer) {
          // Aquí verificamos qué capa se está agregando para asignar un contenido personalizado
          var popupContent = ""; // Variable para el contenido del popup

          // Personalizar contenido del popup según la capa
          switch (capaNombre) {
            case "Estaciones del sistema":
              // Contenido específico para "Estaciones del sistema"
             
              popupContent += "<strong>Nombre Estación:</strong> " + feature.properties.nombre + "<br>";
             
              break;
              
            case "Cámaras de seguridad":
              // Contenido específico para "Cámaras de seguridad"
              
              popupContent += "<strong>Localización:</strong> " + feature.properties.localizaci + "<br>";
              
              break;

            case "Acopios de taxis":
              // Contenido específico para "Acopios de taxis"
              
              popupContent += "<strong>Acopio:</strong> " + feature.properties.nombre_com + "<br>";
              break;

            case "Atractivos turísticos":
              // Contenido específico para "Atractivos turísticos"
              
              popupContent += "<strong>Nombre:</strong> " + feature.properties.nombre_sit + "<br>";
              
              break;

            
                
              break;

            // Agregar más casos según las capas que tengas
            default:
              popupContent = "<b>Información:</b> " + (feature.properties.nombre || 'Sin nombre') + "<br>";
              break;
          }

          // Asignar el contenido al popup
          layer.bindPopup(popupContent);
        }
      }).addTo(map);

      // Agregar la capa al control de capas
      layerControl.addOverlay(capa, capaNombre);
    })
    .catch(err => console.error('Error cargando el archivo GeoJSON: ', err));
}

// Estilos específicos para las capas
function estiloEstaciones(feature) {
  return {
      color: 'blue',
     
  };
}

function estiloCamaras(feature) {
  return {
      color: 'green',
    
  };
}

function estiloAcopioTaxis(feature) {
  return {
      color: 'purple',
      
  };
}

function atarctivosturísticos(feature) {
  return {
      color: 'purple',
      
  };
}



// Cargar las capas GeoJSON con sus respectivos estilos y popups personalizados
cargarGeoJSON('geoJSON/estacionessistemaswgs84.geojson', 'Estaciones del sistema', estiloEstaciones);
cargarGeoJSON('geoJSON/camaras_wgs84.geojson', 'Cámaras de seguridad', estiloCamaras);
cargarGeoJSON('geoJSON/acopiotaxis_wgs84.geojson', 'Acopios de taxis', estiloAcopioTaxis);
cargarGeoJSON('geoJSON/atractturistic_wgs84.geojson', 'Atractivos turísticos', atarctivosturísticos);






// Mapas base
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var baseMaps = {
    "OpenStreetMap": osm,
    "Esri World Imagery": Esri_WorldImagery,
    "Mapas HOT": osmHOT
};

// // // Control de capas para los overlays
var overlayMaps = {};

// Agregar control de capas al mapa
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);






// // Función para cargar tablas con geometría y agregarlas al control de capas
// fetch('/tablas')
//   .then(response => response.json())
//   .then(tablas => {
//     console.log('Tablas con geometría:', tablas); // Verifica la estructura de los datos

//     tablas.forEach(tabla => {
//       var nombreTabla = tabla.table_name;

//       // Crear una capa vacía para esta tabla y añadirla al control de capas
//       var layer = L.layerGroup();
//       console.log('Añadiendo capa:', nombreTabla); // Verifica que se están añadiendo las capas
//       layerControl.addOverlay(layer, nombreTabla); // Añadir al control de capas

//       // Escuchar cuando el usuario activa la capa en el control
//       map.on('overlayadd', function(event) {
//         if (event.name === nombreTabla) {
//           console.log('Cargando datos para la tabla:', nombreTabla); // Verifica que la tabla esté siendo seleccionada

//           // Cargar los datos de la tabla y mostrarlos en el mapa
//           fetch(`/tablas/${nombreTabla}`)
//             .then(response => response.json())
//             .then(data => {
//               console.log('Datos GeoJSON para', nombreTabla, data); // Verifica los datos recibidos
//               var geoLayer = L.geoJSON(data, {
//                 onEachFeature: function (feature, layer) {
//                   if (feature.properties) {
//                     layer.bindPopup(JSON.stringify(feature.properties)); // Personaliza el popup si lo deseas
//                   }
//                 }
//               });
//               layer.addLayer(geoLayer); // Añadir los datos a la capa
//             })
//             .catch(err => console.error('Error cargando los datos de la tabla:', err));
//         }
//       });

//       // Escuchar cuando el usuario desactiva la capa en el control
//       map.on('overlayremove', function(event) {
//         if (event.name === nombreTabla) {
//           layer.clearLayers();  // Limpia la capa cuando se desactiva
//         }
//       });
//     });
//   })
//   .catch(err => console.error('Error obteniendo las tablas con geometría:', err));
