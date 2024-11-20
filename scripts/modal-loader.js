/* Code for loading project cards */
async function loadProjects() {
    const filePath = `projects/project-data.json?nocache=${new Date().getTime()}`; // Ensure the correct relative path
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch project data. HTTP status: ${response.status}`);
        }
        const data = await response.json();
        const portfolioSection = document.querySelector(".portfolio-section");

        portfolioSection.innerHTML = ""; // Clear existing content

        Object.entries(data).forEach(([projectId, project]) => {
            const card = document.createElement("div");
            card.classList.add("project-card");
            card.setAttribute("data-project", projectId);

            // Add image
            const img = document.createElement("img");
            img.src = project.projectImage;
            img.alt = `${project.projectName} Screenshot`;
            img.classList.add("project-image");
            card.appendChild(img);

            // Add details
            const details = document.createElement("div");
            details.classList.add("project-details");
            const title = document.createElement("h3");
            title.textContent = project.projectName;
            details.appendChild(title);
            const description = document.createElement("p");
            description.textContent = project.projectDescription;
            details.appendChild(description);

            card.appendChild(details);

            // Add event listener for modal
            card.addEventListener("click", () => loadProjectTemplate(projectId));

            portfolioSection.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading project data:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadProjects);

// Select modal elements
const modal = document.getElementById("project-modal");
const modalContent = modal.querySelector(".modal-content");
const closeModal = document.querySelector(".close-btn");

// Function to load the project details template and data
function loadProjectTemplate(projectId) {
    const templatePath = "projects/project-details-template.html";

    fetch(templatePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template. HTTP status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            modalContent.innerHTML = html;
            modal.style.display = "flex";

            // Push a new state to indicate the modal is open
            // history.pushState({ modalOpen: true }, "", "#modal");
            console.log("Pushing modal state to history.");
            history.pushState({ modalOpen: true }, "Modal Open", "#modal");
            console.log("Current history state:", history.state); // Log history state

            // Load project details after dynamically loading the script
            const script = document.createElement("script");
            script.src = "scripts/project-details.js";
            script.onload = () => {
                if (typeof loadProjectData === "function") {
                    loadProjectData(projectId);
                } else {
                    console.error("Error: loadProjectData is not defined.");
                }
            };
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error("Error loading template:", error);
            modalContent.innerHTML = "<p>Error loading project template.</p>";
            modal.style.display = "flex";
        });
}

// Function to close the modal
function closeProjectModal() {
    console.log("closeProjectModal called."); // Debug log
    modal.style.display = "none";
    modalContent.innerHTML = ""; // Clear modal content

    // Use replaceState to clean up modal state from the stack
    if (history.state?.modalOpen) {
        history.back(); // Trigger back navigation to clear the pushed state
    }
}

// Listen for browser back button events
window.addEventListener("popstate", (event) => {
    console.log("popstate event detected:", event.state);

    if (event.state?.modalOpen) {
        console.log("Modal open state detected, closing modal.");
        closeProjectModal();
    } else if (modal.style.display === "flex") {
        console.log("Fallback: modal is open but state is null. Closing modal.");
        closeProjectModal();
    } else {
        console.log("No modal state, default browser navigation.");
    }
});

// Close modal when clicking outside the content
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeProjectModal();
    }
});

// Add event listeners to open modal
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", function () {
        const projectId = this.getAttribute("data-project");
        loadProjectTemplate(projectId);
    });
});

// Close modal on close button click
closeModal.addEventListener("click", closeProjectModal);
