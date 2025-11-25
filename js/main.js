// Main script file

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the home page
    if (document.querySelector('#featured-projects')) {
        loadProjects();
    }

    // Check if we're on the projects page
    if (document.querySelector('#projects-container')) {
        loadProjects().then(() => {
            initFilters();
        });
    }

    // Check if we're on the project detail page
    if (document.querySelector('#project-detail')) {
        console.log('On project detail page');
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        console.log('Project ID from URL:', projectId);
        if (projectId) {
            loadProjects().then(() => {
                renderProjectDetail(projectId);
            });
        } else {
            console.log('No project ID provided, redirecting');
            // If no ID provided, redirect to projects page
            window.location.href = 'projects.html';
        }
    }
    
    // Initialize smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
                header.style.background = 'rgba(10, 10, 26, 0.98)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(10, 10, 26, 0.95)';
            }
        }
    });

});

// Utility function to get project by ID
function getProjectById(id) {
    return projectsData[id];
}