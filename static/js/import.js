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

        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

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
                        await simulateProgressBar();
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
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr><th>Attribut</th><th>Valeur</th></tr>
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
                        <h5>Valeurs Manquantes et Valeurs Uniques</h5>
                        <table class="table table-bordered table-striped">
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
                    plotImageDiv.innerHTML = `
                        <h5>Top 2 Frequent Categorical Values</h5>
                        <img src="data:image/png;base64,${data.preprocessing_results.top_categorical_plot}" class="img-fluid" alt="Top Categorical Plot">
                    `;
                   
                }

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
