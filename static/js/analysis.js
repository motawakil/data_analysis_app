document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Handle algorithm selection
    const algorithmButtons = document.querySelectorAll('.nav-link');
    algorithmButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active states
            algorithmButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Reset results when changing algorithms
            resetResults();
        });
    });

    // Handle train button
    const btnTrain = document.getElementById('btnTrain');
    btnTrain.addEventListener('click', function() {
        // Show loading state
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entraînement...';
        
        // Simulate training (remove this in production)
        setTimeout(() => {
            simulateResults();
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-play me-2"></i>Entraîner le Modèle';
        }, 2000);
    });

    // Handle reset button
    const btnReset = document.getElementById('btnReset');
    btnReset.addEventListener('click', function() {
        // Reset all form inputs
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'number') {
                input.value = input.defaultValue;
            } else {
                input.value = '';
            }
        });
        
        // Reset select elements
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        // Reset results
        resetResults();
    });
});

function resetResults() {
    // Reset all progress bars
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.style.width = '0%';
        bar.setAttribute('aria-valuenow', '0');
    });

    // Reset all metric values
    document.querySelectorAll('.metric-value').forEach(value => {
        value.textContent = '-';
    });
}

function simulateResults() {
    // Simulate random performance metrics
    const metrics = document.querySelectorAll('.metric-card');
    metrics.forEach(metric => {
        const value = Math.random() * 100;
        const progressBar = metric.querySelector('.progress-bar');
        const metricValue = metric.querySelector('.metric-value');
        
        // Animate progress bar
        progressBar.style.width = `${value}%`;
        progressBar.setAttribute('aria-valuenow', value);
        
        // Update metric value
        metricValue.textContent = `${value.toFixed(2)}%`;
        
        // Set color based on value
        if (value >= 80) {
            progressBar.className = 'progress-bar bg-success';
        } else if (value >= 60) {
            progressBar.className = 'progress-bar bg-info';
        } else if (value >= 40) {
            progressBar.className = 'progress-bar bg-warning';
        } else {
            progressBar.className = 'progress-bar bg-danger';
        }
    });
}
