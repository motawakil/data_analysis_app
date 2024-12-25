console.log("test documentation js "); 
document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'form-control mb-4';
    searchInput.placeholder = 'Rechercher dans la documentation...';
    document.querySelector('.documentation-header').appendChild(searchInput);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const content = document.querySelectorAll('.card-body p, .card-body li, .accordion-body');
        
        content.forEach(element => {
            const text = element.textContent.toLowerCase();
            element.closest('.card, .accordion-item').style.display = 
                text.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Lazy loading for images
    const images = document.querySelectorAll('.video-thumbnail img');
    images.forEach(img => {
        img.loading = 'lazy';
    });

    // Interactive video thumbnails
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const videoId = thumbnail.dataset.videoId;
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            const iframe = document.querySelector('#videoModal iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            modal.show();
        });
    });

    // PDF Download functionality
    document.getElementById('downloadDocs').addEventListener('click', async () => {
        try {
            const response = await fetch('/download-documentation');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documentation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading documentation:', error);
        }
    });
});



document.addEventListener('DOMContentLoaded', () => {
    console.log("Documentation interactive JS loaded");

    // Filtrer les algorithmes via la recherche
    const searchInput = document.querySelector('.documentation-header input[type="search"]');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const algorithmCards = document.querySelectorAll('.algorithm-card');

        algorithmCards.forEach(card => {
            const content = card.textContent.toLowerCase();
            card.style.display = content.includes(query) ? 'block' : 'none';
        });
    });

    // Navigation fluide entre les onglets
    const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
    tabLinks.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(tab.getAttribute('href'));

            // Activer l'onglet sélectionné
            tabLinks.forEach(link => link.classList.remove('active'));
            tab.classList.add('active');

            // Afficher le contenu correspondant
            const tabContents = document.querySelectorAll('.tab-pane');
            tabContents.forEach(content => content.classList.remove('show', 'active'));
            target.classList.add('show', 'active');
        });
    });

    console.log("Tabs and search functionalities enabled");




    // Add this to your existing DOMContentLoaded event listener
    const initFAQ = () => {
        const faqSearch = document.getElementById('faqSearch');
        const categoryButtons = document.querySelectorAll('.faq-categories .btn');
        const faqItems = document.querySelectorAll('.accordion-item');
        let currentCategory = 'all';

    // Category filter
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                currentCategory = category;
            
                categoryButtons.forEach(btn => btn.classList.remove('active'));
             button.classList.add('active');
            
                filterFAQs(faqSearch.value, category);
            });
        });

    // Search filter
        faqSearch.addEventListener('input', () => {
            filterFAQs(faqSearch.value, currentCategory);
        });

        function filterFAQs(searchTerm, category) {
            const search = searchTerm.toLowerCase();
        
            faqItems.forEach(item => {
                const question = item.querySelector('.accordion-button').textContent.toLowerCase();
                const answer = item.querySelector('.accordion-body').textContent.toLowerCase();
                const itemCategory = item.dataset.category;
            
                const matchesSearch = question.includes(search) || answer.includes(search);
                const matchesCategory = category === 'all' || itemCategory === category;
            
                item.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
            });
        }
    };
    initFAQ();
    });


    /* filepath: /c:/Users/DELL/Desktop/python project/data_analysis_app/app/static/js/documentation.js */
// Add to existing DOMContentLoaded event

const initTables = () => {
    document.querySelectorAll('.table-search').forEach(search => {
        search.addEventListener('input', (e) => {
            const table = e.target.closest('.table-container').querySelector('.doc-table');
            const rows = table.querySelectorAll('tbody tr');
            const query = e.target.value.toLowerCase();

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    });

    document.querySelectorAll('.doc-table th').forEach(header => {
        header.addEventListener('click', () => {
            const table = header.closest('table');
            const index = Array.from(header.parentElement.children).indexOf(header);
            sortTable(table, index);
        });
    });
};

const sortTable = (table, column) => {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const direction = table.dataset.sortDir === 'asc' ? -1 : 1;
    
    rows.sort((a, b) => {
        const aVal = a.children[column].textContent;
        const bVal = b.children[column].textContent;
        return direction * aVal.localeCompare(bVal);
    });
    
    table.dataset.sortDir = direction === 1 ? 'asc' : 'desc';
    rows.forEach(row => table.querySelector('tbody').appendChild(row));
};

initTables();





document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const algorithmTable = document.getElementById('algorithm-table');
    const rows = algorithmTable.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const matches = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchTerm));
            row.style.display = matches ? '' : 'none';
        });
    });
});



// Add video player handling
document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('tutorial1');
    const overlay = document.querySelector('.video-overlay');
    const playButton = document.querySelector('.play-button');

    if (videoPlayer) {
        // Handle play/pause
        playButton.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
                overlay.style.opacity = '0';
            } else {
                videoPlayer.pause();
                overlay.style.opacity = '1';
            }
        });

        // Handle video end
        videoPlayer.addEventListener('ended', () => {
            overlay.style.opacity = '1';
        });

        // Handle video errors
        videoPlayer.addEventListener('error', (e) => {
            console.error('Video Error:', e);
            const fallback = document.querySelector('.video-fallback');
            if (fallback) {
                fallback.style.display = 'block';
            }
        });
    }
});
       
