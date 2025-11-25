// Projects data loaded from modular structure
let projectsData = {};

// Helper function to escape HTML entities
function htmlEscape(str) {
    return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#039;');
}

// Helper function to process markdown-like content into HTML
function processMarkdownToHtml(lines) {
    let html = '';
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End code block
                const languageClass = codeLanguage ? ` class="language-${codeLanguage}"` : '';
                html += `<pre class="code-block"><code${languageClass}>${htmlEscape(codeContent.join('\n'))}</code></pre>`;
                codeContent = [];
                inCodeBlock = false;
                codeLanguage = '';
            } else {
                // Start code block
                inCodeBlock = true;
                codeLanguage = line.substring(3).trim(); // Extract language after ```
            }
        } else if (inCodeBlock) {
            codeContent.push(line);
        } else {
            // Check if this looks like ASCII art (contains box drawing characters)
            if (line.includes('┌') || line.includes('│') || line.includes('└') || line.includes('─')) {
                html += `<pre class="ascii-art">${line}</pre>`;
            }
            // Check if this looks like code (contains common code patterns)
            else if (line.includes('struct ') || line.includes('class ') ||
                      line.includes('public:') || line.includes('private:') || line.includes('void ') ||
                      line.includes('int32') || line.includes('float ') || line.includes('bool ') ||
                      line.includes('const ') || line.includes('TEXT(') || line.includes('->') ||
                      line.includes('if (') || line.includes('for (') || line.includes('while (')) {
                html += `<pre class="code-block">${line}</pre>`;
            } else if (line.trim() === '') {
                // Skip empty lines or handle spacing
                html += '<br>';
            } else {
                html += `<p>${line}</p>`;
            }
        }
    }

    // Handle unclosed code block
    if (inCodeBlock && codeContent.length > 0) {
        const languageClass = codeLanguage ? ` class="language-${codeLanguage}"` : '';
        html += `<pre class="code-block"><code${languageClass}>${codeContent.join('\n')}</code></pre>`;
    }

    return html;
}

// Helper function to get section content by title
function getSectionContent(project, sectionTitle) {
    if (!project.sections || !Array.isArray(project.sections)) return null;
    const section = project.sections.find(s => s.title === sectionTitle);
    return section ? section.content : null;
}

// Helper function to get description from Overview section
function getProjectDescription(project) {
    const overviewContent = getSectionContent(project, 'Overview');
    if (overviewContent && overviewContent.description && Array.isArray(overviewContent.description)) {
        return overviewContent.description.join(' ');
    }
    return project.projectDescription || 'No description'; // Fallback
}

// Helper function to get technologies from Technologies Used section
function getProjectTechnologies(project) {
    const techContent = getSectionContent(project, 'Technologies Used');
    if (techContent && techContent.items && Array.isArray(techContent.items)) {
        return techContent.items;
    }
    return project.tools || []; // Fallback
}

// Helper function to get features from Key Features section
function getProjectFeatures(project) {
    const featuresContent = getSectionContent(project, 'Key Features');
    if (featuresContent && featuresContent.items && Array.isArray(featuresContent.items)) {
        return featuresContent.items;
    }
    return project.coreFeatures || []; // Fallback
}

// Function to load projects from modular structure
function loadProjects() {
    console.log('Loading projects from modular structure...');
    return fetch('data/projects/index.json')
        .then(response => {
            console.log('Fetch response status for index:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(indexData => {
            console.log('Index data loaded, projects:', indexData.projects);
            // Store featured project IDs globally for use in renderFeaturedProjects
            window.featuredProjectIds = indexData.featured || [];
            console.log('Featured project IDs stored:', window.featuredProjectIds);
            const projectPromises = indexData.projects.map(projectFile => {
                return fetch(`data/projects/${projectFile}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${projectFile}`);
                        }
                        return response.json();
                    })
                    .then(projectData => {
                        // Extract ID from filename (e.g., "1-fps-gas-core.json" -> "1")
                        const id = projectFile.split('-')[0];
                        projectData.id = id;
                        projectsData[id] = projectData;
                        console.log(`Loaded project ${id}: ${projectData.projectName}`);
                        return projectData;
                    });
            });

            return Promise.all(projectPromises);
        })
        .then(() => {
            console.log('All projects loaded, total projects:', Object.keys(projectsData).length);
            if (document.getElementById('projects-container')) {
                console.log('Rendering projects page');
                renderProjects(Object.values(projectsData));
            }
            if (document.getElementById('featured-projects')) {
                console.log('Rendering featured projects');
                renderFeaturedProjects(Object.values(projectsData));
            }
            return projectsData;
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            // Show error message to user
            const container = document.getElementById('projects-container') || document.getElementById('featured-projects');
            if (container) {
                container.innerHTML = '<p style="color: red;">Error loading projects. Please check the console for details.</p>';
            }
        });
}

