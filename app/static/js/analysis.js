document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.getElementById('fileSelect');
    const btnTrain = document.getElementById('btnTrain');
    const splitType = document.getElementById('splitType');
    const splitOptions = document.getElementById('splitOptions');
    const trainTestPercentage = document.getElementById('trainTestPercentage');
    const kFold = document.getElementById('kFold');
    const standardisation = document.getElementById('standardisation');
    const missingValues = document.getElementById('missingValues');
    const categoricalEncoding = document.getElementById('categoricalEncoding');
    const hyperparameterSearch = document.getElementById('hyperparameterSearch');
    const includeIntercept = document.getElementById('includeIntercept');
    const regularization = document.getElementById('regularization');
    const columnSelect = document.getElementById('columnSelect');

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

    // Fetch columns based on the selected file
    const fetchColumns = async () => {
        const fileName = fileSelect.value;
        if (!fileName) {
            columnSelect.innerHTML = '<option value="">Sélectionner une colonne cible</option>'; // Reset column dropdown
            return;
        }

        try {
            const response = await fetch(`/training/get-columns?filename=${fileName}`);
            const data = await response.json();

            if (data.status === 'success') {
                const columns = data.columns;

                // Reset and populate the column dropdown
                columnSelect.innerHTML = '<option value="">Sélectionner une colonne cible</option>';
                columns.forEach(column => {
                    const option = document.createElement('option');
                    option.value = column;
                    option.textContent = column;
                    columnSelect.appendChild(option);
                });
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    // Event Listener for File Selection
    fileSelect.addEventListener('change', fetchColumns);

    // Get all the algorithm selection buttons
    const buttons = document.querySelectorAll('.btn-light');

    // Get all the parameter sections
    const allParams = document.querySelectorAll('.tab-pane');

    // Initially hide all parameter sections
    allParams.forEach(param => {
        param.style.display = 'none';
    });

    // Add event listeners to each button
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the target ID (which parameter section to display)
            const targetId = button.getAttribute('data-target');

            // Hide all parameter sections
            allParams.forEach(param => {
                param.style.display = 'none';
            });

            // Show the selected parameter section
            const targetParam = document.querySelector(targetId);
            if (targetParam) {
                targetParam.style.display = 'block';
            }
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to the clicked button
            button.classList.add('active');
        });
    });

    // Handle split type change
    splitType.addEventListener('change', () => {
        const selectedType = splitType.value;

        // Hide both options initially
        splitOptions.querySelector('.train-test-options').style.display = 'none';
        splitOptions.querySelector('.k-fold-options').style.display = 'none';

        // Show the selected option
        if (selectedType === 'train_test') {
            splitOptions.querySelector('.train-test-options').style.display = 'block';
        } else if (selectedType === 'k_fold') {
            splitOptions.querySelector('.k-fold-options').style.display = 'block';
        }
    });

    // Function to get regression parameters
    const getRegressionParameters = () => {
        const splitTypeValue = splitType.value;
        const target = columnSelect.value;
        let splitDetail = '';

        if (splitTypeValue === 'train_test') {
            splitDetail = trainTestPercentage.value;
        } else if (splitTypeValue === 'k_fold') {
            splitDetail = kFold.value;
        }

        return {
            splitType: splitTypeValue,
            splitDetail,
            target,
            standardisation: standardisation.value,
            missingValuesHandling: missingValues.value,
            encodingMethod: categoricalEncoding.value,
            hyperparameterSearch: hyperparameterSearch.value,
            includeIntercept: includeIntercept.value,
            regularizationMethod: regularization.value,
        };
    };

    // Function to display regression results dynamically
    function displayRegressionResults(performance) {
        // Hide classification results
        const regressionCard = document.getElementById("regressionResultsCard");
        regressionCard.style.display = "block";

        // Update regression metrics
        document.getElementById("mseValue").textContent = performance.mean_squared_error.toFixed(2);
        document.getElementById("maeValue").textContent = performance.mean_absolute_error.toFixed(2);
        document.getElementById("r2Value").textContent = performance.r2_score.toFixed(2);

        // Update progress bars
        const maxR2 = 1; // Assuming R² ranges from 0 to 1
        document.getElementById("mseBar").style.width = `${Math.min(100, performance.mean_squared_error / 100000)}%`;
        document.getElementById("maeBar").style.width = `${Math.min(100, performance.mean_absolute_error / 1000)}%`;
        document.getElementById("r2Bar").style.width = `${Math.min(100, (performance.r2_score / maxR2) * 100)}%`;
    }

    // Handle form submission for model training
    if (btnTrain) {
        btnTrain.addEventListener('click', async (e) => {
            e.preventDefault();
    
            const selectedFile = fileSelect.value;
            const target = columnSelect.value;
    
            // Check if the user selected the target column
            if (!target) {
                alert('Veuillez sélectionner une colonne cible pour l\'entraînement du modèle.');
                return;
            }
    
            if (!selectedFile) {
                alert('Veuillez sélectionner un fichier.');
                return;
            }
    
            const parameters = getRegressionParameters();
            const requestData = {
                file: selectedFile,
                algorithm: 'Regression',
                parameters,
            };
    
            try {
                const response = await fetch('/training/train_model', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
    
                const data = await response.json();
                console.log('Response from server:', data);
    
                if (data.status === 'success' && data.performance) {
                    // Display regression performance results
                    displayRegressionResults(data.performance);
                } else if (data.message && data.message.includes("The provided dataset does not contain a")) {
                    // Alert for missing target column
                    alert('La colonne cible sélectionnée est manquante ou invalide dans le fichier.');
                } else {
                    alert('Erreur lors de l\'entraînement du modèle');
                }
            } catch (error) {
                console.error('Error sending data:', error);
            }
        });
    }
    

});
