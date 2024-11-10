document.addEventListener("DOMContentLoaded", () => {
    // Select the original section navigation
    const originalNav = document.getElementById("section-nav-original");

    // Find the placeholder where the navigation should be cloned
    const placeholder = document.querySelector(".section-nav-clone-placeholder");

    // Clone the original navigation
    const clone = originalNav.cloneNode(true);
    
    // Remove the ID from the cloned nav to avoid duplicate IDs in the DOM
    clone.removeAttribute("id");
    
    // Append the cloned navigation to the placeholder
    placeholder.appendChild(clone);
});