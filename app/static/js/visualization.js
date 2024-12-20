document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.getElementById('fileSelect');
    const chartType = document.getElementById('chartType');
    const xAxis = document.getElementById('xAxis');
    const yAxis = document.getElementById('yAxis');
    const chartLibrary = document.getElementById('chartLibrary'); // Library selection dropdown
    const btnVisualize = document.getElementById('btnVisualize');
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

    // Fetch columns based on selected file
    const fetchColumns = async () => {
        const fileName = fileSelect.value;
        if (!fileName) return;

        try {
            const response = await fetch(`/visualization/get-columns?filename=${fileName}`);
            const data = await response.json();

            if (data.status === 'success') {
                xAxis.innerHTML = '<option value="">Sélectionner une variable</option>';
                yAxis.innerHTML = '<option value="">Sélectionner une variable</option>';
                data.columns.forEach(column => {
                    const optionX = document.createElement('option');
                    const optionY = document.createElement('option');
                    optionX.value = optionY.value = column;
                    optionX.textContent = optionY.textContent = column;
                    xAxis.appendChild(optionX);
                    yAxis.appendChild(optionY);
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    // Fetch available chart types based on selected axes (X and Y)
    const fetchChartOptions = async () => {
        const xAxisValue = xAxis.value;
        const yAxisValue = yAxis.value;

        if (!xAxisValue) {
            alert('Please select the X-axis first.');
            return;
        }

        try {
            const response = await fetch(`/visualization/get-chart-options?x_axis=${xAxisValue}&y_axis=${yAxisValue}`);
            const data = await response.json();

            if (data.status === 'success') {
                // Clear existing options and add new ones
                chartType.innerHTML = '<option value="">Sélectionner un graphique</option>';
                data.chart_types.forEach(chart => {
                    const option = document.createElement('option');
                    option.value = chart;
                    option.textContent = chart;
                    chartType.appendChild(option);
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching chart options:', error);
        }
    };

    // Visualize data
    const visualizeData = async () => {
        const fileName = fileSelect.value;
        const chart = chartType.value;
        const xAxisValue = xAxis.value;
        const yAxisValue = yAxis.value;
        const library = chartLibrary.value; // Get selected library

        if (!fileName || !chart || !xAxisValue || !library) {
            alert('Veuillez remplir les champs obligatoires.');
            return;
        }

        const payload = {
            file_name: fileName,
            chart_type: chart,
            x_axis: xAxisValue,
            y_axis: yAxisValue,
            library: library // Include library in payload
        };

        try {
            const response = await fetch('/visualization/create-visualization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    // Event Listeners
    fileSelect.addEventListener('change', fetchColumns);
    xAxis.addEventListener('change', fetchChartOptions);
    yAxis.addEventListener('change', fetchChartOptions);
    btnVisualize.addEventListener('click', visualizeData);

    // Initial fetch
    fetchFiles();
});
