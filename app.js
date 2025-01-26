const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

// Evento para manejar la búsqueda
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const query = searchInput.value.trim();
    if (!query) return;
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayResults(data.docs);
    } catch (error) {
        resultsDiv.innerHTML = '<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>';
        console.error(error);
    }
});

// Función para mostrar los resultados
function displayResults(books) {
    resultsDiv.innerHTML = '';
    if (books.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron libros.</p>';
        return;
    }
    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book');
        bookElement.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 
        'Desconocido'}</p>
        <p><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
        `;
        resultsDiv.appendChild(bookElement);
    });
}