// ===== app.js =====
let data = [];
let map;
let marker;
let selectedLat = null;
let selectedLng = null;

// Cargar INEGI
fetch("./inegi.json")
  .then(res => res.json())
  .then(json => { data = json.estados; cargarEstados(); })
  .catch(e => console.error("Error cargando INEGI:", e));

function cargarEstados() {
  const estadoSelect = document.getElementById("estado");
  estadoSelect.innerHTML = "<option value=''>Estado</option>";
  data.forEach(e => {
    estadoSelect.innerHTML += `<option value="${e.clave}">${e.nombre}</option>`;
  });
}

document.getElementById("estado").addEventListener("change", () => {
  const estadoSelect = document.getElementById("estado");
  const municipioSelect = document.getElementById("municipio");
  const localidadSelect = document.getElementById("localidad");

  let estadoObj = data.find(e => e.clave === estadoSelect.value);
  municipioSelect.innerHTML = "<option value=''>Municipio</option>";
  localidadSelect.innerHTML = "<option value=''>Localidad</option>";

  if (!estadoObj) return;

  estadoObj.municipios.forEach(m => {
    municipioSelect.innerHTML += `<option value="${m.clave}">${m.nombre}</option>`;
  });
});

document.getElementById("municipio").addEventListener("change", () => {
  const estadoSelect = document.getElementById("estado");
  const municipioSelect = document.getElementById("municipio");
  const localidadSelect = document.getElementById("localidad");

  let estadoObj = data.find(e => e.clave === estadoSelect.value);
  if (!estadoObj) return;

  let municipioObj = estadoObj.municipios.find(m => m.clave === municipioSelect.value);

  localidadSelect.innerHTML = "<option value=''>Localidad</option>";
  if (!municipioObj) return;

  municipioObj.localidades.forEach(l => {
    localidadSelect.innerHTML += `<option value="${l.clave}">${l.nombre}</option>`;
  });
});

// Validaciones
document.getElementById("nombre").addEventListener("input", e => {
  e.target.value = e.target.value.toUpperCase();
});

document.getElementById("telefono").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0,10);
});

// MAPA
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 23.6345, lng: -102.5528 },
    zoom: 5
  });

  map.addListener("click", e => colocarMarcador(e.latLng));
}

function colocarMarcador(location) {
  if(marker) marker.setMap(null);

  marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP
  });

  selectedLat = location.lat();
  selectedLng = location.lng();

  alert(`Marcador colocado:\nLat: ${selectedLat}\nLng: ${selectedLng}`);
}

// Cargar área
function cargarAreaSeleccionada() {
  const estado = document.getElementById("estado");
  const municipio = document.getElementById("municipio");
  const localidad = document.getElementById("localidad");

  let estadoText = estado.options[estado.selectedIndex]?.text;
  let municipioText = municipio.options[municipio.selectedIndex]?.text;
  let localidadText = localidad.options[localidad.selectedIndex]?.text;

  if(!estadoText){
    alert("Selecciona al menos un Estado");
    return;
  }

  let direccion = localidadText
    ? `${localidadText}, ${municipioText}, ${estadoText}, México`
    : municipioText
    ? `${municipioText}, ${estadoText}, México`
    : `${estadoText}, México`;

  let geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: direccion, region: "mx" }, (results,status)=>{
    if(status === "OK"){
      map.setCenter(results[0].geometry.location);
      map.setZoom(localidadText ? 16 : municipioText ? 13 : 6);
      alert("Ahora da clic en el mapa para marcar ubicación exacta");
    } else {
      alert("seleccione el punto exacto de su domicilio en el mapa");
    }
  });
}

// Calcular valor
function calcularValor(){
  const pisos = document.getElementById("pisos").value;
  const tipo = document.getElementById("tipo").value;
  const antiguedad = parseInt(document.getElementById("antiguedad").value)||0;

  const base = 1200000;
  const factorTipo = {
    condominio:0.9,
    casa:1,
    departamento:1.15,
    duplex:1.25,
    terreno:1.44
  };

  let valor = base * ((pisos == 2 || tipo === "terreno") ? 1.2 : 1) * (factorTipo[tipo] || 1) - (antiguedad * 12000);
valor = Math.max(valor, 0);

  document.getElementById("resultado").innerText = "$"+valor.toLocaleString();
}

// GUARDAR EN FIREBASE
async function guardarDatos(){

  if(!window.db){
    alert("Firebase no está listo");
    return;
  }

  if(!selectedLat || !selectedLng){
    alert("Selecciona un punto en el mapa");
    return;
  }

 const datos = {
  nombre: document.getElementById("nombre").value || "",
  telefono: document.getElementById("telefono").value || "",
  estado: document.getElementById("estado").selectedOptions[0]?.text || "",
  municipio: document.getElementById("municipio").selectedOptions[0]?.text || "",
  localidad: document.getElementById("localidad").selectedOptions[0]?.text || "",
  resultado: document.getElementById("resultado").innerText || "$0",
  lat: selectedLat ?? null,
  lng: selectedLng ?? null,
  fecha: new Date()
};
  console.log("Guardando:", datos);

  try{
    await window.db.collection("avaluos").add(datos);
    alert("✅ Datos guardados correctamente en breve unos de nuestros asesores se pondra en contacto con usted");
  }catch(e){
    console.error(e);
    alert("❌ Error: " + e.message);
  }
}