document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.getElementById('fileSelect');
    const btnConfirmModel = document.getElementById('btnConfirmModel');
    const modelForm = document.getElementById('modelForm');
    const algorithmSelect = document.getElementById('algorithmSelect'); // Dropdown for algorithm selection

    // Fetch available files
    const fetchFiles = async () => {
        try {
            const response = await fetch('/training/get-files');
            const files = await response.json();
            fileSelect.innerHTML = '<option value="">Sélectionner un fichier</option>';
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file.id;
                option.textContent = file.name;
                fileSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Initial fetch of files
    fetchFiles();

    // Handle "Confirm Model" button click
    btnConfirmModel.addEventListener('click', async (event) => {
        event.preventDefault();

        // Collect form data
        const selectedFile = fileSelect.value;
        const algorithm = algorithmSelect.value;
        const formData = new FormData(modelForm);

        // Collect additional parameters
        const parameters = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && key !== 'algorithm') {
                parameters[key] = value;
            }
        });

        // Prepare request payload
        const payload = {
            file: selectedFile,
            algorithm: algorithm,
            parameters: parameters
        };

        try {
            const response = await fetch('/training/train_model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('Server Response:', result);
            alert(result.message); // Show success message
        } catch (error) {
            console.error('Error sending form data:', error);
        }
    });
});
