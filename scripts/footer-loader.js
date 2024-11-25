function loadFooter(footerPath) {
    fetch(footerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("footer-placeholder").innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading footer:", error);
        });
}

// Load footer dynamically
document.addEventListener("DOMContentLoaded", () => {
    loadFooter("footer.html");
});
