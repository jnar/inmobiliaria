(function () {
  const lat = 7.0675868;
  const lng = -73.0759443;
  const mapa = L.map("mapa-home").setView([lat, lng], 15);

  let markers = new L.FeatureGroup().addTo(mapa);

  let propiedades = [];

  //filtros
  const filters = {
    category: "",
    price: "",
  };

  //Seleccionar los select
  const categorySelect = document.querySelector("#categories");
  const priceSelect = document.querySelector("#prices");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //listeners
  categorySelect.addEventListener("change", (e) => {
    filters.category = +e.target.value;
    filterProperty();
  });

  priceSelect.addEventListener("change", (e) => {
    filters.price = +e.target.value;
    filterProperty();
  });

  const consultaPropiedades = async () => {
    try {
      const url = "/api/propiedades";
      const respuesta = await fetch(url);
      propiedades = await respuesta.json();
      mostrarPropiedades(propiedades);
    } catch (error) {}
  };

  const mostrarPropiedades = (propiedades) => {
    //limpiar marcadores
    markers.clearLayers();

    propiedades.forEach((propiedad) => {
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        autoPan: true,
      }).addTo(mapa).bindPopup(`
                <h1 class='text-center text-xl font-extrablod, uppercase my-5'>${propiedad.title}</h1>
                <img src='/uploads/${propiedad.image}'  alt=${propiedad.title}>
                <p class='text-gray-600 font-bold'>${propiedad.price.name}</p>
                <a href='/propiedad/${propiedad.id}' class='p-2 text-center font-bold uppercase text-white'>Ver propiedad</a>
            `);
      markers.addLayer(marker);
    });
  };

  const filterProperty = () => {
    // const result = propiedades.filter( propiedad =>{
    //     return filters.category ?  property.categoryId == filters.category : property
    // }).filter(propiedad => {
    //     return filters.price ? property.priceId == filters.price : property
    // })
    const result = propiedades.filter(filterCategory).filter(filterPrice);
    mostrarPropiedades(result);
  };

  const filterCategory = (property) =>
    filters.category ? property.categoryId == filters.category : property;

  const filterPrice = (property) =>
    filters.price ? property.priceId == filters.price : property;

  consultaPropiedades();
})();
