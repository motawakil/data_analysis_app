let mainChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    mainChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Données',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    }
                }
            }
        }
    });

    // Event Listeners
    document.getElementById('chartType').addEventListener('change', updateChartType);
    document.getElementById('updateChart').addEventListener('click', updateChart);
    document.getElementById('exportChart').addEventListener('click', exportChart);
    document.getElementById('addFilter').addEventListener('click', addFilter);
    document.getElementById('zoomIn').addEventListener('click', () => zoomChart(1.1));
    document.getElementById('zoomOut').addEventListener('click', () => zoomChart(0.9));
    document.getElementById('resetZoom').addEventListener('click', resetZoom);
});

function updateChartType() {
    const chartType = document.getElementById('chartType').value;
    
    // Clear existing data
    mainChart.data.datasets = [{
        label: 'Données',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }];
    
    // Update chart type and configuration
    mainChart.config.type = chartType;
    
    // Add specific options based on chart type
    switch(chartType) {
        case 'histogram':
            mainChart.options.scales = {
                y: {
                    beginAtZero: true
                }
            };
            break;
        case 'scatter':
            mainChart.options.scales = {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    type: 'linear',
                    position: 'left'
                }
            };
            break;
        case 'line':
            mainChart.options.scales = {
                y: {
                    beginAtZero: true
                }
            };
            break;
    }
    
    // Generate sample data based on chart type
    generateSampleData(chartType);
    
    mainChart.update();
}

function generateSampleData(chartType) {
    const data = [];
    
    switch(chartType) {
        case 'scatter':
            for(let i = 0; i < 50; i++) {
                data.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100
                });
            }
            break;
        case 'histogram':
        case 'bar':
            for(let i = 0; i < 10; i++) {
                data.push(Math.random() * 100);
            }
            break;
        case 'line':
            for(let i = 0; i < 10; i++) {
                data.push({
                    x: i,
                    y: Math.random() * 100
                });
            }
            break;
    }
    
    mainChart.data.datasets[0].data = data;
}

function updateChart() {
    const button = document.getElementById('updateChart');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mise à jour...';
    
    // Simulate API call
    setTimeout(() => {
        generateSampleData(mainChart.config.type);
        updateStatistics();
        mainChart.update();
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Mettre à jour';
    }, 1000);
}

function exportChart() {
    const button = document.getElementById('exportChart');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Export...';
    
    // Convert chart to image
    html2canvas(document.querySelector('#mainChart')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'chart-export.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download me-2"></i>Exporter';
    });
}

function addFilter() {
    const container = document.querySelector('.filter-container');
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item mb-2';
    filterItem.innerHTML = `
        <select class="form-select mb-2">
            <option value="">Sélectionner une variable</option>
        </select>
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Valeur">
            <button class="btn btn-outline-danger" type="button">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add remove filter handler
    filterItem.querySelector('.btn-outline-danger').addEventListener('click', () => {
        filterItem.remove();
    });
    
    container.appendChild(filterItem);
}

function zoomChart(factor) {
    if (mainChart.options.scales.x) {
        const xAxis = mainChart.options.scales.x;
        const yAxis = mainChart.options.scales.y;
        
        const xDiff = (xAxis.max - xAxis.min) * (1 - factor);
        const yDiff = (yAxis.max - yAxis.min) * (1 - factor);
        
        xAxis.min += xDiff / 2;
        xAxis.max -= xDiff / 2;
        yAxis.min += yDiff / 2;
        yAxis.max -= yDiff / 2;
        
        mainChart.update();
    }
}

function resetZoom() {
    if (mainChart.options.scales.x) {
        delete mainChart.options.scales.x.min;
        delete mainChart.options.scales.x.max;
        delete mainChart.options.scales.y.min;
        delete mainChart.options.scales.y.max;
        mainChart.update();
    }
}

function updateStatistics() {
    const data = mainChart.data.datasets[0].data;
    
    // Calculate statistics
    const values = data.map(d => typeof d === 'object' ? d.y : d);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    // Update statistics display
    document.getElementById('meanValue').textContent = mean.toFixed(2);
    document.getElementById('medianValue').textContent = median.toFixed(2);
    document.getElementById('stdValue').textContent = std.toFixed(2);
    
    // Calculate correlation for scatter plots
    if (mainChart.config.type === 'scatter') {
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        const correlation = calculateCorrelation(xValues, yValues);
        document.getElementById('correlationValue').textContent = correlation.toFixed(2);
    } else {
        document.getElementById('correlationValue').textContent = '-';
    }
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = Math.sqrt(
        x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0) *
        y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    );
    
    return numerator / denominator;
}
