document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.getElementById('fileSelect');
    const xAxis = document.getElementById('xAxis');
    const yAxis = document.getElementById('yAxis');
    const statVariable = document.getElementById('statVariable');
    const chartType = document.getElementById('chartType');
    const chartLibrary = document.getElementById('chartLibrary');
    const btnVisualize = document.getElementById('btnVisualize');
    const btnCalculateStats = document.getElementById('btnCalculateStats');
    const visualizationContainer = document.getElementById('visualizationContainer');

    // Fetch available files
    const fetchFiles = async () => {
        try {
            const response = await fetch('/visualization/get-files');
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

    // Fetch columns based on the selected file
    const fetchColumns = async () => {
        const fileName = fileSelect.value;
        if (!fileName) return;

        try {
            const response = await fetch(`/visualization/get-columns?filename=${fileName}`);
            const data = await response.json();

            if (data.status === 'success') {
                const columns = data.columns;

                // Reset dropdowns
                xAxis.innerHTML = '<option value="">Sélectionner une variable</option>';
                yAxis.innerHTML = '<option value="">Sélectionner une variable</option>';
                statVariable.innerHTML = '<option value="">Sélectionner une variable</option>';

                // Populate columns for X, Y, and statVariable
                columns.forEach(column => {
                    const optionX = document.createElement('option');
                    const optionY = document.createElement('option');
                    const optionStat = document.createElement('option');

                    optionX.value = optionY.value = optionStat.value = column;
                    optionX.textContent = optionY.textContent = optionStat.textContent = column;

                    xAxis.appendChild(optionX);
                    yAxis.appendChild(optionY);
                    statVariable.appendChild(optionStat);
                });
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    // Fetch chart options based on selected axes
    const fetchChartOptions = async () => {
        const xAxisValue = xAxis.value;
        const yAxisValue = yAxis.value;

        if (!xAxisValue) {
            alert('Veuillez sélectionner une variable pour l\'axe X.');
            return;
        }

        try {
            const response = await fetch(`/visualization/get-chart-options?x_axis=${xAxisValue}&y_axis=${yAxisValue}`);
            const data = await response.json();

            if (data.status === 'success') {
                chartType.innerHTML = '<option value="">Sélectionner un graphique</option>';
                data.chart_types.forEach(chart => {
                    const option = document.createElement('option');
                    option.value = chart;
                    option.textContent = chart;
                    chartType.appendChild(option);
                });
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching chart options:', error);
        }
    };

    const visualizeData = async () => {
        const fileName = fileSelect.value;
        const chart = chartType.value;
        const xAxisValue = xAxis.value;
        const yAxisValue = yAxis.value;
        const library = chartLibrary.value;
    
        // Get filter choices
        const filterType = document.getElementById('filterType').value; // Top, Below, or axis filters
        const filterValue = document.getElementById('filterValue').value; // The value of the filter
    
        if (!fileName || !chart || !xAxisValue  || !library) {
            alert('Veuillez remplir les champs obligatoires.');
            return;
        }
    
        // Prepare the filter object based on user selection
        let filter = null;
        if (filterType && filterValue) {
            filter = {
                type: filterType,      // Filter type (Top, Below, X_axis > x, etc.)
                value: parseInt(filterValue) // Filter value (numeric input)
            };
        }
    
        // Prepare the payload with filter data if available
        const payload = {
            file_name: fileName,
            chart_type: chart,
            x_axis: xAxisValue,
            y_axis: yAxisValue,
            library: library,
            filter: filter // Send the filter data if present
        };
    
        try {
            const response = await fetch('/visualization/create-visualization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
    
            const data = await response.json();
            if (data.status === 'success') {
                const img = document.createElement('img');
                img.src = `/static/${data.output_path}`;
                img.className = 'img-fluid';
                visualizationContainer.innerHTML = '';
                visualizationContainer.appendChild(img);
            } else {
                alert('Erreur: ' + data.message);
            }
        } catch (error) {
            console.error('Error visualizing data:', error);
        }
    };
    
    const fetchFilterOptions = async () => {
        const xAxisValue = xAxis.value;
        const yAxisValue = yAxis.value;
    
        if (!xAxisValue) {
            alert('Veuillez sélectionner une variable pour l\'axe X.');
            return;
        }
    
        try {
            const response = await fetch(`/visualization/get-filter-options?x_axis=${xAxisValue}&y_axis=${yAxisValue}`);
            const data = await response.json();
    
            if (data.status === 'success') {
                const filterType = document.getElementById('filterType');
                filterType.innerHTML = '<option value="">Sélectionner un filtre</option>'; // Clear previous options
    
                // Populate filter options based on data
                data.filter_types.forEach(filter => {
                    const option = document.createElement('option');
                    option.value = filter;
                    option.textContent = filter;
                    filterType.appendChild(option);
                });
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };
    




    // Calculate statistics
    const calculateStatistics = () => {
        const fileName = fileSelect.value;
        const variable = statVariable.value;

        if (!fileName || !variable) {
            alert('Veuillez sélectionner un fichier et une variable.');
            return;
        }

        fetch(`/visualization/calculate-statistics?filename=${fileName}&variable=${variable}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Hide the error message if displayed
                    document.getElementById('errorMessage').style.display = 'none';
                
                    const stats = data.statistics;
                    document.getElementById('meanValue').textContent = stats.mean.toFixed(2);
                    document.getElementById('medianValue').textContent = stats.median.toFixed(2);
                    document.getElementById('varianceValue').textContent = stats.variance.toFixed(2);
                    document.getElementById('quartilesValue').textContent = 
                        `Q1: ${stats.quartiles['0.25'].toFixed(2)}, Q2: ${stats.quartiles['0.5'].toFixed(2)}, Q3: ${stats.quartiles['0.75'].toFixed(2)}`;
                    document.getElementById('skewnessValue').textContent = stats.skewness.toFixed(2);
                    document.getElementById('kurtosisValue').textContent = stats.kurtosis.toFixed(2);
                } else {
                    // Show the error message
                    const errorMessageElement = document.getElementById('errorMessage');
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.textContent = 'Erreur: Veuillez choisir une variable Numeric';
                
                    // Optionally, clear existing statistics
                    document.getElementById('meanValue').textContent = '';
                    document.getElementById('medianValue').textContent = '';
                    document.getElementById('varianceValue').textContent = '';
                    document.getElementById('quartilesValue').textContent = '';
                    document.getElementById('skewnessValue').textContent = '';
                    document.getElementById('kurtosisValue').textContent = '';
                }
                
            })
            .catch(error => console.error('Error calculating statistics:', error));
    };

    // Event Listeners
    fileSelect.addEventListener('change', () => {
        fetchColumns();
    });
    xAxis.addEventListener('change', () => {
        fetchChartOptions();
        fetchFilterOptions();
    });
    
    yAxis.addEventListener('change', () => {
        fetchChartOptions();
        fetchFilterOptions();
    });
    

    btnVisualize.addEventListener('click', visualizeData);
    btnCalculateStats.addEventListener('click', calculateStatistics);

    // Initial fetch
    fetchFiles();
});
