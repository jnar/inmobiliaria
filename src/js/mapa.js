(function () {
  const lat = document.querySelector("#lat").value || 7.0675868;
  const lng = document.querySelector("#lng").value || -73.0759443;
  const mapa = L.map("mapa").setView([lat, lng], 16);
  let marker;

  //Utilizar provider y el geocoder
  const geocodeService = L.esri.Geocoding.geocodeService();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  // El Pin
  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true,
  }).addTo(mapa);

  // detectar el movimiento
  marker.on("moveend", function (e) {
    marker = e.target;
    const posicion = marker.getLatLng();
    mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

    //Obtener la información de las calles
    geocodeService
      .reverse()
      .latlng(posicion, 13)
      .run(function (error, resultado) {
        console.log(resultado);

        marker.bindPopup(resultado.address.LongLabel);

        //mostrar la dirección
        document.querySelector(".calle").textContent =
          resultado.address.Address ?? "";

        //llenar los campos
        document.querySelector("#address").value =
          resultado?.address?.Address ?? "";
        document.querySelector("#lat").value = resultado?.latlng?.lat;
        document.querySelector("#lng").value = resultado?.latlng?.lng;
      });
  });
})();
