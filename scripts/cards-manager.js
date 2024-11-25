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
        // Check if the script is already loaded
        if (document.querySelector(`script[src="${scriptPath}"]`)) {
            console.log("Modal manager already loaded.");
            return;
        }
        const script = document.createElement("script");
        script.src = scriptPath;
        script.onload = () => console.log("Modal manager loaded.");
        script.onerror = () => console.error("Failed to load modal manager.");
        document.head.appendChild(script);
    }

    function loadGalleryScript(scriptUrl, callback) {
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.onload = callback;
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
            card.addEventListener("click", () => openModal(project));

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
    async function loadProjectData(project) {
        const filePath = `../projects/project-data.json?nocache=${new Date().getTime()}`;
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch project data. HTTP status: ${response.status}`);
            }
            const data = await response.json();
            //const project = data[projectId];

            if (!project) {
                //throw new Error(`Project ID "${projectId}" not found in ${filePath}.`);
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
                    const listItem = document.createElement("ul");
                    listItem.textContent = item;
                    parentElement.appendChild(listItem);
                });
            }

            // Define properties to add based on content type
            const properties = {
                "Project Type": project.projectType,
                "Date": project.date,
                "Core Features": project.coreFeatures,
                "Other Features": project.otherFeatures,
                "Tools and Technologies": project.tools,
                "Systems and Frameworks": project.systems,
                "Status": project.status
            };

            // Loop over each property and render appropriately
            Object.entries(properties).forEach(([key, value]) => {
                if (value && value.length > 0) {
                    const listItem = document.createElement("li");
            
                    // Property Name
                    const propertyName = document.createElement("strong");
                    propertyName.textContent = key;
                    listItem.appendChild(propertyName);
                    
                    //console.log(key + ": " + value.leng);

                    // Property Value
                    if (Array.isArray(value) && value.length > 0) {
                        value.forEach(item => {
                            if (item.length > 0){
                                const propertyValue = document.createElement("span");
                                propertyValue.textContent = item;
                                propertyValue.classList.add("array-item"); // Add class for array items
                                listItem.appendChild(propertyValue); 
                            }
                        });
                    } else {
                        const propertyValue = document.createElement("span");
                        propertyValue.textContent = value;
                        listItem.appendChild(propertyValue);
                    }
            
                    propertiesList.appendChild(listItem);
                }
            });
            
            // Handle other sections, such as Idea, Design, and Result, similarly
            if (project.idea) {
                document.getElementById("ideaDescription").textContent = project.idea.description || "";
                const ideaImage = document.getElementById("ideaImage");
                if (project.idea.image) {
                    ideaImage.src = project.idea.image;
                    ideaImage.style.display = "block";
                }else{
                    ideaImage.style.display = "none";
                }
                // Hide the idea section if no content
                if (project.idea.description == "" && project.idea.image == "")
                    document.getElementById("ideaSection").style.display = "none";
            } else {
                document.getElementById("ideaSection").style.display = "none";
            }

            if (project.design) {
                const designSection = document.getElementById("designSection");
                const designDescription = document.getElementById("designDescription");
                const designList = document.createElement("ul");
                designList.classList.add("design-list");

                // Handle design image
                const designImage = document.getElementById("designImage");
                if (project.design.image && project.design.image != "") {
                    designImage.src = project.design.image;
                    designImage.alt = "Design Section Image"; // Set a default alt text
                    designImage.style.display = "block"; // Ensure it is visible if the image is provided
                    designList.appendChild(designImage);
                } else {
                    designImage.style.display = "none"; // Hide the image if not provided
                }

                // Populate design description
                if (project.design.description && project.design.description.length > 0) {
                    if (Array.isArray(project.design.description)) {
                        project.design.description.forEach(desc => {
                            if (desc.length > 0) {
                                const descParagraph = document.createElement("p");
                                descParagraph.textContent = desc;
                                designDescription.appendChild(descParagraph);
                            }
                        });
                    }else{
                        const descParagraph = document.createElement("p");
                        descParagraph.textContent = project.design.description;
                        designDescription.appendChild(descParagraph);
                    }
                    if (designDescription.childNodes.length > 0)
                    designList.appendChild(designDescription);
                }

                // Populate core elements
                if (project.design.coreElements && Array.isArray(project.design.coreElements)) {
                    project.design.coreElements.forEach(item => {
                        const listItem = document.createElement("li");
                        // Element name if not empty
                        if (item.element.length > 0)
                        {
                            const elementName = document.createElement("strong");
                            elementName.textContent = item.element;
                            listItem.appendChild(elementName);
                        }
                        // Description (on a new line)
                        if (item.description.length > 0)
                        {
                            const elementDescription = document.createElement("p");
                            elementDescription.textContent = item.description;
                            listItem.appendChild(elementDescription);
                        }  
                        if (listItem.childNodes.length > 0)
                        designList.appendChild(listItem);
                    });
                }
                
                // Append the list to the design section if it exists
                if (designList.childNodes.length > 0) {
                    designSection.appendChild(designList);
                } else {
                    designSection.style.display = "none"; // Hide if no data provided
                }
            } else {
                document.getElementById("designSection").style.display = "none"; // Hide if no design data
            }


            if (project.gallery && project.gallery.length > 0) {
                loadGalleryScript("scripts/gallery-manager.js", () => {
                    loadGallerySection(project.gallery, "#gallery-placeholder");
                });
            } else {
                // hide?
            }
            

            if (project.result) {
                const resultDescription = document.getElementById("resultDescription");
                const embedLink = document.getElementById("embedLink");
                const externalLink = document.getElementById("externalLink");
                let elements = 0;
                if (project.result.description && project.result.description.length > 0) {
                    resultDescription.textContent = project.result.description;
                    elements++;
                }else{
                    resultDescription.style.display = "none";
                }

                if (project.result.embedLink && project.result.embedLink.length > 0) {
                    embedLink.src = project.result.embedLink;
                    elements++;
                }else{
                    embedLink.style.display = "none";
                }                

                if (project.result.externalLink && project.result.externalLink.length > 0) {
                    externalLink.href = project.result.externalLink;
                    elements++;
                }else{
                    externalLink.style.display = "none";
                }
                if (elements == 0) document.getElementById("resultSection").style.display = "none";
            } else {
                document.getElementById("resultSection").style.display = "none";
            }
        } catch (error) {
            console.error("Error loading project data:", error);
        }
    }

    return { init };
})();
