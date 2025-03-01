<script>
document.addEventListener("DOMContentLoaded", function() {
    const grid = document.querySelector('[cl-pagination="list"]');
    const cards = grid ? Array.from(grid.querySelectorAll('[cl-pagination="item"]')) : [];
    const pagination = document.querySelector('[cl-pagination="pagination"]');

    let cardsPerPage = window.innerWidth < 768 ? 4 : 12;
    let currentPage = 1;
    let totalPages = Math.ceil(cards.length / cardsPerPage);
    const fadeDuration = 300;

    function updateCardsPerPage() {
        cardsPerPage = window.innerWidth < 768 ? 4 : 12;
        totalPages = Math.ceil(cards.length / cardsPerPage);
    }

    function updatePaginationVisibility() {
        pagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    function initializeCardVisibility() {
        cards.forEach((card, index) => {
            card.style.display = index < cardsPerPage ? 'flex' : 'none';
        });
    }

    function showPage(page) {
        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;

        cards.forEach((card, index) => {
            if (card.style.display === 'flex') {
                card.classList.add('fade-out');
            }
        });

        setTimeout(() => {
            cards.forEach((card, index) => {
                card.style.display = 'none';
                card.classList.remove('fade-out', 'fade-in');

                if (index >= start && index < end) {
                    card.style.display = 'flex';
                    card.classList.add('fade-in');
                }
            });

            setTimeout(() => {
                cards.forEach(card => card.classList.remove('fade-in'));
            }, fadeDuration);
        }, fadeDuration);

        pagination.querySelectorAll('[cl-pagination="number"]').forEach(button => {
            button.classList.toggle('active', Number(button.textContent) === page);
        });

        updateArrowVisibility();
        createPaginationButtons();
    }

    function createPaginationButtons() {
        pagination.querySelectorAll('[cl-pagination="number"]').forEach(button => button.remove());

        const prevArrow = pagination.querySelector('[cl-pagination="prev"]');
        const nextArrow = pagination.querySelector('[cl-pagination="next"]');

        const insertBeforeElement = nextArrow;

        function addButton(page) {
            const button = document.createElement('button');
            button.setAttribute('cl-pagination', 'number');
            button.classList.add('card-text-subtitle_pagination-number');
            button.textContent = page;
            button.classList.toggle('active', page === currentPage);
            button.addEventListener('click', function() {
                currentPage = page;
                showPage(currentPage);
            });
            pagination.insertBefore(button, insertBeforeElement);
        }

        function addEllipsis() {
            const ellipsis = document.createElement('button');
            ellipsis.setAttribute('cl-pagination', 'number');
            ellipsis.classList.add('card-text-subtitle_pagination-number'); //Change the class name with your preference
            ellipsis.textContent = '...';
            ellipsis.disabled = true;
            pagination.insertBefore(ellipsis, insertBeforeElement);
        }

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                addButton(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    addButton(i);
                }
                addEllipsis();
                addButton(totalPages);
            } else if (currentPage >= totalPages - 2) {
                addButton(1);
                addEllipsis();
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    addButton(i);
                }
            } else {
                addButton(1);
                addEllipsis();
                addButton(currentPage - 1);
                addButton(currentPage);
                addButton(currentPage + 1);
                addEllipsis();
                addButton(totalPages);
            }
        }

        if (prevArrow) {
            prevArrow.onclick = function() {
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage);
                }
            };
        }

        if (nextArrow) {
            nextArrow.onclick = function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage);
                }
            };
        }
    }

    function updateArrowVisibility() {
        const prevArrow = pagination.querySelector('[cl-pagination="prev"]');
        const nextArrow = pagination.querySelector('[cl-pagination="next"]');

        if (prevArrow) prevArrow.style.visibility = currentPage === 1 ? 'hidden' : 'visible';
        if (nextArrow) nextArrow.style.visibility = currentPage === totalPages ? 'hidden' : 'visible';
    }

    function handleResize() {
        const oldCardsPerPage = cardsPerPage;
        updateCardsPerPage();

        if (oldCardsPerPage !== cardsPerPage) {
            currentPage = 1;
            createPaginationButtons();
            updatePaginationVisibility();
            showPage(currentPage);
        }
    }

    if (grid && pagination) {
        updateCardsPerPage();
        updatePaginationVisibility();
        initializeCardVisibility();

        if (totalPages > 1) {
            createPaginationButtons();
        }

        showPage(currentPage);

        window.addEventListener('resize', handleResize);
    }
});
</script>
