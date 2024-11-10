async function loadProjects() {
    const filePath = `../projects/project-data.json?nocache=${new Date().getTime()}`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch project data. HTTP status: ${response.status}`);
        }
        const data = await response.json();
        const portfolioSection = document.querySelector(".portfolio-section");

        // Clear existing content
        portfolioSection.innerHTML = "";

        // Create project cards dynamically
        Object.entries(data).forEach(([projectId, project]) => {
            // Card container
            const card = document.createElement("div");
            card.classList.add("project-card");
            card.setAttribute("data-project", projectId);

            // Project image
            const img = document.createElement("img");
            img.src = project.projectImage;
            img.alt = `${project.projectName} Screenshot`;
            img.classList.add("project-image");
            card.appendChild(img);

            // Project details container
            const details = document.createElement("div");
            details.classList.add("project-details");

            // Project title
            const title = document.createElement("h3");
            title.textContent = project.projectName;
            details.appendChild(title);

            // Project description
            const description = document.createElement("p");
            description.textContent = project.projectDescription;
            details.appendChild(description);

            // Tools list styled as skills-list
            const toolsList = document.createElement("ul");
            toolsList.classList.add("tools-list");
            project.tools.forEach(tool => {  // Iterate over tools array directly
                const toolItem = document.createElement("li");
                toolItem.textContent = tool;
                toolsList.appendChild(toolItem);
            });
            details.appendChild(toolsList);

            // Append details to card
            card.appendChild(details);

            // Add click event to open the modal with project details
            card.addEventListener("click", () => {
                loadProjectTemplate(projectId); // Calls modal loading function
            });

            // Append card to portfolio section
            portfolioSection.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading project data:", error);
    }
}

// Load projects when the page loads
document.addEventListener("DOMContentLoaded", loadProjects);





// Select modal elements
const modal = document.getElementById("project-modal");
const modalContent = modal.querySelector(".modal-content");
const closeModal = document.querySelector(".close-btn");

// Function to load the project details template and data
function loadProjectTemplate(projectId) {
    const templatePath = "../projects/project-details-template.html";
    
    fetch(templatePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template. HTTP status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            modalContent.innerHTML = html;   // Insert template HTML into the modal
            modal.style.display = "flex";    // Display the modal
            
            // Dynamically load project-details.js script
            const script = document.createElement("script");
            script.src = "../scripts/project-details.js";
            script.onload = () => {
                // After loading the script, call loadProjectData with the project ID
                loadProjectData(projectId);
            };
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error("Error loading template:", error);
            modalContent.innerHTML = "<p>Error loading project template.</p>";
            modal.style.display = "flex";
        });
}

// Event listener to open modal with project details on card click
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", function () {
        const projectId = this.getAttribute("data-project");
        loadProjectTemplate(projectId);  // Load template and then populate with project data
    });
});


