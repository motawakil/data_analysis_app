let currentFileName = null;

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const processingOptions = document.getElementById('processingOptions');
    const btnNext = document.getElementById('btnNext');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    // File input handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Data processing buttons
    document.getElementById('btnClean').addEventListener('click', () => {
        processData(['clean']);
    });

    document.getElementById('btnFillMissing').addEventListener('click', () => {
        processData(['fill_missing']);
    });

    document.getElementById('btnApplyTransformations').addEventListener('click', () => {
        const operations = [];
        if (document.getElementById('normalizeCheck').checked) {
            operations.push('normalize');
        }
        processData(operations);
    });
});

function handleFile(file) {
    currentFileName = file.name;
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showError(data.error);
        } else {
            showPreview(data);
            document.getElementById('previewSection').classList.remove('d-none');
            document.getElementById('processingOptions').classList.remove('d-none');
            document.getElementById('btnNext').disabled = false;
        }
    })
    .catch(error => {
        showError('Error uploading file: ' + error.message);
    });
}

function showPreview(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    
    // Clear existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Add headers
    data.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        tableHeader.appendChild(th);
    });
    
    // Add data rows
    data.data.forEach(row => {
        const tr = document.createElement('tr');
        data.columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function processData(operations) {
    if (!currentFileName) return;

    fetch('/process_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: currentFileName,
            operations: operations
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showError(data.error);
        } else {
            showPreview({ columns: Object.keys(data.preview[0]), data: data.preview });
            showSuccess('Data processed successfully');
        }
    })
    .catch(error => {
        showError('Error processing data: ' + error.message);
    });
}

function showError(message) {
    // Implement error notification
    alert(message);
}

function showSuccess(message) {
    // Implement success notification
    alert(message);
}
