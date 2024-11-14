// Load specific project data by ID
fetch('projects/project-data.json')
    .then(response => response.json())
    .then(data => {
        // Define the specific project IDs to load in this section
        const projectIds = ['project1', 'project2'];

        projectIds.forEach(id => {
            const projectData = data[id];
            if (projectData) {
                // Create project card and populate it with data
                const projectCard = document.getElementById(id);
                projectCard.classList.add('project-card');
                projectCard.innerHTML = `
                    <img src="${projectData.projectImage}" alt="${projectData.projectName} Screenshot">
                    <h3>${projectData.projectName}</h3>
                    <p>${projectData.projectDescription}</p>
                    <a href="${projectData.result.embedLink}" target="_blank" class="view-project-btn">View Project</a>
                `;
            }
        });
    })
    .catch(error => console.error('Error loading project data:', error));
