async function loadGallerySection(galleryFolder, placeholderSelector) {
    try {
        const galleryJsonPath = `images/galleries/${galleryFolder}/gallery.json`;
        const templatePath = `projects/gallery-template.html`;

        // Fetch gallery data and template
        const [galleryResponse, templateResponse] = await Promise.all([
            fetch(galleryJsonPath),
            fetch(templatePath)
        ]);

        if (!galleryResponse.ok || !templateResponse.ok) {
            throw new Error("Failed to load gallery data or template.");
        }

        const galleryData = await galleryResponse.json();
        const templateHtml = await templateResponse.text();

        // Insert the gallery template into the placeholder
        const placeholder = document.querySelector(placeholderSelector);
        placeholder.innerHTML = templateHtml;

        // Populate the gallery with images
        initializeGallery(galleryData.gallery, placeholderSelector, galleryFolder);
    } catch (error) {
        console.error("Error loading gallery template:", error);
    }
}

function initializeGallery(images, placeholderSelector, folder) {
    const container = document.querySelector(`${placeholderSelector} .gallery-container`);
    const caption = document.querySelector(`${placeholderSelector} .gallery-caption`);
    const prevButton = document.querySelector(`${placeholderSelector} .prev-button`);
    const nextButton = document.querySelector(`${placeholderSelector} .next-button`);

    let activeIndex = 0;

    // Populate the gallery with images
    images.forEach((item, index) => {
        const img = document.createElement("img");
        img.src = `images/galleries/${folder}/${item.image}`;
        img.alt = item.caption;
        img.classList.add("gallery-image");

        // Only the first image should be active initially
        if (index === 0) {
            img.classList.add("active");
        }

        container.appendChild(img);
    });

    // Display the first caption
    caption.textContent = images[0].caption;
    caption.classList.add("active");

    // Navigation logic
    const updateGallery = (direction) => {
        // Remove active class from current elements
        const allImages = container.querySelectorAll("img");
        allImages[activeIndex].classList.remove("active");

        if (caption) caption.classList.remove("active");

        // Update index based on direction
        if (direction === "next") {
            activeIndex = (activeIndex + 1) % images.length; // Loop forward
        } else if (direction === "prev") {
            activeIndex = (activeIndex - 1 + images.length) % images.length; // Loop backward
        }

        // Add active class to the new elements
        allImages[activeIndex].classList.add("active");

        if (caption) {
            caption.textContent = images[activeIndex].caption;
            caption.classList.add("active");
        }
    };

    // Button event listeners
    prevButton.addEventListener("click", () => updateGallery("prev"));
    nextButton.addEventListener("click", () => updateGallery("next"));
}

