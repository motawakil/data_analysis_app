document.addEventListener('DOMContentLoaded', function() {
    // Handle Documentation Download
    const downloadDocsBtn = document.getElementById('downloadDocs');
    downloadDocsBtn.addEventListener('click', function() {
        // Show loading state
        const originalContent = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Préparation du document...';
        
        // Simulate PDF generation and download
        setTimeout(() => {
            // Create a dummy PDF file for demonstration
            const blob = new Blob(['Documentation content'], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documentation.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Reset button state
            this.disabled = false;
            this.innerHTML = originalContent;
            
            // Show success notification
            showNotification('Documentation téléchargée avec succès!', 'success');
        }, 2000);
    });
    
    // Handle Video Thumbnails
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    const videoModal = new bootstrap.Modal(document.getElementById('videoModal'));
    const videoFrame = document.querySelector('#videoModal iframe');
    
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoId = this.dataset.videoId;
            // In a real application, you would use actual video URLs
            const videoUrl = getVideoUrl(videoId);
            videoFrame.src = videoUrl;
            videoModal.show();
        });
    });
    
    // Clean up video when modal is closed
    document.getElementById('videoModal').addEventListener('hidden.bs.modal', function() {
        videoFrame.src = '';
    });
    
    // Handle Algorithm Tabs
    const algorithmTabs = document.querySelectorAll('#algorithmTabs .nav-link');
    algorithmTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            algorithmTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const target = this.getAttribute('href');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            document.querySelector(target).classList.add('show', 'active');
        });
    });
});

// Helper function to get video URL (placeholder)
function getVideoUrl(videoId) {
    // In a real application, this would return actual video URLs
    const videos = {
        'tutorial1': 'https://www.youtube.com/embed/example1',
        'tutorial2': 'https://www.youtube.com/embed/example2'
    };
    return videos[videoId] || '';
}

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
