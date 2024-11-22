// JavaScript source code
async function loadProjectCards(targetContainer, specifiedIds = []) {
    const dataUrl = "projects/project-data.json?nocache=" + new Date().getTime();
    const templateUrl = "projects/card-template.html";
    const container = document.querySelector(targetContainer);

    try {
        // Fetch project data and card template
        const [dataResponse, templateResponse] = await Promise.all([
            fetch(dataUrl),
            fetch(templateUrl)
        ]);

        if (!dataResponse.ok || !templateResponse.ok) {
            throw new Error("Failed to load data or template.");
        }

        const projects = await dataResponse.json();
        const template = document.createElement("div");
        template.innerHTML = await templateResponse.text();
        const templateCard = template.firstElementChild;

        // Filter projects based on specified IDs
        const filteredProjects = specifiedIds.length
            ? specifiedIds.map(id => projects[id]).filter(Boolean)
            : Object.values(projects);

        // Clear existing content
        container.innerHTML = "";

        // Generate and append cards
        filteredProjects.forEach(project => {
            const card = templateCard.cloneNode(true);

            // Populate the card
            const img = card.querySelector(".project-image");
            img.src = project.projectImage;
            img.alt = `${project.projectName} Screenshot`;

            const title = card.querySelector(".project-title");
            title.textContent = project.projectName;

            const description = card.querySelector(".project-description");
            description.textContent = project.projectDescription;

            const skillsList = card.querySelector(".skills-list");
            skillsList.innerHTML = project.tools.map(tool => `<li>${tool}</li>`).join("");

            // Add click event for modal
            card.addEventListener("click", () => loadProjectTemplate(project.id));

            // Append to container
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading project cards:", error);
    }
}
