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

    
 // Existing imports and logic...

const preprocessingDiv = document.getElementById('preprocessingResults'); // New section to show preprocessing results
// Updated AJAX logic

btnNext.addEventListener('click', () => {
    if (dataLoaded) {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        fetch('/import_routes/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
 // Display file information
if (data.file_info) {
    dataInfoSection.classList.remove('d-none'); // Ensure section is visible
    dataInfoSection.innerHTML = ''; // Clear previous content

    // Create Table
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-striped'); // Add Bootstrap table classes
    table.innerHTML = `
        <thead>
            <tr>
                <th>Attribut</th>
                <th>Valeur</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Taille du fichier</td>
                <td>${data.file_info.file_size} bytes</td>
            </tr>
            <tr>
                <td>Type de fichier</td>
                <td>${data.file_info.file_type}</td>
            </tr>
            <tr>
                <td>Date d'importation</td>
                <td>${data.file_info.upload_date}</td>
            </tr>
            <tr>
                <td>Nombre de lignes</td>
                <td>${data.file_info.num_rows}</td>
            </tr>
            <tr>
                <td>Nombre de colonnes</td>
                <td>${data.file_info.num_columns}</td>
            </tr>
            <tr>
                <td>Types de données des colonnes</td>
                <td>
                    ${[...new Set(data.file_info.data_types)].join(', ')} 
                    <!-- Avoid repetition using Set -->
                </td>
            </tr>
        </tbody>
    `;

    // Append the table to the dataInfoSection
    dataInfoSection.appendChild(table);
}



            // Display preprocessing results: Missing Values Table
            if (data.preprocessing_results) {
                preprocessingDiv.classList.remove('d-none'); // Unhide section
                preprocessingDiv.innerHTML = '<h5>Valeurs Manquantes et Valeurs Uniques</h5>'; // Reset content

                const totalMissing = data.preprocessing_results.missing_values?.total_missing || {};
                const percentMissing = data.preprocessing_results.missing_values?.percent_missing || {};
                const uniqueValues = data.preprocessing_results?.unique_values || {};

                // Generate Table
                const table = document.createElement('table');
                table.classList.add('table', 'table-bordered', 'table-striped'); // Add Bootstrap table classes
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Nom de la Colonne</th>
                            <th>Nombre de Valeurs Manquantes</th>
                            <th>Pourcentage de Valeurs Manquantes (%)</th>
                            <th>Nombre de Valeurs Uniques</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;

                const tbody = table.querySelector('tbody');
                
                // Iterate over columns and append rows to the table
                for (const column in totalMissing) {
                    const row = document.createElement('tr');
                    const missingValue = totalMissing[column] || 0;
                    const missingPercent = percentMissing[column] || 0;
                    const uniqueValueCount = uniqueValues[column] || 0;

                    row.innerHTML = `
                        <td>${column}</td>
                        <td>${missingValue}</td>
                        <td>${missingPercent.toFixed(2)}</td>
                        <td>${uniqueValueCount}</td>
                    `;
                    tbody.appendChild(row);
                }

                // Append the table to the preprocessingDiv
                preprocessingDiv.appendChild(table);
            }

            if (data.message) {
                alert(data.message);
            } else if (data.error) {
                alert(data.error);
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
