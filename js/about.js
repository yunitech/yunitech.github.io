// About data loaded from about.json
let aboutData = null;
const CACHE_KEY = 'aboutData';
const TIMESTAMP_KEY = 'aboutTimestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to load about data from JSON
function loadAbout() {
    console.log('Loading about data...');

    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
    const now = Date.now();

    if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
        console.log('Using cached about data');
        aboutData = JSON.parse(cachedData);
        renderAbout();
        return Promise.resolve(aboutData);
    }

    // Fetch from server
    return fetch('about.json')
        .then(response => {
            console.log('Fetch response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('About data parsed');
            aboutData = data;

            // Cache the data
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(TIMESTAMP_KEY, now.toString());

            renderAbout();
            return data;
        })
        .catch(error => {
            console.error('Error loading about data:', error);
            // Show error message
            const container = document.getElementById('about-content');
            if (container) {
                container.innerHTML = '<p style="color: red;">Error loading about section. Please check the console for details.</p>';
            }
        });
}

// Render about section
function renderAbout() {
    if (!aboutData) {
        console.log('No about data to render');
        return;
    }

    const container = document.getElementById('about-content');
    if (!container) {
        console.log('about-content container not found');
        return;
    }

    // Separate text and media sections
    const textSections = aboutData.sections.filter(section => section.type !== 'media');
    const mediaSections = aboutData.sections.filter(section => section.type === 'media');

    // Build text content
    let textHtml = '';
    textSections.forEach(section => {
        if (section.optional && (!section.content && !section.items)) {
            return; // Skip optional empty sections
        }

        try {
            switch (section.type) {
                case 'heading':
                    const level = section.level || 3;
                    textHtml += `<h${level}>${section.content}</h${level}>`;
                    break;
                case 'paragraph':
                    textHtml += `<p>${section.content}</p>`;
                    break;
                case 'list':
                    if (section.items && Array.isArray(section.items)) {
                        textHtml += '<div class="skills">';
                        section.items.forEach(item => {
                            textHtml += `<div class="skill">${item}</div>`;
                        });
                        textHtml += '</div>';
                    }
                    break;
                default:
                    console.warn('Unknown section type:', section.type);
            }
        } catch (e) {
            console.error('Error rendering section:', section, e);
        }
    });

    // Build media content
    let mediaHtml = '';
    mediaSections.forEach(section => {
        if (section.optional && !section.class && !section.src) {
            return;
        }

        try {
            if (section.mediaType === 'icon') {
                const containerClass = section.containerClass || 'about-image';
                const wrapperClass = section.wrapperClass || 'project-img floating';
                const iconClass = section.class || 'fas fa-code';
                mediaHtml += `<div class="${containerClass}"><div class="${wrapperClass}"><i class="${iconClass}"></i></div></div>`;
            } else if (section.mediaType === 'image' && section.src) {
                mediaHtml += `<div class="about-image"><img src="${section.src}" alt="${section.alt || ''}"></div>`;
            } else if (section.mediaType === 'link' && section.url) {
                mediaHtml += `<div class="about-link"><a href="${section.url}" target="_blank">${section.text || section.url}</a></div>`;
            }
        } catch (e) {
            console.error('Error rendering media section:', section, e);
        }
    });

    // Combine into final HTML
    container.innerHTML = `
        <div class="about-text">
            ${textHtml}
        </div>
        ${mediaHtml}
    `;

    console.log('About section rendered');
}

// Initialize about loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('about-content')) {
        loadAbout();
    }
});