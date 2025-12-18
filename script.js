// script.js
// Archivo base para el laboratorio.
// NO deben modificar el HTML ni el CSS, solo trabajar aquí.

// API pública: JSONPlaceholder
// Documentación: https://jsonplaceholder.typicode.com/ (solo lectura)
// Ejemplo de endpoint que usaremos:
//   https://jsonplaceholder.typicode.com/posts?userId=1

// Paso 1: Referencias a elementos del DOM (ya tienes los IDs definidos en index.html).
const postForm = document.getElementById("postForm");
const userIdInput = document.getElementById("userIdInput");
const rememberUserCheckbox = document.getElementById("rememberUser");
const statusArea = document.getElementById("statusArea");
const postsList = document.getElementById("postsList");
const clearResultsBtn = document.getElementById("clearResultsBtn");

// Claves para localStorage
const LAST_USER_ID_KEY = "lab_fetch_last_user_id";
const POSTS_DATA_KEY = "lab_fetch_posts_data";

let statusMessage = statusArea.querySelector(".status-message");
const clickUser = document.getElementById(".btn primary-btn");

// TODO 1:
// Al cargar la página:
// - Leer de localStorage el último userId usado (si existe) y colocarlo en el input.
//   Si hay valor, marcar el checkbox "rememberUser".
// - Leer de localStorage los posts guardados (si existen) y mostrarlos en la lista.
//   Si hay posts guardados, actualizar el área de estado indicando que se cargaron desde localStorage.
// Pista: window.addEventListener("DOMContentLoaded", ...)
window.addEventListener(" DOMContentLoaded", function(){
    const lastUserId = localStorage.getItem(LAST_USER_ID_KEY);
    if (lastUserId){
        userIdInput.value = lastUserId;
        rememberUserCheckbox.checked = true;
    }
        const savedPosts = localStorage.getItem(POSTS_DATA_KEY);
    if (savedPosts){
        try {
            const posts = JSON.parse(savedPosts);
            if (Array.isArray(posts) && posts.length > 0){
                renderPosts(posts);
                updateStatusMessage("Publicaciones cargadas desde localStorage.", "success");
            }
        } catch (error){
            console.error("Error al parsear posts de localStorage:", error);
            localStorage.removeItem(POSTS_DATA_KEY);
            updateStatusMessage("Error al cargar datos guardados. Se eliminaron datos corruptos :(", "error");
        }
    }
});

// TODO 2:
// Manejar el evento "submit" del formulario.
// - Prevenir el comportamiento por defecto.
// - Leer el valor de userId.
// - Validar que esté entre 1 y 10 (o mostrar mensaje de error).
// - Actualizar el área de estado a "Cargando..." con una clase de loading.
// - Llamar a una función que haga la petición fetch a la API.

postForm.addEventListener("submit", function (event){
    event.preventDefault();
    const userId = parseInt(userIdInput.value);
    
    if (isNaN(userId) || userId <1 || userId >10 ){
        updateStatusMessage("Por favor, ingresa un ID de usuario válido (1-10).", "error");
        return;
    }
    updateStatusMessage("Cargando publicaciones...", "loading ");
    fetchPostsByUser(userId);
});

// TODO 3:
// Implementar una función async que reciba el userId y:
// - Arme la URL: https://jsonplaceholder.typicode.com/posts?userId=VALOR
// - Use fetch para hacer la petición GET.
// - Valide que la respuesta sea ok (response.ok).
// - Convierta la respuesta a JSON.
// - Actualice el área de estado a "Éxito" o similar.
// - Muestre los resultados en la lista usando otra función (ver TODO 4).
// - Maneje errores (try/catch) y muestre mensaje de error en statusArea.
async function fetchPostsByUser(userId) {
    const url = `https://jsonplaceholder.typicode.com/posts?userId=${userId}`;
    
    try{
        const response = await fetch( url);
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }
        
        const dato =await response.json();
        updateStatusMessage(`¡Éxito! Se cargaron ${dato.length} publicaciones.`, "success");
        renderPosts(dato);
        
        // TODO 5:
        // Si el checkbox "rememberUser" está marcado cuando se hace una consulta
        // exitosa, guardar el userId en localStorage. Si no, limpiar ese valor.
        if (rememberUserCheckbox.checked ){
            localStorage.setItem(LAST_USER_ID_KEY, userId.toString());
        } else {
            localStorage.removeItem(LAST_USER_ID_KEY);
        }
        
    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
        updateStatusMessage(`Error: ${error.message}`, "error");
    }
}

// TODO 4:
// Crear una función que reciba un arreglo de publicaciones y:
// - Limpie cualquier resultado previo en postsList.
// - Para cada post, cree un <li> con clase "post-item".
// - Dentro agregue un título (h3 o p con clase "post-title") y el cuerpo (p con clase "post-body").
// - Inserte los elementos en el DOM.
// - IMPORTANTE: Después de mostrar los posts, guardarlos en localStorage usando la clave POSTS_DATA_KEY.
//   Recuerda que localStorage solo guarda strings, así que usa JSON.stringify() para convertir el arreglo.
function renderPosts(posts) {
    postsList.innerHTML = "";
    if (!Array.isArray(posts) || posts.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No hay publicaciones para mostrar.";
        emptyItem.style.textAlign = "center";
        emptyItem.style.color = "#9ca3af";
        emptyItem.style.fontStyle = "italic";
        postsList.appendChild(emptyItem);
        return;
    }
    posts.forEach(post => {
        const postItem = document.createElement("li");
        postItem.className = "post-item";
        const postTitle = document.createElement("p");
        postTitle.className = "post-title";
        postTitle.textContent = post.title || "Sin título";
        const postBody = document.createElement("p");
        postBody.className = "post-body";
        postBody.textContent = post.body || "Sin contenido";
        postItem.appendChild(postTitle);
        postItem.appendChild(postBody);
        postsList.appendChild(postItem);
    });

    try{
        localStorage.setItem(POSTS_DATA_KEY, JSON.stringify(posts));
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
        updateStatusMessage("Error al guardar en localStorage.", "error");
    }
}

// TODO 6:
// Agregar un evento al botón "Limpiar resultados" que:
// - Vacíe la lista de publicaciones.
// - Restablezca el mensaje de estado a "Aún no se ha hecho ninguna petición."
// - Elimine los posts guardados en localStorage (usando la clave POSTS_DATA_KEY).
clearResultsBtn.addEventListener("click", function() {
    postsList.innerHTML= "";
    localStorage.removeItem(POSTS_DATA_KEY);
    updateStatusMessage("Aún no se ha hecho ninguna petición.", "");
});

function updateStatusMessage( message, statusType="") {
    statusMessage.className = "status-message";
    
    if (statusType) {
        statusMessage.classList.add(`status-message--${statusType}`);
    }
    statusMessage.textContent = message;
}
updateStatusMessage("Aún no se ha hecho ninguna petición.", "")