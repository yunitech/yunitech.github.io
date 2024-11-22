// JavaScript source code
(function initializeModalManager() {
    console.log("Modal manager loaded.");

    // Reference modal elements
    const modal = document.getElementById("project-modal");
    const modalContent = modal.querySelector(".modal-content");
    const closeModalButton = modal.querySelector(".close-btn");

    function ensureCloseButton() {
        let closeModalButton = modal.querySelector(".close-btn");
        if (!closeModalButton) {
            closeModalButton = document.createElement("button");
            closeModalButton.classList.add("close-btn");
            closeModalButton.textContent = "×";
            modal.appendChild(closeModalButton);

            // Attach event listener for the close button
            closeModalButton.addEventListener("click", closeModal);
        }
    }

    // Close modal logic
    function closeModal() {
        console.log("Closing modal...");
        modal.style.display = "none";
        modalContent.innerHTML = ""; // Clear content
        document.body.classList.remove("modal-active");
        if (history.state && history.state.modalOpen) {
            history.back(); // Restore previous history state
        }
    }

    // Event listeners
    modal.addEventListener("click", (event) => {
        console.log("Click detected on modal");
        if (event.target === modal) {
            closeModal();
        }
    });

    closeModalButton.addEventListener("click", () => {
        console.log("Close button clicked");
        closeModal();
    });

    document.addEventListener("keydown", (event) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    window.addEventListener("popstate", (event) => {
        console.log("popstate event detected:", event.state);

        const modal = document.getElementById("project-modal");
        if (event.state && event.state.modalOpen) {
            console.log("Back button used with modal open state.");
            closeModal(); // Close modal if open
        } else if (modal.style.display === "flex") {
            console.log("Modal open, but no modalOpen state. Closing modal.");
            closeModal();
        } else {
            console.log("Default navigation.");
            // Allow default back navigation behavior
        }
    });

    // Remove stray buttons from the DOM
    document.querySelectorAll(".close-btn").forEach((button) => {
        if (!button.closest("project-modal")) {
            button.remove();
            console.log("Removed stray close button:", button);
        }
    });

    // Ensure the close button exists when opening the modal
    document.addEventListener("modalOpen", () => {
        ensureCloseButton();
    });

    console.log("Modal manager initialized.");
})();
