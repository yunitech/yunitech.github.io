// JavaScript source code
const CardsManager = (() => {
    // Initialize the CardsManager
    function init({ container, dataUrl, specifiedIds = [] }) {
        const containerEl = document.querySelector(container);

        if (!containerEl) {
            console.error(`Container "${container}" not found.`);
            return;
        }

        loadCSS("styles/cards.css"); // Load cards-specific CSS
        loadModalManager("scripts/modal-manager.js"); // Dynamically load modal-manager.js
        loadCards(containerEl, dataUrl, specifiedIds);
    }

    // Load CSS dynamically
    function loadCSS(filePath) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = filePath;
        document.head.appendChild(link);
    }

    // Load modal manager dynamically
    function loadModalManager(scriptPath) {
        const script = document.createElement("script");
        script.src = scriptPath;
        script.onload = () => console.log("Modal manager loaded.");
        script.onerror = () => console.error("Failed to load modal manager.");
        document.head.appendChild(script);
    }

    // Fetch project data and render cards
    async function loadCards(containerEl, dataUrl, specifiedIds) {
        const templateUrl = "projects/card-template.html"; // Default template URL
        try {
            const [dataResponse, templateResponse] = await Promise.all([
                fetch(dataUrl),
                fetch(templateUrl),
            ]);

            if (!dataResponse.ok || !templateResponse.ok) {
                throw new Error("Failed to fetch data or template.");
            }

            const projects = await dataResponse.json();
            const templateHTML = await templateResponse.text();

            // Filter projects if specified IDs are provided
            const filteredProjects = specifiedIds.length
                ? specifiedIds.map(id => ({ ...projects[id], id })).filter(Boolean)
                : Object.entries(projects).map(([id, project]) => ({ ...project, id }));

            renderCards(containerEl, filteredProjects, templateHTML);
        } catch (error) {
            console.error("Error loading project cards:", error);
        }
    }

    // Render project cards
    function renderCards(containerEl, projects, templateHTML) {
        containerEl.innerHTML = ""; // Clear container

        projects.forEach((project) => {
            const cardWrapper = document.createElement("div");
            cardWrapper.innerHTML = templateHTML.trim();
            const card = cardWrapper.firstChild;

            // Populate card
            populateCard(card, project);

            // Add event listener for modal
            card.addEventListener("click", () => openModal(project.id));

            // Append card to the container
            containerEl.appendChild(card);
        });
    }

    // Populate a single card with project data
function populateCard(card, project, id) {
    card.setAttribute("data-project", id); // Assign the project ID to the card

    const img = card.querySelector(".project-image");
    img.src = project.projectImage || "";
    img.alt = `${project.projectName} Screenshot`;

    const title = card.querySelector(".project-title");
    title.textContent = project.projectName || "Untitled";

    const description = card.querySelector(".project-description");
    description.textContent = project.projectDescription || "No description available.";

    const skillsList = card.querySelector(".skills-list");
    skillsList.innerHTML = project.tools.map((tool) => `<li>${tool}</li>`).join("");
    }

    // Open modal with project details
    async function openModal(projectId) {
        const modal = document.getElementById("project-modal");
        const modalContent = modal.querySelector(".modal-content");
        const templatePath = "projects/project-details-template.html";

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template. HTTP status: ${response.status}`);
            }

            const template = await response.text();
            modalContent.innerHTML = template;

            await loadProjectData(projectId);
            modal.style.display = "flex";
            document.body.classList.add("modal-active");
            // Trigger the modalOpen event
            const event = new Event("modalOpen");
            document.dispatchEvent(event);

            history.pushState({ modalOpen: true }, "Modal Open", "#modal");
            console.log("State after opening modal:", history.state);
        } catch (error) {
            console.error("Error loading project details:", error);
        }
    }

    // Load project-specific data into the modal
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

    return { init };
})();
