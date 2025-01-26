$(document).ready(function() {
    const $searchForm = $('#search-form');
    const $titleInput = $('#title-input');
    const $authorInput = $('#author-input');
    const $isbnInput = $('#isbn-input');
    const $resultsDiv = $('#results');
    const $footer = $('#footer');

    // Evento para manejar la búsqueda
    $searchForm.on('submit', async function(e) {
        e.preventDefault();
        
        if (!$titleInput.val() && !$authorInput.val() && !$isbnInput.val()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Por favor, introduce al menos un criterio de búsqueda."
            });
            return;
        }

        // Deshabilitar el botón de búsqueda
        $('#submit').prop('disabled', true);
        $('#submit').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...');

        const title = $titleInput.val().trim();
        const author = $authorInput.val().trim();
        const isbn = $isbnInput.val().trim();

        const url = `https://openlibrary.org/search.json?`
        + (isbn ? `isbn=${encodeURIComponent(isbn)}&` : '')
        + (author ? `author=${encodeURIComponent(author)}&` : '')
        + (title ? `title=${encodeURIComponent(title)}&` : '')
        + `page=${1}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            displayResults(data.docs);
            paginar(data.numFound);
            $('#submit').prop('disabled', false);
            $('#submit').html('Buscar');
        } catch (error) {
            $resultsDiv.html('<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>');
            $('#submit').prop('disabled', false);
            $('#submit').html('Buscar');
        }
    });

    // Función para mostrar los resultados
    function displayResults(books) {

        $resultsDiv.empty();
        if (books.length === 0) {
            $resultsDiv.html('<p>No se encontraron libros.</p>');
            return;
        }
        
        books.forEach((book) => {
            const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : false;

            const bookCard = $(`
                <div class="card col-6 mb-3">
                    <div class="row g-0">
                        <div class="col-md-4">
                            ${coverUrl ? '<img src="' + coverUrl + '" class="img-fluid rounded-start" alt="' + book.title +'">' : 
                            '<div class="img-fluid rounded-start bg-light h-100 d-flex justify-content-center align-items-center"><i class="fas fa-book fa-5x"></i></div>'
                            }
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${book.title}</h5>
                                <p class="card-text"><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
                                <p class="card-text"><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            $resultsDiv.append(bookCard);
        });
    }

    function paginar(totalBooks){
        const totalPages = Math.ceil(totalBooks / 100);
        const maxPagesToShow = 4;
        let currentPage = 1;

        function renderPagination() {
            const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            const $pagination = $(`
                <nav aria-label="Page navigation example">
                    <ul class="pagination">
                        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        ${Array.from({ length: endPage - startPage + 1 }, (_, i) => `
                            <li class="page-item ${currentPage === startPage + i ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${startPage + i}">${startPage + i}</a>
                            </li>
                        `).join('')}
                        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            `);

            $pagination.find('.page-link').on('click', function(e) {
                e.preventDefault();
                const newPage = parseInt($(this).data('page'));
                if (newPage > 0 && newPage <= totalPages) {
                    currentPage = newPage;
                    fetchPage(currentPage);
                }
            });

            $footer.append($pagination);
        }

        function fetchPage(page) {
            // Reuse the search logic to fetch the new page
            const title = $titleInput.val().trim();
            const author = $authorInput.val().trim();
            const isbn = $isbnInput.val().trim();

            const url = `https://openlibrary.org/search.json?`
            + (isbn ? `isbn=${encodeURIComponent(isbn)}&` : '')
            + (author ? `author=${encodeURIComponent(author)}&` : '')
            + (title ? `title=${encodeURIComponent(title)}&` : '')
            + `page=${page}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    displayResults(data.docs);
                    renderPagination();
                })
                .catch(error => {
                    $resultsDiv.html('<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>');
                });
        }

        renderPagination();
    }
});