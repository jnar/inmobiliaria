/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapaHome.js":
/*!****************************!*\
  !*** ./src/js/mapaHome.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function () {\n  const lat = 7.0675868;\n  const lng = -73.0759443;\n  const mapa = L.map(\"mapa-home\").setView([lat, lng], 15);\n\n  let markers = new L.FeatureGroup().addTo(mapa);\n\n  let propiedades = [];\n\n  //filtros\n  const filters = {\n    category: \"\",\n    price: \"\",\n  };\n\n  //Seleccionar los select\n  const categorySelect = document.querySelector(\"#categories\");\n  const priceSelect = document.querySelector(\"#prices\");\n\n  L.tileLayer(\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\", {\n    attribution:\n      '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',\n  }).addTo(mapa);\n\n  //listeners\n  categorySelect.addEventListener(\"change\", (e) => {\n    filters.category = +e.target.value;\n    filterProperty();\n  });\n\n  priceSelect.addEventListener(\"change\", (e) => {\n    filters.price = +e.target.value;\n    filterProperty();\n  });\n\n  const consultaPropiedades = async () => {\n    try {\n      const url = \"/api/propiedades\";\n      const respuesta = await fetch(url);\n      propiedades = await respuesta.json();\n      mostrarPropiedades(propiedades);\n    } catch (error) {}\n  };\n\n  const mostrarPropiedades = (propiedades) => {\n    //limpiar marcadores\n    markers.clearLayers();\n\n    propiedades.forEach((propiedad) => {\n      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {\n        autoPan: true,\n      }).addTo(mapa).bindPopup(`\n                <h1 class='text-center text-xl font-extrablod, uppercase my-5'>${propiedad.title}</h1>\n                <img src='/uploads/${propiedad.image}'  alt=${propiedad.title}>\n                <p class='text-gray-600 font-bold'>${propiedad.price.name}</p>\n                <a href='/propiedad/${propiedad.id}' class='p-2 text-center font-bold uppercase text-white'>Ver propiedad</a>\n            `);\n      markers.addLayer(marker);\n    });\n  };\n\n  const filterProperty = () => {\n    // const result = propiedades.filter( propiedad =>{\n    //     return filters.category ?  property.categoryId == filters.category : property\n    // }).filter(propiedad => {\n    //     return filters.price ? property.priceId == filters.price : property\n    // })\n    const result = propiedades.filter(filterCategory).filter(filterPrice);\n    mostrarPropiedades(result);\n  };\n\n  const filterCategory = (property) =>\n    filters.category ? property.categoryId == filters.category : property;\n\n  const filterPrice = (property) =>\n    filters.price ? property.priceId == filters.price : property;\n\n  consultaPropiedades();\n})();\n\n\n//# sourceURL=webpack://bienes_raices/./src/js/mapaHome.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapaHome.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;