// Render projects to the page
function renderProjects(projects) {
    console.log('renderProjects called with', projects.length, 'projects');
    const container = document.getElementById('projects-container');
    if (!container) {
        console.log('projects-container not found');
        return;
    }

    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="no-projects">
                <pre class="ascii-art">
  ╔══════════════════════════════════╗
  ║        CASE OF THE MISSING       ║
  ║            PROJECT               ║
  ╚══════════════════════════════════╝
  "Hmm... my magnifying glass reveals... NOTHING!
               </pre>
           </div>
        `;
        return;
    }

    projects.forEach((project, index) => {
        console.log('Rendering project', index, project ? project.projectName : 'undefined project');
        if (!project) {
            console.log('Project is undefined at index', index);
            return;
        }
        if (!project.tags) {
            console.log('No tags for project', project.projectName, 'setting empty array');
            project.tags = [];
        }
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        const projectDescription = getProjectDescription(project);
        const technologies = getProjectTechnologies(project);
        projectCard.innerHTML = `
            <div class="project-img" style="${project.projectImage ? `background: url(${project.projectImage}) center/cover;` : ''}">
                ${!project.projectImage ? `<i class="fas fa-${getIconForType(project.type)}"></i>` : ''}
            </div>
            <div class="project-content">
                <h3>${project.projectName}</h3>
                <p>${projectDescription ? projectDescription.substring(0, 100) + '...' : 'No description'}</p>
                <div class="project-tags">
                    ${technologies.map(tool => `<div class="tag">${tool}</div>`).join('')}
                </div>
                <a href="project-detail.html?id=${project.id}" class="btn btn-outline">View Details</a>
            </div>
        `;

        projectCard.addEventListener('click', () => {
            window.location.href = `project-detail.html?id=${project.id}`;
        });

        container.appendChild(projectCard);
    });
    console.log('renderProjects completed');
}

// Render featured projects (specified in index.json) to the home page
function renderFeaturedProjects(projects) {
    console.log('renderFeaturedProjects called with', projects.length, 'projects');
    const container = document.getElementById('featured-projects');
    if (!container) {
        console.log('featured-projects not found');
        return;
    }

    container.innerHTML = '';

    // Get featured project IDs from index data (stored in window for access)
    const featuredIds = window.featuredProjectIds || [];
    console.log('Featured project IDs:', featuredIds);

    // Map projects in the exact order specified in featuredIds
    const featuredProjects = featuredIds.map(id => projectsData[id]).filter(project => project);

    featuredProjects.forEach((project, index) => {
        console.log('Rendering featured project', index, project ? project.projectName : 'undefined project');
        if (!project) {
            console.log('Project is undefined at index', index);
            return;
        }
        if (!project.tags) {
            console.log('No tags for project', project.projectName, 'setting empty array');
            project.tags = [];
        }
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        const projectDescription = getProjectDescription(project);
        const technologies = getProjectTechnologies(project);
        projectCard.innerHTML = `
            <div class="project-img" style="${project.projectImage ? `background: url(${project.projectImage}) center/cover;` : ''}">
                ${!project.projectImage ? `<i class="fas fa-${getIconForType(project.type)}"></i>` : ''}
            </div>
            <div class="project-content">
                <h3>${project.projectName}</h3>
                <p>${projectDescription ? projectDescription.substring(0, 100) + '...' : 'No description'}</p>
                <div class="project-tags">
                    ${technologies.map(tool => `<div class="tag">${tool}</div>`).join('')}
                </div>
                <a href="project-detail.html?id=${project.id}" class="btn btn-outline">View Details</a>
            </div>
        `;

        projectCard.addEventListener('click', () => {
            window.location.href = `project-detail.html?id=${project.id}`;
        });

        container.appendChild(projectCard);
    });
    console.log('renderFeaturedProjects completed');
}

// Get appropriate icon based on project type
function getIconForType(type) {
    switch(type) {
        case 'game': return 'gamepad';
        case 'plugin': return 'puzzle-piece';
        case 'tool': return 'toolbox';
        case 'feature': return 'code';
        default: return 'cube';
    }
}

// Function to render project details
function renderProjectDetail(projectId) {
    console.log('renderProjectDetail called with id:', projectId);
    try {
        const titleEl = document.getElementById('project-title');
        const detailTitleEl = document.getElementById('detail-title');
        const detailSubtitleEl = document.getElementById('detail-subtitle');
        const contentContainer = document.getElementById('project-content');

        if (!titleEl || !detailTitleEl || !detailSubtitleEl) {
            console.error('Required project detail elements not found in DOM');
            return;
        }

        if (!contentContainer) {
            console.error('Project content container not found');
            return;
        }

        const project = projectsData[projectId];
        if (!project) {
            console.log('Project not found for id:', projectId);
            titleEl.textContent = 'Project Not Found';
            detailTitleEl.textContent = 'Project Not Found';
            return;
        }
        console.log('Rendering project:', project.projectName);

        // Update page title
        document.getElementById('project-title').textContent = `${project.projectName} | Game Developer Portfolio`;
        document.getElementById('detail-title').textContent = project.projectName;
        const projectDescription = getProjectDescription(project);
        document.getElementById('detail-subtitle').textContent = projectDescription.substring(0, 100) + '...';

        // Set header background
        if (project.headerImage) {
            const hero = document.querySelector('.hero');
            hero.style.backgroundImage = `url(${project.headerImage})`;
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center';
            hero.classList.add('has-bg');
        }

        // Set logo
        const logoEl = document.getElementById('detail-logo');
        if (project.logo) {
            logoEl.src = project.logo;
            logoEl.style.display = 'block';
        } else {
            logoEl.style.display = 'none';
        }

        // Clear and render dynamic content sections
        contentContainer.innerHTML = '';

        // Render links
        if (project.links && project.links.length > 0) {
            const linksDiv = document.createElement('div');
            linksDiv.className = 'project-section';
            linksDiv.innerHTML = `
                <h3>Project Links</h3>
                ${project.links.map(link => `<a href="${link.url}" target="_blank" class="project-link">${link.name}</a>`).join('')}
            `;
            contentContainer.appendChild(linksDiv);
        }

        // Render videos if available
        if (project.videos && project.videos.length > 0) {
            const videosDiv = document.createElement('div');
            videosDiv.className = 'project-section';
            videosDiv.innerHTML = `
                <h3>Videos</h3>
                ${project.videos.map(video => `
                    <div>
                        <h4>${video.name}</h4>
                        <div class="video-container">
                            <iframe src="${video.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                `).join('')}
            `;
            contentContainer.appendChild(videosDiv);
        }

        // Render gallery if available
        if (Array.isArray(project.gallery) && project.gallery.length > 0) {
            const galleryDiv = document.createElement('div');
            galleryDiv.className = 'project-section';
            galleryDiv.innerHTML = `
                <h3>Gallery</h3>
                <div class="gallery-container">
                    ${project.gallery.map(img => `
                        <div class="gallery-item">
                            <img src="${img}" alt="${project.projectName} screenshot">
                        </div>
                    `).join('')}
                </div>
            `;
            contentContainer.appendChild(galleryDiv);
        }

        // Render dynamic sections from project.sections
        if (project.sections && Array.isArray(project.sections)) {
            project.sections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'project-section';
                sectionDiv.innerHTML = `<h3>${section.title}</h3>`;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'section-content';

                switch (section.type) {
                    case 'text':
                        if (typeof section.content === 'string') {
                            contentDiv.innerHTML = `<p>${section.content}</p>`;
                        } else if (Array.isArray(section.content)) {
                            contentDiv.innerHTML = processMarkdownToHtml(section.content);
                        }
                        break;
                    case 'code':
                        if (typeof section.content === 'string') {
                            contentDiv.innerHTML = `<pre class="code-block"><code>${section.content}</code></pre>`;
                        } else if (Array.isArray(section.content)) {
                            contentDiv.innerHTML = `<pre class="code-block"><code>${section.content.join('\n')}</code></pre>`;
                        }
                        break;
                    case 'markdown':
                        if (typeof section.content === 'string') {
                            contentDiv.innerHTML = processMarkdownToHtml([section.content]);
                        } else if (Array.isArray(section.content)) {
                            contentDiv.innerHTML = processMarkdownToHtml(section.content);
                        }
                        break;
                    case 'list':
                        if (Array.isArray(section.content)) {
                            contentDiv.innerHTML = `<ul>${section.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
                        }
                        break;
                    case 'image':
                        if (typeof section.content === 'string') {
                            contentDiv.innerHTML = `<img src="${section.content}" alt="${section.title}">`;
                        }
                        break;
                    case 'complex':
                        if (section.content && typeof section.content === 'object') {
                            if (section.content.image) {
                                contentDiv.innerHTML += `<img src="${section.content.image}" alt="${section.title} illustration">`;
                            }
                            if (section.content.description && Array.isArray(section.content.description)) {
                                contentDiv.innerHTML += processMarkdownToHtml(section.content.description);
                            }
                            if (section.content.items) {
                                let title = '';
                                let itemsArray = [];
                                if (Array.isArray(section.content.items)) {
                                    itemsArray = section.content.items;
                                } else if (typeof section.content.items === 'object' && section.content.items.items && Array.isArray(section.content.items.items)) {
                                    title = section.content.items.title || '';
                                    itemsArray = section.content.items.items;
                                }
                                if (itemsArray.length > 0) {
                                    const listClass = section.title === "Technologies Used" ? "tech-stack-list" : "features-list";
                                    contentDiv.innerHTML += `
                                        ${title ? `<h4>${title}</h4>` : ''}
                                        <ul class="${listClass}">
                                            ${itemsArray.map(item => `<li>${item}</li>`).join('')}
                                        </ul>
                                    `;
                                }
                            }
                            if (section.content.coreElements && typeof section.content.coreElements === 'object' && section.content.coreElements.elements && Array.isArray(section.content.coreElements.elements)) {
                                const title = section.content.coreElements.title;
                                contentDiv.innerHTML += `
                                    ${title ? `<h4>${title}</h4>` : ''}
                                    <ul>
                                        ${section.content.coreElements.elements.map(el => {
                                            let desc = Array.isArray(el.description) ? processMarkdownToHtml(el.description) : el.description;
                                            return `<li><strong>${el.element}:</strong> ${desc}</li>`;
                                        }).join('')}
                                    </ul>
                                `;
                            }
                            if (section.content.embedLink) {
                                contentDiv.innerHTML += `<div class="video-container"><iframe src="${section.content.embedLink}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                            }
                            if (section.content.externalLink) {
                                contentDiv.innerHTML += `<a href="${section.content.externalLink}" target="_blank" class="project-link">View External Link</a>`;
                            }
                        }
                        break;
                    default:
                        contentDiv.innerHTML = '<p>Unsupported section type.</p>';
                }

                sectionDiv.appendChild(contentDiv);
                contentContainer.appendChild(sectionDiv);
            });
        }
    } catch (e) {
        console.error('Error in renderProjectDetail:', e);
    }

    // Syntax highlighting removed - Prism.js was causing errors
}

// Function to filter projects
function filterProjects() {
    const typeFilter = document.getElementById('type-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();

    let filteredProjects = Object.values(projectsData);

    if (typeFilter !== 'all') {
        filteredProjects = filteredProjects.filter(project => {
            if (!project.projectType || !Array.isArray(project.projectType)) return false;
            return project.projectType.some(type => type.toLowerCase().includes(typeFilter));
        });
    }

    if (categoryFilter !== 'all') {
        filteredProjects = filteredProjects.filter(project =>
            project.categories && project.categories.includes(categoryFilter)
        );
    }

    if (searchFilter) {
        filteredProjects = filteredProjects.filter(project =>
            project.projectName.toLowerCase().includes(searchFilter) ||
            project.projectDescription.toLowerCase().includes(searchFilter) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchFilter))
        );
    }

    renderProjects(filteredProjects);
}

// Initialize filter event listeners
function initFilters() {
    const typeFilter = document.getElementById('type-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchFilter = document.getElementById('search-filter');
    
    if (typeFilter) typeFilter.addEventListener('change', filterProjects);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProjects);
    if (searchFilter) searchFilter.addEventListener('input', filterProjects);
}