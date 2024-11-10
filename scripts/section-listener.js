// Get modal elements
const modal = document.getElementById("project-modal");
const modalDetails = document.getElementById("modal-details");
const closeModal = document.querySelector(".close-btn");

// Sample project details (you can fetch this from a server or database)
const projectDetails = {
    project1: `<h2>Project 1: Real-Time Strategy Mechanics</h2><p>Detailed description of Project 1...</p>`,
    project2: `<h2>Project 2: Advanced AI for Action Games</h2><p>Detailed description of Project 2...</p>`
};

// Event listener for project cards
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", function() {
        const projectId = this.getAttribute("data-project");
        modalDetails.innerHTML = projectDetails[projectId]; // Load project-specific content
        modal.style.display = "flex"; // Show modal
    });
});

// Event listener for close button
closeModal.addEventListener("click", () => {
    modal.style.display = "none"; // Hide modal
});

// Optional: Close modal when clicking outside of modal content
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
