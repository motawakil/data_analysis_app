document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const previewSection = document.getElementById('previewSection');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const btnNext = document.getElementById('btnNext');
    const actionButtons = document.getElementById('actionButtons');
    const progressBar = document.getElementById('progressBar');
    
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


        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            // Add data cells
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                td.setAttribute('data-original', row[header]);
                tr.appendChild(td);
            });
            
             // Add action buttons cell
            const actionsTd = document.createElement('td');
            actionsTd.style.textAlign = 'center';
        
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning btn-sm me-2';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier';
            editBtn.onclick = () => editRow(tr);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
            deleteBtn.onclick = () => deleteRow(tr);

            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);
            tr.appendChild(actionsTd);
        
            tableBody.appendChild(tr);
        });
        
    }
            
    // Add these new functions for edit and delete functionality
function deleteRow(row) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
        row.remove();
    }
}

function editRow(row) {
    const cells = row.getElementsByTagName('td');
    const lastIndex = cells.length - 1; // Skip the actions cell

    for (let i = 0; i < lastIndex; i++) {
        const cell = cells[i];
        const originalValue = cell.getAttribute('data-original');
        const newValue = prompt('Modifier la valeur:', cell.textContent);
        
        if (newValue !== null) {
            cell.textContent = newValue;
        }
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

// Event listener for "Save Dataset" button
document.getElementById("saveDatasetButton").addEventListener("click", function () {
    // Trigger the save dataset functionality by navigating to the server route
    window.location.href = "/save_dataset";
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
