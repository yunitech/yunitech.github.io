// JavaScript source code
document.getElementById("main-nav-placeholder").innerHTML = `
        <nav class="main-nav">
            <a href="index.html" class="nav-link" data-page="home-page">Home</a>
            <a href="projects.html" class="nav-link" data-page="projects-page">Projects</a>
            <a href="about.html" class="nav-link" data-page="about-page">About</a>
        </nav>
    `;

// Highlight active page
const currentPage = document.body.classList[0];
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.page === currentPage) {
        link.classList.add("active");
    }
});