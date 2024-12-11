document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const previewSection = document.getElementById('previewSection');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const btnNext = document.getElementById('btnNext');
    const progressBar = document.getElementById('progressBar');

    // New button and data information div
    const btnShowDataInfo = document.getElementById('btnShowDataInfo');
    const dataInfoSection = document.getElementById('dataInfoSection');
    const fileSizeDiv = document.getElementById('fileSize');
    const numRowsDiv = document.getElementById('numRows');
    const numColumnsDiv = document.getElementById('numColumns');
    const columnTypesDiv = document.getElementById('columnTypes');
    const descriptionDiv = document.getElementById('description');

    let dataLoaded = false;

    // Function to create table rows for preview
    function createTablePreview(data) {
        tableHeader.innerHTML = ''; // Clear previous headers
        tableBody.innerHTML = '';   // Clear previous rows

        // Generate Table Headers
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // Generate Table Rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Function to simulate progress bar
    function simulateProgressBar() {
        const progressBarFill = document.querySelector('.progress-bar');
        let progress = 0;

        return new Promise(resolve => {
            const interval = setInterval(() => {
                progress += 5;
                progressBarFill.style.width = `${progress}%`;
                progressBarFill.textContent = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    // Handle file input changes
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileContent = e.target.result;

                try {
                    let data;
                    if (file.name.endsWith('.json')) {
                        data = JSON.parse(fileContent);
                    } else if (file.name.endsWith('.csv')) {
                        data = Papa.parse(fileContent, { header: true }).data; // Using PapaParse for CSV
                    } else {
                        alert('Format de fichier non supporté.');
                        return;
                    }

                    if (data.length > 0) {
                        previewSection.classList.remove('d-none');
                        btnNext.disabled = true; // Initially disable during progress
                        await simulateProgressBar(); // Simulate loading progress
                        createTablePreview(data); // Load table preview
                        btnNext.disabled = false; // Enable button after data loads
                        dataLoaded = true;
                    }
                } catch (error) {
                    alert('Erreur lors du chargement des données.');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Handle drag-and-drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });

    // Button Event Handling for sending the file via AJAX
    btnNext.addEventListener('click', () => {
        if (dataLoaded) {
            // Prepare the FormData object
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            // Send the file via AJAX (POST request)
            fetch('/import_routes/upload', {  // Corrected URL path
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (data.file_info) {
                    // Display file information in the data info section
                    fileSizeDiv.textContent = `Taille du fichier: ${data.file_info.file_size} bytes`;
                    numRowsDiv.textContent = `Nombre de lignes: ${data.file_info.num_rows}`;
                    numColumnsDiv.textContent = `Nombre de colonnes: ${data.file_info.num_columns}`;
                    columnTypesDiv.textContent = `Types de données des colonnes: ${data.file_info.data_types.join(', ')}`;
                    descriptionDiv.textContent = `Colonnes: ${data.file_info.columns.join(', ')}`;
                }

                if (data.message) {
                    alert(data.message); // Show success message
                } else if (data.error) {
                    alert(data.error); // Show error message
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de l\'envoi du fichier.');
            });
        }
    });

    // New Button for showing data information
    btnShowDataInfo.addEventListener('click', () => {
        if (dataLoaded) {
            // Toggle the visibility of the data info section
            dataInfoSection.classList.toggle('d-none');
        }
    });
});
