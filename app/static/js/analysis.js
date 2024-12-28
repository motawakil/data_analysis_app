document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.getElementById('fileSelect');
    const btnTrain = document.getElementById('btnTrain');
    const splitTypeElements = document.querySelectorAll('.splitType');
    const splitOptiontest = document.querySelectorAll('.splitOption1');
    const splitOptionfold = document.querySelectorAll('.splitOption2');
    const standardisationElements = document.querySelectorAll('.standardisation');
    const missingValuesElements = document.querySelectorAll('.missingValues');
    const categoricalEncoding = document.querySelectorAll('.categoricalEncoding');
    const hyperparameterSearch = document.querySelectorAll('.hyperparam_selection');
    const includeIntercept = document.getElementById('includeIntercept');
    const regularization = document.getElementById('regularization');
    const columnSelectElements = document.querySelectorAll('.columnSelect');
    const choix_k = document.getElementById('n_neighbors');
    const type_distance = document.getElementById('type_distance');
    const buttons = document.querySelectorAll('.btn-light');
    const allParams = document.querySelectorAll('.tab-pane');
    const allTestOptions = document.querySelectorAll('.train-test-options');
    const allFoldOptions = document.querySelectorAll('.k-fold-options');


    let Algo_Choice = "";


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
            columnSelectElements.forEach(select => {
                select.innerHTML = '<option value="">Sélectionner une colonne cible</option>'; // Reset column dropdown
            });
            return;
        }
    
        try {
            const response = await fetch(`/training/get-columns?filename=${fileName}`);
            const data = await response.json();
    
            if (data.status === 'success') {
                const columns = data.columns;
    
                // Reset and populate all column dropdowns
                columnSelectElements.forEach(select => {
                    select.innerHTML = '<option value="">Sélectionner une colonne cible</option>';
                    columns.forEach(column => {
                        const option = document.createElement('option');
                        option.value = column;
                        option.textContent = column;
                        select.appendChild(option);
                    });
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

 

/**************************************************************

Functions to Get the last choosen elements for standardisation and missing values and other selections 


************************************/
const getSelectedChoices = () => {
    const columnSelectElements = document.querySelectorAll('.columnSelect');
    let lastNonEmptyValue = null; // Initialize with null

    for (const select of columnSelectElements) {
        if (select.value) { // Check if the value is not empty or null
            lastNonEmptyValue = select.value; // Update with the latest non-empty value
        }
    }
    return lastNonEmptyValue; // Return the last non-empty value found, or null if none
};

    const getLastStandardisationChoice = () => {
        
        let lastNonEmptyValue = null; // Initialize with null
    
        for (const select of standardisationElements) {
            if (select.value) { // Check if the value is not empty or null
                lastNonEmptyValue = select.value; // Update with the latest non-empty value
            }
        }
        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };
    const getLastMissingValuesChoice = () => {
        
        let lastNonEmptyValue = null; // Initialize with null
    
        for (const select of missingValuesElements) {
            if (select.value) { // Check if the value is not empty or null
                lastNonEmptyValue = select.value; // Update with the latest non-empty value
            }
        }
        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };
  
    // Function to get the last selected choice for split types
    const getLastSplitChoice = () => {
        let lastNonEmptyValue = null; // Initialize with null

        // Loop through all splitTypeElements to find the last non-empty value
        splitTypeElements.forEach((splitTypeElement) => {
            if (splitTypeElement.value) { // Check if the value is not empty
                lastNonEmptyValue = splitTypeElement.value; // Update with the latest non-empty value
            }
        });

        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };
    const getLastEncodingChoice = () => {
        let lastNonEmptyValue = null; // Initialize with null

        // Loop through all categoricalEncoding to find the last non-empty value
        categoricalEncoding.forEach((splitTypeElement) => {
            if (splitTypeElement.value) { // Check if the value is not empty
                lastNonEmptyValue = splitTypeElement.value; // Update with the latest non-empty value
            }
        });

        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };
    const getLastHyperChoice = () => {
        let lastNonEmptyValue = null; // Initialize with null

        // Loop through all hyperparameterSearch to find the last non-empty value
        hyperparameterSearch.forEach((splitTypeElement) => {
            if (splitTypeElement.value) { // Check if the value is not empty
                lastNonEmptyValue = splitTypeElement.value; // Update with the latest non-empty value
            }
        });

        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };
    
    // Function to get the last selected choice for Kfold 
    const getLastSplitValueKFOLD = () => {
        let lastNonEmptyValue = null; // Initialize with null

        // Loop through all splitTypeElements to find the last non-empty value
        splitOptionfold.forEach((splitTypeElement) => {
            if (splitTypeElement.value) { // Check if the value is not empty
                lastNonEmptyValue = splitTypeElement.value; // Update with the latest non-empty value
            }
        });

        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };

      // Function to get the last selected choice for split types
      const getLastSplitValueTest = () => {
        let lastNonEmptyValue = null; // Initialize with null

        // Loop through all splitTypeElements to find the last non-empty value
        splitOptiontest.forEach((splitTypeElement) => {
            if (splitTypeElement.value) { // Check if the value is not empty
                lastNonEmptyValue = splitTypeElement.value; // Update with the latest non-empty value
            }
        });

        return lastNonEmptyValue; // Return the last non-empty value found, or null if none
    };

 // Function to toggle the visibility of training parameters
function toggleTrainingParameters() {
    // Get all training parameter sections and dropdowns
 
    const trainingSections = document.querySelectorAll('.training_parameters');
    const hyperparamSelections = document.querySelectorAll('.hyperparam_selection');

    // Loop through all hyperparam dropdowns to handle visibility for their corresponding sections
    hyperparamSelections.forEach((dropdown, index) => {

        const selectedValue = dropdown.value; // Get the selected value
        const trainingSection = trainingSections[index]; // Get the corresponding section
     
        if (selectedValue === 'manual') {
          //  console.log("entering manual condition , now should make the training section visible ") ;
            trainingSection.style.display = 'block'; // Show the section
        } else {
            trainingSection.style.display = 'none'; // Hide the section
        }
    });
}


const displaySplitOptions = () => {
    const allTestOptions = document.querySelectorAll('.train-test-options');
    const allFoldOptions = document.querySelectorAll('.k-fold-options');

    // Hide all options initially
    allTestOptions.forEach(option => {
        option.style.display = 'none';
    });
    allFoldOptions.forEach(option => {
        option.style.display = 'none';
    });

    // Get all split type dropdowns
    const splitTypeSelects = document.querySelectorAll('.splitType');

    // Update the display based on each split type dropdown
    splitTypeSelects.forEach((splitTypeSelect, index) => {
        const selectedSplitType = splitTypeSelect.value;

        if (selectedSplitType === 'train_test') {
            allTestOptions[index].style.display = 'block';
        } else if (selectedSplitType === 'k_fold') {
            allFoldOptions[index].style.display = 'block';
        }
    });
};


// Attach the display function to each split type dropdown
splitTypeElements.forEach(splitTypeSelect => {

    splitTypeSelect.addEventListener('change', displaySplitOptions);
});
hyperparameterSearch.forEach(hyperparamSelect => {
    hyperparamSelect.addEventListener('change', toggleTrainingParameters);
});


// Add event listeners to each button
buttons.forEach(button => {
    button.addEventListener('click', function () {
        // Get and store the text value of the clicked button
        Algo_Choice = button.textContent.trim(); // Remove extra spaces

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

        // Reset all the selections to the inial values after changing the algorithme 
        splitTypeElements.forEach(splitTypeElement => {
            splitTypeElement.value = ""; // Reset to default empty state
        });
        missingValuesElements.forEach(MissElement => {
            MissElement.value = ""; // Reset to default empty state for missing values 
        });
        standardisationElements.forEach(standarElement => {
            standarElement.value = "" ; 
        }) ; 
        categoricalEncoding.forEach(categorie => {
            categorie.value = "" ; 
        }) ; 
        hyperparameterSearch.forEach(hyperparamSelect => {
            hyperparamSelect.value = "" ;
        }) ; 
        // Reset all train-test and K-fold selections
        allTestOptions.forEach(testOption => {
            const testSelect = testOption.querySelector('select');
            if (testSelect) {
                testSelect.value = ""; // Reset to default empty state
            }
        });
        allFoldOptions.forEach(foldOption => {
            const foldSelect = foldOption.querySelector('select');
            if (foldSelect) {
                foldSelect.value = ""; // Reset to default empty state
            }
        });

        // Remove 'active' class from all buttons
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Add 'active' class to the clicked button
        button.classList.add('active');
    });
});


/******************************** **************
  
Algorithm Parametres session 

********************************************/ 


    // Function to get regression parameters
    const getRegressionParameters = () => {
        const splitTypeValue = getLastSplitChoice();
        const target = getSelectedChoices();
        let splitDetail = '';

        if (splitTypeValue === 'train_test') {
            splitDetail = getLastSplitValueTest();
        } else if (splitTypeValue === 'k_fold') {
            splitDetail = getLastSplitValueKFOLD();
        }

        return {
            splitType: getLastSplitChoice(),
            splitDetail,
            target,
            standardisation: getLastStandardisationChoice(),
            missingValuesHandling: getLastMissingValuesChoice(),
            encodingMethod: getLastEncodingChoice(),
            hyperparameterSearch: getLastHyperChoice(),
            includeIntercept: includeIntercept.value,
            regularizationMethod: regularization.value,
        
        };
    };

    // Function to get KNN parameters
    const getKNNParameters = () => {
        const splitTypeValue =getLastSplitChoice();
        const target = getSelectedChoices();
        let splitDetail = '';

        if (splitTypeValue === 'train_test') {
            splitDetail = getLastSplitValueTest();
        } else if (splitTypeValue === 'k_fold') {
            splitDetail =  getLastSplitValueKFOLD();
        }

        return {
            splitType: getLastSplitChoice(),
            splitDetail,
            target,
            standardisation: getLastStandardisationChoice(),
            missingValuesHandling: getLastMissingValuesChoice(),
            encodingMethod: getLastEncodingChoice(),
            hyperparameterSearch: getLastHyperChoice(),
            n_neighbors: choix_k.value,
            type_distance: type_distance.value


        };
    };

    // Function to display regression results dynamically
    function displayRegressionResults(performance) {
        // Hide classification results
        const regressionCard = document.getElementById("regressionResultsCard");
        const classificationCard = document.getElementById("ClassificationResultsCard");
        classificationCard.style.display = "none";
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


    function displayClassificationResults(performance) {
        // Show classification results card
        const classificationCard = document.getElementById("ClassificationResultsCard");
        const regressionCard = document.getElementById("regressionResultsCard");
        if (!classificationCard) {
            console.error("ClassificationResultsCard element not found!");
            return;
        }
        regressionCard.style.display = "none";
        classificationCard.style.display = "block";
        
    
        // Update classification metrics
        const accuracyElement = document.getElementById("accuracy");
        const precisionElement = document.getElementById("precision");
        const recallElement = document.getElementById("recall");
        const f1ScoreElement = document.getElementById("f1score");
    
        if (accuracyElement) accuracyElement.textContent = (performance.accuracy * 100).toFixed(2) + "%";
        if (precisionElement) precisionElement.textContent = (performance.precision * 100).toFixed(2) + "%";
        if (recallElement) recallElement.textContent = (performance.recall * 100).toFixed(2) + "%";
        if (f1ScoreElement) f1ScoreElement.textContent = (performance.f1_score * 100).toFixed(2) + "%";
    
        // Update progress bars
        const accuracyBar = document.getElementById("accuracyBar");
        const precisionBar = document.getElementById("precisionBar");
        const recallBar = document.getElementById("recallBar");
        const f1ScoreBar = document.getElementById("f1ScoreBar");
    
        if (accuracyBar) accuracyBar.style.width = `${(performance.accuracy * 100).toFixed(2)}%`;
        if (precisionBar) precisionBar.style.width = `${(performance.precision * 100).toFixed(2)}%`;
        if (recallBar) recallBar.style.width = `${(performance.recall * 100).toFixed(2)}%`;
        if (f1ScoreBar) f1ScoreBar.style.width = `${(performance.f1_score * 100).toFixed(2)}%`;
    }
    

// Handle form submission for model training
if (btnTrain) {
    btnTrain.addEventListener('click', async (e) => {
        e.preventDefault();

        // Log the chosen algorithm
        

        const selectedFile = fileSelect.value;
        const target = getSelectedChoices();
   //     console.log("selected split type is "  ,   getLastSplitChoice());  // target variable 
     //   console.log("last split option of kfold is  is :", getLastSplitValueKFOLD()); // type d'algorithme (KNN - Régression Linéaire )
       // console.log("last split for test value is " , getLastSplitValueTest() ); 

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
            console.log("data to send to back server : user choice " , parameters) ; 
            requestData = {
                file: selectedFile,
                algorithm: 'KNN',
                parameters,
            };
        } else if (Algo_Choice === "Régression Linéaire") {
            
            const parameters = getRegressionParameters(); // Call your function to get regression-specific parameters
            console.log("data to dend for regression " , parameters) ; 
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
                    displayClassificationResults(data.performance); // Call function to display KNN results
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