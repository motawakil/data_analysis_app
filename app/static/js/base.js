document.addEventListener("DOMContentLoaded", function () {
    // Select all flash messages with the 'alert' class
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(function (alert) {
        // Set a timer to hide the alert after 5 seconds (5000ms)
        setTimeout(function () {
            alert.classList.remove('show'); // Remove the 'show' class (fade out)
            alert.classList.add('hide'); // Optional: Add a 'hide' class for styling
            alert.style.display = 'none'; // Hide the alert
        }, 2000); // 2000 milliseconds = 2 seconds
    });
});
