
document.addEventListener('DOMContentLoaded', function () {
    const fileSelect = document.getElementById('fileSelect');
    const dashboardContainer = document.getElementById('dashboard');
    const username = document.getElementById('username').value;
    const id=document.getElementById('hi');

    id.innerHTML = `${username} - Welcome to your dashboard !`; 

    console.log(username);
        // Fetch available files 
        const fetchFiles = async () => {
            try {
                const username = document.getElementById('username').value;
                const response = await fetch(`/export/get-files?username=${username}`);
                const files = await response.json();
                fileSelect.innerHTML = '<option value="">Sélectionner un fichier</option>';
                files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file.id;  // Full filename with username
                    option.textContent = file.name;  // Display name without username
                    fileSelect.appendChild(option);
                                       
                });
                
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };
        fetchFiles(); 
      
  
        // Handle file selection and fetch visualizations
        fileSelect.addEventListener('change', async function() {
            const fileName = this.value;
            
            console.log(`Selected file: ${fileName} for user: ${username}`);

            if (!fileName) return;

    
            try {
                //senduser();

                const response = await fetch(`/export/get-visualizations?username=${username}&fileName=${fileName}`);
                const data = await response.json();
            
                console.log("Response data:", data);
                console.log("Number of charts:", data.charts?.length || 0);
                console.log("Number of stats:", data.statistics?.length || 0);

            if (data.error) {
                throw new Error(data.error);
            }
            
            displayDashboard(data);
        } catch (error) {
            console.error('Error:', error);
            dashboardContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading visualizations: ${error.message}
                </div>
            `;
        }
        });
    function displayDashboard(data) {

         // Debug charts data
         if (data.charts && data.charts.length > 0) {
            console.log("Charts to render:", data.charts);
        } else {
            console.log("No charts found in data");
        }
        // Render Charts
        const chartsHtml = data.charts.map(chart => `
            <div class="col-md-6 mb-4">
            <div class="card">
                <img src="${chart.image}" class="card-img-top" alt="Chart ${chart.id}">
                <div class="card-body">
                    <h5>Chart Details</h5>
                    <p><strong>X-Axis:</strong> ${chart.x_axis}</p>
                    <p><strong>Y-Axis:</strong> ${chart.y_axis || 'N/A'}</p>
                    <p><strong>Type:</strong> ${chart.type}</p>
                    <p><strong>Created:</strong> ${chart.date}</p>
                </div>
            </div>
        </div>
    `).join('');

        // Render Statistics
        const statsHtml = data.statistics.map(stat => `
            <div class="col-md-4 mb-4">
                <div class="statistics-card">
                    <div class="card-body">
                        <h5>${stat.column}</h5>
                        <p>
                            <strong>Mean:</strong>
                            <span class="stat-value">${stat.mean.toFixed(2)}</span>
                        </p>
                        <p>
                            <strong>Median:</strong>
                            <span class="stat-value">${stat.median.toFixed(2)}</span>
                        </p>
                        <p>
                            <strong>Variance:</strong>
                            <span class="stat-value">${stat.variance.toFixed(2)}</span>
                        </p>
                        <p>
                            <strong>Quartiles:</strong>
                            <span class="stat-value">${stat.quartiles}</span>
                        </p>
                    </div>
                </div>
            </div>
        `).join('');

        // Update Dashboard
        dashboardContainer.innerHTML = `
        <h3 class="dashboard-section-title">Statistics</h3>
        <div class="statistics-section">
        <div class="row">${statsHtml}</div>
        </div>
        <h3 class="dashboard-section-title">Charts</h3>
        <div class="row">${chartsHtml}</div>
    `;
    }
    const senduser = () => {
        const fileName = fileSelect.value;
        const username = document.getElementById('username').value; // Retrieve username

        console.log('Sending data:', { fileName, username }); // Debugging


    fetch(`/export/get-visualizations?fileName=${fileName}&username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('user sented succefully ', data.username);
                    console.log('file sented succefully ', data.fileName);

                    
                } else {
                    console.log('Error sending data:', data.error);
                   
                }
                
            })
            .catch(error => console.error('Error calculating statistics:', error));
        };
    
});

