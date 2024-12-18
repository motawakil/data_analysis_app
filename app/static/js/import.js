document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const previewSection = document.getElementById('previewSection');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const btnNext = document.getElementById('btnNext');
    const actionButtons = document.getElementById('actionButtons');
    const progressBar = document.getElementById('progressBar');



    const prepareDataButton = document.getElementById('prepareDataButton');
    
    prepareDataButton.addEventListener('click', async () => {
        try {
            // Show loading state
            prepareDataButton.disabled = true;
            prepareDataButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Préparation en cours...';

            const tableData = getTableData();
            
            const response = await fetch('/import_routes/prepare_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tableData })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update preprocessing results section with success message
                const preprocessingDiv = document.getElementById('preprocessingResults');
                preprocessingDiv.classList.remove('d-none');
                preprocessingDiv.innerHTML = `
                    
                    ${preprocessingDiv.innerHTML}
                `;

                // Scroll to the message
                preprocessingDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            // Show error message
            const preprocessingDiv = document.getElementById('preprocessingResults');
            preprocessingDiv.classList.remove('d-none');
            preprocessingDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erreur: ${error.message}
                </div>
            `;
        } finally {
            // Reset button state
            prepareDataButton.disabled = false;
            prepareDataButton.innerHTML = 'Préparer les données pour visualiser';
        }
    });

    function getTableData() {
        const table = document.getElementById('previewTable');
        const headers = Array.from(table.querySelectorAll('thead th'))
            .map(th => th.textContent)
            .filter(header => header !== 'Actions');
        
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = cells[index].textContent;
            });
            return rowData;
        });
    }


    
    // New sections
    const btnShowDataInfo = document.getElementById('btnShowDataInfo');
    const dataInfoSection = document.getElementById('dataInfoSection');
    const preprocessingDiv = document.getElementById('preprocessingResults');
    const plotImageDiv = document.getElementById('plotImageDiv'); // Container for the image

    let dataLoaded = false;

    // Function to create table rows for preview
    function createTablePreview(data) {
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';
        // Add data headers
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });


        // Add Actions header
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        actionsHeader.style.textAlign = 'center';
        tableHeader.appendChild(actionsHeader);


        data.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.dataset.rowIndex = rowIndex;
            // Add data cells
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                td.dataset.original = row[header];
                td.dataset.column = header;
                tr.appendChild(td);
            });
            
            const actionsTd = document.createElement('td');
            actionsTd.style.textAlign = 'center';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning btn-sm me-2';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier';
            editBtn.onclick = () => toggleEditMode(tr, editBtn);

             const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
            deleteBtn.onclick = () => tr.remove();

            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);
            tr.appendChild(actionsTd);
        
            tableBody.appendChild(tr);
        });
        
    }
    function toggleEditMode(row, editBtn) {
    const cells = row.querySelectorAll('td:not(:last-child)');
    const isEditing = row.classList.contains('editing');

    if (isEditing) {
        // Save mode
        row.classList.remove('editing');
        cells.forEach(cell => {
            cell.contentEditable = 'false';
            cell.classList.remove('editing-cell');
        });
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier';
    } else {
        // Edit mode
        row.classList.add('editing');
        cells.forEach(cell => {
            cell.contentEditable = 'true';
            cell.classList.add('editing-cell');
        });
        editBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
    }
}   



    
    // Simulate progress bar
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

    // File input change handler
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
                        data = Papa.parse(fileContent, { header: true }).data;
                    } else {
                        alert('Format de fichier non supporté.');
                        return;
                    }

                    if (data.length > 0) {
                        previewSection.classList.remove('d-none');
                        btnNext.disabled = true;
                        
                        // Show progress bar before simulation
                        const progressBarContainer = document.getElementById('progressBarContainer');
                        progressBarContainer.classList.remove('d-none');
                        
                        await simulateProgressBar();
                        
                        // Hide progress bar after completion
                        progressBarContainer.classList.add('d-none');
                        
                        createTablePreview(data);
                        btnNext.disabled = false;
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

    // Handle file upload to backend
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

                // File information display
                if (data.file_info) {
                    dataInfoSection.classList.remove('d-none');
                    dataInfoSection.innerHTML = `
                        <table class="table table-bordered table-striped" style="text-align: center; vertical-align: middle;">
                           <caption style="caption-side: top; text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 1.5em;">
                            Fiche Descriptive du Fichier Importé
                            </caption>
                            <thead>
                                <tr><th> Caractère </th><th> Valeur </th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Taille du fichier</td><td>${data.file_info.file_size} bytes</td></tr>
                                <tr><td>Type de fichier</td><td>${data.file_info.file_type}</td></tr>
                                <tr><td>Date d'importation</td><td>${data.file_info.upload_date}</td></tr>
                                <tr><td>Nombre de lignes</td><td>${data.file_info.num_rows}</td></tr>
                                <tr><td>Nombre de colonnes</td><td>${data.file_info.num_columns}</td></tr>
                                <tr><td>Types de données</td><td>${[...new Set(data.file_info.data_types)].join(', ')}</td></tr>
                            </tbody>
                        </table>
                    `;
                    document.getElementById('prepareDataButton').classList.remove('d-none');

                }
                

              // Display Preprocessing Results
                if (data.preprocessing_results) {
                    preprocessingDiv.classList.remove('d-none');
                    preprocessingDiv.innerHTML = `
                        <h5 style="caption-side: top; text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 1.5em;">Analyse des Valeurs Manquantes et Uniques</h5>
                        <table class="table table-bordered table-striped" style="text-align: center; vertical-align: middle;">
                        
            <thead>
                <tr>
                    <th>Nom de la Colonne</th>
                    <th>Valeurs Manquantes</th>
                    <th>% Manquantes</th>
                    <th>Valeurs Uniques</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(data.preprocessing_results.missing_values.total_missing).map(column => `
                    <tr>
                        <td>${column}</td>
                        <td>${data.preprocessing_results.missing_values.total_missing[column] || 0}</td>
                        <td>${(data.preprocessing_results.missing_values.percent_missing[column] || 0).toFixed(2)}%</td>
                        <td>${data.preprocessing_results.unique_values[column] || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

                console.log(data.preprocessing_results.top_categorical_plot);

               // Display Top Categorical Plot (Image)
            if (data.preprocessing_results.top_categorical_plot) {
            plotImageDiv.classList.remove('d-none');
            const title = " Frequent of Each Categorical column ";

            plotImageDiv.innerHTML = `
            <h5>${title}</h5>
            <img src="data:image/png;base64,${data.preprocessing_results.top_categorical_plot}" class="img-fluid" alt="${title}">
            `;
            }
            
                btnNext.style.display = 'none';
                
                document.getElementById('actionButtons').classList.remove('d-none');


                if (data.message) alert(data.message);
       

            })
            .catch(error => {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de l\'envoi du fichier.');
            });
        }
    });

    
});


// saving the page js code 
// Event listener for "Download Page as PDF" button
document.getElementById("downloadPageButton").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set title for the PDF
    doc.setFontSize(20);
    doc.text("Data Importation Results", 20, 20);

    let yOffset = 30; // Set starting Y position for content

    // Capture the content of the card-body sections (tables and plot)
    let content = document.querySelectorAll(".card-body");

    // Iterate through all card content and add them to the PDF
    content.forEach(function (section) {
        // Add text content of the section to the PDF
        doc.setFontSize(12);
        doc.text(section.innerText || section.textContent, 20, yOffset);

        // Adjust yOffset for the next section
        yOffset += 20;
    });

    // Add the plot image if it exists
    const plotImageDiv = document.getElementById('plotImageDiv');
    if (plotImageDiv) {
        let plotImage = plotImageDiv.querySelector('img');
        if (plotImage) {
            doc.addImage(plotImage.src, 'PNG', 20, yOffset, 180, 120);
            yOffset += 130; // Adjust the Y position after adding the image
        }
    }

    // Save the PDF with a filename
    doc.save("importation_results.pdf");
});








document.addEventListener('DOMContentLoaded', function() {
    const applyPreprocessingBtn = document.getElementById('applyPreprocessing');
    
    applyPreprocessingBtn.addEventListener('click', function() {
        const preprocessingOptions = {
            missingValues: document.getElementById('missingValuesStrategy').value,
            scaling: document.getElementById('scalingStrategy').value,
            encoding: document.getElementById('encodingStrategy').value,
            duplicates: document.getElementById('duplicatesStrategy').value
        };

        // Show loading state
        applyPreprocessingBtn.disabled = true;
        applyPreprocessingBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Traitement...';

        // Send preprocessing options to backend
        fetch('/apply_preprocessing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preprocessingOptions)
        })
        .then(response => response.json())
        .then(data => {
            // Update the preprocessing results section
            const preprocessingResults = document.getElementById('preprocessingResults');
            preprocessingResults.classList.remove('d-none');
            
            // Reset button state
            applyPreprocessingBtn.disabled = false;
            applyPreprocessingBtn.innerHTML = 'Appliquer les traitements <i class="fas fa-cogs ms-2"></i>';
            
            // Show success message
            alert('Prétraitement appliqué avec succès!');
        })
        .catch(error => {
            console.error('Error:', error);
            applyPreprocessingBtn.disabled = false;
            applyPreprocessingBtn.innerHTML = 'Appliquer les traitements <i class="fas fa-cogs ms-2"></i>';
            alert('Erreur lors du prétraitement');
        });
    });
});




// Add this new function to collect table data
function getTableData() {
    const table = document.getElementById('previewTable');
    const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => th.textContent)
        .filter(header => header !== 'Actions');
    
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = cells[index].textContent;
        });
        return rowData;
    });
}

// Add event listener for prepare data button
document.getElementById('prepareDataButton').addEventListener('click', async () => {
    try {
        const button = document.getElementById('prepareDataButton');
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Préparation en cours...';

        const tableData = getTableData();
        
        const response = await fetch('/import_routes/prepare_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tableData })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Update preprocessing results section
            const preprocessingDiv = document.getElementById('preprocessingResults');
            preprocessingDiv.innerHTML = `
                <div class="card-body">
                    <h5 class="alert alert-success">
                        ${data.message}
                        <br>
                       
                    </h5>
                    <!-- Display preprocessing results here -->
                </div>
            `;
            preprocessingDiv.classList.remove('d-none');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert('Erreur: ' + error.message);
    } finally {
        const button = document.getElementById('prepareDataButton');
        button.disabled = false;
        button.innerHTML = 'Préparer les données pour visualiser';
    }
});

