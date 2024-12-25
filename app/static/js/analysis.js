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
    const choix_k = document.getElementById('n_neighbors');
    const type_distance = document.getElementById('type_distance');
    const algo_type = document.getElementById('Algotype') ; 

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
console.log("Parameters:", allParams);

// Initially hide all parameter sections
allParams.forEach(param => {
    param.style.display = 'none';
});

// Declare a global variable to store the clicked button text
let Algo_Choice = "";

// Add event listeners to each button
buttons.forEach(button => {
    button.addEventListener('click', function () {
        // Get and store the text value of the clicked button
        Algo_Choice  = button.textContent.trim(); // Remove extra spaces
        console.log("Clicked button text:", Algo_Choice );

        // Get the target ID (e.g., #knnParams)
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

        // Remove 'active' class from all buttons
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Add 'active' class to the clicked button
        button.classList.add('active');
        console.log("Button classes after click:", button.classList.value);
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

    // Function to get regression parameters
    const getKNNParameters = () => {
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
            //includeIntercept: includeIntercept.value,
            // regularizationMethod: regularization.value,
            choix_k: choix_k.value,
            type_distance: type_distance.value


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

        // Log the chosen algorithm
        console.log("Algorithm chosen is:", Algo_Choice);

        const selectedFile = fileSelect.value;
        const target = columnSelect.value;

        // Validate inputs
        if (!target) {
            alert('Veuillez sélectionner une colonne cible pour l\'entraînement du modèle.');
            return;
        }

        if (!selectedFile) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }

        // Prepare request data based on the selected algorithm
        let requestData = null;

        if (Algo_Choice === "KNN") {
            const parameters = getKNNParameters(); // Call your function to get KNN-specific parameters
            requestData = {
                file: selectedFile,
                algorithm: 'KNN',
                parameters,
            };
        } else if (Algo_Choice === "Régression Linéaire") {
            const parameters = getRegressionParameters(); // Call your function to get regression-specific parameters
            requestData = {
                file: selectedFile,
                algorithm: 'Regression',
                parameters,
            };
        } else {
            alert('Veuillez sélectionner un algorithme valide.');
            return;
        }

        try {
            // Send request to the backend
            const response = await fetch('/training/train_model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log('Response from server:', data);

            // Handle the response and display results
            if (data.status === 'success') {
                if (data.algorithm === 'KNN' && data.performance) {
                    displayKNNResults(data.performance); // Call function to display KNN results
                } else if (data.algorithm === 'Regression' && data.performance) {
                    displayRegressionResults(data.performance); // Call function to display regression results
                }
            } else if (data.message && data.message.includes("The provided dataset does not contain a")) {
                alert('La colonne cible sélectionnée est manquante ou invalide dans le fichier.');
            } else {
                alert('Erreur lors de l\'entraînement du modèle.');
            }
        } catch (error) {
            console.error('Error sending data:', error);
            alert('Une erreur s\'est produite lors de l\'envoi des données.');
        }
    });
}

}); 