/***************************************************
 * app.js
 * - Carga stock.xlsx
 * - Muestra productos (solo imagen + nombre)
 * - Barra de categorías que filtra productos
 * - Botón "Info Tienda" + Modal
 ***************************************************/

let categorias = [];

// Cargar datos del Excel "stock.xlsx" (se añade parámetro para evitar caché)
function loadExcelData() {
  fetch('stock.json?t=' + new Date().getTime())
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir la hoja a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Agrupar productos por categoría
      const catMap = {};
      jsonData.forEach(row => {
        let cat = row.Categoria || "Sin categoría";
        if (!catMap[cat]) {
          catMap[cat] = [];
        }
        catMap[cat].push({
          nombre: row.Nombre || "Sin nombre",
          // Campos no mostrados pero guardados
          precio: row.Precio || "0",
          imagen: row.Imagen || "",
          marca: row.Marca || ""
        });
      });

      // Convertir el objeto en un array de categorías
      categorias = [];
      for (let key in catMap) {
        categorias.push({
          nombre: key,
          productos: catMap[key]
        });
      }

      // Renderizar la barra de categorías
      renderCategorias();
      // Mostrar todos los productos al inicio
      mostrarProductosLista(getAllProducts());
    })
    .catch(error => console.error("Error al cargar el Excel:", error));
}

// Renderizar la barra de categorías
function renderCategorias() {
  const navCategorias = document.getElementById("categoria-list");
  navCategorias.innerHTML = "";

  // Crear lista (<ul>)
  const ul = document.createElement("ul");

  // Opción "Todo"
  const liTodo = document.createElement("li");
  liTodo.textContent = "Todo";
  liTodo.addEventListener("click", () => {
    mostrarProductosLista(getAllProducts());
  });
  ul.appendChild(liTodo);

  // Para cada categoría
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat.nombre;
    li.addEventListener("click", () => {
      mostrarProductosLista(cat.productos);
    });
    ul.appendChild(li);
  });

  navCategorias.appendChild(ul);
}

// Obtener todos los productos
function getAllProducts() {
  let all = [];
  categorias.forEach(cat => {
    all = all.concat(cat.productos);
  });
  return all;
}

// Mostrar productos en #catalogo (solo imagen + nombre)
function mostrarProductosLista(productos) {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  // Si no hay resultados, mensaje
  if (productos.length === 0) {
    catalogo.innerHTML = "<p>No se han encontrado resultados</p>";
    return;
  }

  // Crear cada tarjeta de producto
  productos.forEach(prod => {
    const divProd = document.createElement("div");
    divProd.className = "producto";

    // Imagen
    const img = document.createElement("img");
    img.src = prod.imagen ? prod.imagen : "images/placeholder.jpg";
    img.alt = prod.nombre;

    // Nombre
    const nombre = document.createElement("h3");
    nombre.textContent = prod.nombre.toUpperCase();

    // Ensamblar
    divProd.appendChild(img);
    divProd.appendChild(nombre);

    catalogo.appendChild(divProd);
  });
}

// Modal "Info Tienda"
const btnInfoTienda = document.getElementById("btn-info-tienda");
const modalInfoTienda = document.getElementById("modal-info-tienda");
const closeInfo = modalInfoTienda.querySelector(".close");

btnInfoTienda.addEventListener("click", () => {
  modalInfoTienda.style.display = "flex";
});

closeInfo.addEventListener("click", () => {
  modalInfoTienda.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalInfoTienda) {
    modalInfoTienda.style.display = "none";
  }
});

// Inicializar al cargar la página
loadExcelData();
