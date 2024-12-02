document.addEventListener('DOMContentLoaded', function() {
    // Handle Results Download
    const downloadResultsBtn = document.getElementById('downloadResults');
    downloadResultsBtn.addEventListener('click', function() {
        // Get selected options
        const exportMetrics = document.getElementById('exportMetrics').checked;
        const exportPredictions = document.getElementById('exportPredictions').checked;
        const exportCharts = document.getElementById('exportCharts').checked;
        const format = document.querySelector('input[name="exportFormat"]:checked').id;
        
        // Show loading state
        const originalContent = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Préparation du fichier...';
        
        // Simulate file preparation and download
        setTimeout(() => {
            // Create a dummy file for demonstration
            const blob = new Blob(['Sample export data'], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `results_export.${format === 'csvFormat' ? 'csv' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Reset button state
            this.disabled = false;
            this.innerHTML = originalContent;
            
            // Show success message
            showNotification('Fichier exporté avec succès!', 'success');
        }, 2000);
    });
    
    // Handle Model Download
    const downloadModelBtn = document.getElementById('downloadModel');
    downloadModelBtn.addEventListener('click', function() {
        // Get selected options
        const exportWeights = document.getElementById('exportWeights').checked;
        const exportArchitecture = document.getElementById('exportArchitecture').checked;
        const exportHyperparameters = document.getElementById('exportHyperparameters').checked;
        
        // Show loading state
        const originalContent = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Préparation du modèle...';
        
        // Simulate model export
        setTimeout(() => {
            // Create a dummy file for demonstration
            const blob = new Blob(['Sample model data'], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'model_export.pkl';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Reset button state
            this.disabled = false;
            this.innerHTML = originalContent;
            
            // Show success message
            showNotification('Modèle exporté avec succès!', 'success');
        }, 2000);
    });
    
    // Handle history downloads
    document.querySelectorAll('.table button').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const type = row.cells[1].textContent;
            const format = row.cells[2].textContent;
            
            // Show loading state
            const originalContent = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Simulate download
            setTimeout(() => {
                // Create a dummy file
                const blob = new Blob(['Sample historical data'], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `historical_${type.toLowerCase()}.${format.toLowerCase()}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // Reset button state
                this.disabled = false;
                this.innerHTML = originalContent;
            }, 1000);
        });
    });
});

// Notification helper function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
        ${message}
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
