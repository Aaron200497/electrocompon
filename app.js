/***************************************************
 * app.js (versión con Papa Parse)
 * - Carga stock.csv (o stock.xlsx convertido a CSV)
 * - Muestra productos (solo imagen y nombre)
 * - Barra de categorías que filtra productos
 * - Botón "Info Tienda" + Modal
 ***************************************************/

// Variable global para almacenar las categorías y productos
let categorias = [];

// Cargar datos del CSV "stock.csv" (se añade parámetro para evitar caché)
function loadCSVData() {
  fetch('Stock.csv?t=' + Date.now())
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar el CSV: ${response.status}`);
      }
      return response.text();
    })
    .then(csvData => {
      console.log("CSV Data raw:", csvData);
      // Remover BOM si existe
      if (csvData.charCodeAt(0) === 0xFEFF) {
        csvData = csvData.slice(1);
      }
      // Parsear el CSV usando Papa Parse
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        delimiter: ","  // Ajusta si tu CSV usa otro delimitador, por ejemplo ";"
      });
      console.log("Datos parseados con Papa Parse:", result.data);

      // Agrupar productos por categoría
      const catMap = {};
      result.data.forEach(row => {
        let cat = row.Categoria || "Sin categoría";
        if (!catMap[cat]) {
          catMap[cat] = [];
        }
        catMap[cat].push({
          nombre: row.Nombre || "Sin nombre",
          imagen: row.Imagen || "",
          precio: row.Precio || "0",
          marca: row.Marca || ""
        });
      });

      categorias = [];
      for (let key in catMap) {
        categorias.push({
          nombre: key,
          productos: catMap[key]
        });
      }
      console.log("Categorías agrupadas:", categorias);

      renderCategorias();
      mostrarProductosLista(getAllProducts());
    })
    .catch(error => console.error("Error al cargar el CSV:", error));
}

// Renderizar la barra de categorías
function renderCategorias() {
  const navCategorias = document.getElementById("categoria-list");
  navCategorias.innerHTML = "";

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

// Mostrar productos en #catalogo (solo imagen y nombre)
function mostrarProductosLista(productos) {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  if (productos.length === 0) {
    catalogo.innerHTML = "<p>No se han encontrado resultados</p>";
    return;
  }

  productos.forEach(prod => {
    console.log("Mostrando producto:", prod.nombre, "con imagen:", prod.imagen);
    const divProd = document.createElement("div");
    divProd.className = "producto";

    const img = document.createElement("img");
    img.src = prod.imagen ? prod.imagen : "images/placeholder.jpeg";
    img.alt = prod.nombre;

    const nombre = document.createElement("h3");
    nombre.textContent = prod.nombre.toUpperCase();

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

loadCSVData();
