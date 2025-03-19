/****************************************
 * Array de items que vienen del CSV
 * (cada fila se espera con { Categoria, Nombre, Imagen })
 ****************************************/
let items = [];

/****************************************
 * Cargar el CSV "stock.csv"
 ****************************************/
function loadCSVData() {
  fetch('stock.csv')
    .then(response => response.text())
    .then(csvText => {
      // Leer el CSV como string y procesarlo con SheetJS
      const workbook = XLSX.read(csvText, { type: 'string'});
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir la hoja a JSON (cada fila es un objeto)
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Extraer las propiedades: Categoria, Nombre, Imagen
      items = jsonData.map(row => ({
        categoria: row.Categoria || "Sin categoría",
        nombre: row.Nombre || "Sin nombre",
        imagen: row.Imagen || "images/placeholder.jpg"
      }));

      // Renderizar las tarjetas con la data del CSV
      renderItems();
    })
    .catch(error => console.error("Error al cargar el CSV:", error));
}

/****************************************
 * Renderizar las tarjetas en el grid
 ****************************************/
const gridCategorias = document.getElementById("grid-categorias");

function renderItems() {
  gridCategorias.innerHTML = "";
  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "categoria-card";

    const img = document.createElement("img");
    img.src = it.imagen;
    img.alt = it.nombre;

    const h3 = document.createElement("h3");
    h3.textContent = it.nombre;

    card.appendChild(img);
    card.appendChild(h3);

    gridCategorias.appendChild(card);
  });
}

/****************************************
 * Búsqueda con sugerencias (fuzzy)
 ****************************************/
const searchInput = document.getElementById("search-input");
const suggestionsBox = document.getElementById("suggestions");

// Al escribir, mostramos sugerencias
searchInput.addEventListener("input", () => {
  const termino = searchInput.value.toLowerCase().trim();
  if (termino === "") {
    suggestionsBox.style.display = "none";
    return;
  }
  // Filtrar con fuzzy: busca en el nombre o en la categoría
  const results = items.filter(it => 
    fuzzySearch(it.nombre.toLowerCase(), termino) ||
    fuzzySearch(it.categoria.toLowerCase(), termino)
  );
  showSuggestions(results);
});

// Al presionar Enter, filtramos y renderizamos
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const termino = searchInput.value.toLowerCase().trim();
    if (termino === "") {
      suggestionsBox.style.display = "none";
      return;
    }
    const results = items.filter(it =>
      fuzzySearch(it.nombre.toLowerCase(), termino) ||
      fuzzySearch(it.categoria.toLowerCase(), termino)
    );
    // Renderizar solo los resultados filtrados
    gridCategorias.innerHTML = "";
    results.forEach(it => {
      const card = document.createElement("div");
      card.className = "categoria-card";

      const img = document.createElement("img");
      img.src = it.imagen;
      img.alt = it.nombre;

      const h3 = document.createElement("h3");
      h3.textContent = it.nombre;

      card.appendChild(img);
      card.appendChild(h3);

      gridCategorias.appendChild(card);
    });
    suggestionsBox.style.display = "none";
  }
});

// Cerrar sugerencias si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
    suggestionsBox.style.display = "none";
  }
});

/****************************************
 * Mostrar lista de sugerencias
 ****************************************/
function showSuggestions(results) {
  suggestionsBox.innerHTML = "";
  if (results.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }
  const ul = document.createElement("ul");
  results.forEach(it => {
    const li = document.createElement("li");
    li.textContent = it.nombre;
    li.addEventListener("click", () => {
      searchInput.value = it.nombre;
      suggestionsBox.style.display = "none";
      // Renderizar solo ese item
      gridCategorias.innerHTML = "";
      const card = document.createElement("div");
      card.className = "categoria-card";

      const img = document.createElement("img");
      img.src = it.imagen;
      img.alt = it.nombre;

      const h3 = document.createElement("h3");
      h3.textContent = it.nombre;

      card.appendChild(img);
      card.appendChild(h3);

      gridCategorias.appendChild(card);
    });
    ul.appendChild(li);
  });
  suggestionsBox.appendChild(ul);
  suggestionsBox.style.display = "block";
}

/****************************************
 * FuzzySearch (Levenshtein <= 2)
 ****************************************/
function fuzzySearch(str, query) {
  // Coincidencia por subcadena
  if (str.includes(query)) return true;
  // O Levenshtein <= 2
  return levenshteinDistance(str, query) <= 2;
}

function levenshteinDistance(a, b) {
  const dp = [];
  for (let i = 0; i <= a.length; i++) {
    dp[i] = [i];
  }
  for (let j = 1; j <= b.length; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        );
      }
    }
  }
  return dp[a.length][b.length];
}

/****************************************
 * MODAL INFO TIENDA
 ****************************************/
const btnUser = document.getElementById("btn-user");
const modalInfo = document.getElementById("modal-info");
const modalClose = document.getElementById("modal-close");

btnUser.addEventListener("click", () => {
  modalInfo.style.display = "flex";
});

modalClose.addEventListener("click", () => {
  modalInfo.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalInfo) {
    modalInfo.style.display = "none";
  }
});

/****************************************
 * Iniciar la carga del CSV
 ****************************************/
loadCSVData();
