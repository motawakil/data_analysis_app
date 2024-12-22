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
    const goToVisualizationButton = document.getElementById('goToVisualizationButton');


    
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
                goToVisualizationButton.classList.remove('d-none');
                preprocessingDiv.innerHTML = `
                    
                    ${preprocessingDiv.innerHTML}
                `;

                // Scroll to the message
                preprocessingDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Erreur: ' + data.message);
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
        const data = [];
        
        rows.forEach(row => {
            const rowData = {};
            const cells = row.querySelectorAll('td:not(:last-child)');
            headers.forEach((header, index) => {
                rowData[header] = cells[index].textContent;
            });
            data.push(rowData);
        });
        
        return data;
    }


    
    // New sections
    const btnShowDataInfo = document.getElementById('btnShowDataInfo');
    const dataInfoSection = document.getElementById('dataInfoSection');
    const preprocessingDiv = document.getElementById('preprocessingResults');
    const plotImageDiv = document.getElementById('plotImageDiv'); // Container for the image

    let dataLoaded = false;

    // Function to create table rows for preview
    function createTablePreview(data) {
        if (!data || data.length === 0) {
            console.error('No data available for preview.');
            return;
            
        }
        
        // Remove the d-none class to make the preview section visible
        previewSection.classList.remove('d-none');


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

            let hasMissingValues = false;
            // Add data cells
            headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header];
                td.textContent = value;
                td.dataset.original = value;
                td.dataset.column = header;
    
                // Check for missing values
                if (!value || value.toString().trim() === '') {
                    td.classList.add('missing-value');
                    hasMissingValues = true;
                }
    
                tr.appendChild(td);
            });

             // Add highlighting for rows with missing values
            if (hasMissingValues) {
            tr.classList.add('missing-row');
        }

            
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
        // Add legend
    const legend = document.createElement('div');
    legend.className = 'missing-values-legend';
    legend.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle text-danger me-2"></i>
            <span>Les cellules surlignées en rouge indiquent des valeurs manquantes</span>
        </div>
    `;
    previewSection.querySelector('.card-body').appendChild(legend);
}
        
    
    function toggleEditMode(row, editBtn) {
    const cells = row.querySelectorAll('td:not(:last-child)');
    const isEditing = row.classList.contains('editing');

    if (isEditing) {
        // 
        //  mode
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
// Replace the progress bar related code with this:
function simulateProgressBar() {
    const progressBarContainer = document.getElementById('progressBarContainer');
    if (!progressBarContainer) {
        console.error('Progress bar container not found');
        return Promise.resolve();
    }

    const progressBarFill = progressBarContainer.querySelector('.progress-bar');
    progressBarContainer.classList.remove('d-none');
    let progress = 0;

    return new Promise(resolve => {
        const interval = setInterval(() => {
            progress += 5;
   
            progressBarFill.style.width = `${progress}%`;
            progressBarFill.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                progressBarContainer.classList.add('d-none');
                resolve();
            }
        }, 100);
    });
}

    // File input change handler
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const formData = new FormData();
                formData.append('file', file);
    
                try {
                    const response = await fetch('/import_routes/upload', {
                        method: 'POST',

                        body: formData
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to upload Excel file');
                    }
    
                    const data = await response.json();
                    
                    previewSection.classList.remove('d-none');
                    btnNext.disabled = true;
                    await simulateProgressBar();
                    createTablePreview(data.data);
                    btnNext.disabled = false;
                    dataLoaded = true;
                } catch (error) {
                    console.error('Excel upload error:', error);
                    alert('Erreur lors du chargement du fichier Excel.');
                }
                return;
            }
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
document.getElementById("downloadPageButton").addEventListener("click", function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yOffset = 20;

    // Set document title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Data Import Report", doc.internal.pageSize.getWidth() / 2, yOffset, { align: "center" });
    yOffset += 20;


    // 2. Add File Information Table
    const infoTable = document.querySelector('.table.table-bordered.table-striped');
    if (infoTable) {
        // Add section title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("File Information", 20, yOffset);
        yOffset += 10;

        // Get table data
        const infoRows = Array.from(infoTable.querySelectorAll('tbody tr'))
            .map(row => [
                row.querySelector('td:first-child').textContent,
                row.querySelector('td:last-child').textContent
            ]);

        // Draw table
        doc.autoTable({
            head: [['Attribute', 'Value']],
            body: infoRows,
            startY: yOffset,
            theme: 'grid',
            styles: { fontSize: 8 },
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
        });

        yOffset = doc.lastAutoTable.finalY + 20;
    }
    // 4 add processing resulets 
    const preprocessingDiv = document.getElementById('preprocessingResults');
    if (preprocessingDiv) {
        // Add section title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Preprocessing Results", 20, yOffset);
        yOffset += 10;

        // Get preprocessing table data
        const preprocessingTable = preprocessingDiv.querySelector('table');
        if (preprocessingTable) {
            const preprocessingHeaders = Array.from(preprocessingTable.querySelectorAll('thead th'))
                .map(th => th.textContent);
            
            const preprocessingRows = Array.from(preprocessingTable.querySelectorAll('tbody tr'))
                .map(row => Array.from(row.querySelectorAll('td'))
                    .map(cell => cell.textContent));

            // Draw preprocessing table
            doc.autoTable({
                head: [preprocessingHeaders],
                body: preprocessingRows,
                startY: yOffset,
                theme: 'grid',
                styles: { fontSize: 8 },
                margin: { top: 20, right: 20, bottom: 20, left: 20 }
            });

            yOffset = doc.previousAutoTable.finalY + 20;
        }
    }
    /// 3. Add Plot Image
const plotImage = document.querySelector('#plotImageDiv img');
if (plotImage && !plotImage.classList.contains('d-none')) {
    doc.addPage();

    // Increase starting position from top
    yOffset = 30; // Changed from 5 to 30

    // Add section title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Data Visualization", 20, yOffset);
    yOffset += 20; // Changed from -10 to +20 to move down after title

    // Calculate image dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (plotImage.height * imgWidth) / plotImage.width;

    // Add image with adjusted position
    doc.addImage(
        plotImage.src,
        'PNG',
        20,
        yOffset,
        imgWidth,
        imgHeight
    );
}

    // Save the PDF
    doc.save("data_import_report.pdf");
});








// Add this new function to collect table data
function getTableData() {
    const table = document.getElementById('previewTable');
    const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => th.textContent)
        .filter(header => header !== 'Actions');
    
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const data = [];
    
    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td:not(:last-child)');
        headers.forEach((header, index) => {
            rowData[header] = cells[index].textContent;
        });
        data.push(rowData);
    });
    
    return data;
}





// Update prepare data button click handler
document.getElementById('prepareDataButton').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('filenameModal'));
    modal.show();
});

document.getElementById('saveFileBtn').addEventListener('click', async () => {
    try {
        const filename = document.getElementById('customFilename').value.trim();
        if (!filename) {
            alert('Veuillez entrer un nom de fichier');
            return;
        }

        const tableData = getTableData();
        console.log('Sending data:', { tableData, filename }); // Debug log

        const response = await fetch('/import_routes/prepare_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tableData: tableData,
                filename: filename
            })
        });

        const data = await response.json();        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors du traitement');
        }

        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('filenameModal'));
        modal.hide();

        // Show success message
        const preprocessingDiv = document.getElementById('preprocessingResults');
        preprocessingDiv.classList.remove('d-none');
        preprocessingDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                ${data.message}
            </div>
        `;

    } catch (error) {
        console.error('Error:', error);
        alert('Erreur: ' + error.message);
    }
});

