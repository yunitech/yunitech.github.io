// Function to load project data from JSON and populate the template
async function loadProjectData(projectId) {
    const filePath = `../projects/project-data.json?nocache=${new Date().getTime()}`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch project data. HTTP status: ${response.status}`);
        }
        const data = await response.json();
        const project = data[projectId];

        if (!project) {
            throw new Error(`Project ID "${projectId}" not found in ${filePath}.`);
        }

        // Set header and logo
        document.getElementById("header").style.backgroundImage = `url(${project.headerImage || ""})`;
        document.getElementById("logo").src = project.logo || "";
        document.getElementById("projectName").textContent = project.projectName || "Untitled Project";

        // Populate properties list
        const propertiesList = document.getElementById("propertiesList");
        propertiesList.innerHTML = ""; // Clear previous content

        // Helper function to add list items from arrays
        function addListItems(parentElement, items) {
            items.forEach(item => {
                const listItem = document.createElement("li");
                listItem.textContent = item;
                parentElement.appendChild(listItem);
            });
        }

        // Define properties to add based on content type
        const properties = {
            "Project Type": project.projectType,
            "Date": project.date,
            "Core Features": project.coreFeatures,
            "Systems and Frameworks": project.systems,
            "Tools and Technologies": project.tools,
            "Other Features": project.otherFeatures,
            "Status": project.status
        };

        // Loop over each property and render appropriately
        for (const [key, value] of Object.entries(properties)) {
            if (value) {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<strong>${key}:</strong> `;

                if (Array.isArray(value)) {
                    // If the value is an array, create a sublist
                    const sublist = document.createElement("ul");
                    addListItems(sublist, value); // Add each item to the sublist
                    listItem.appendChild(sublist);
                } else {
                    // If the value is a string, add it directly
                    listItem.innerHTML += value;
                }

                propertiesList.appendChild(listItem); // Add the formatted item to properties list
            }
        }

        // Handle other sections, such as Idea, Design, and Result, similarly
        if (project.idea) {
            document.getElementById("ideaDescription").textContent = project.idea.description || "";
            document.getElementById("ideaImage").src = project.idea.image || "";
        } else {
            document.getElementById("ideaSection").style.display = "none";
        }

        if (project.design) {
            document.getElementById("designDescription").textContent = project.design.description || "";
            document.getElementById("designImage").src = project.design.image || "";
        } else {
            document.getElementById("designSection").style.display = "none";
        }

        if (project.result) {
            document.getElementById("resultDescription").textContent = project.result.description || "";
            document.getElementById("embedLink").src = project.result.embedLink || "";
            document.getElementById("externalLink").href = project.result.embedLink || "";
        } else {
            document.getElementById("resultSection").style.display = "none";
        }
    } catch (error) {
        console.error("Error loading project data:", error);
    }
}


// Close modal functionality
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalContent.innerHTML = ""; // Clear modal content after closing
});

// Close modal when clicking outside the modal content
modal.addEventListener("click", (event) => {
    if (event.target === modal) { // Check if the click was outside the modal content
        modal.style.display = "none";
        modalContent.innerHTML = ""; // Clear modal content after closing
    }
});

// Check if iframe fails to load and show the link icon
const embedLink = document.querySelector(".embed-link");
const externalLink = document.querySelector(".external-link");

embedLink.addEventListener("error", () => {
    embedLink.style.display = "none";  // Hide iframe if loading fails
    externalLink.style.display = "inline-block";  // Show external link icon
});