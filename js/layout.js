async function loadComponent(id, file) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(new URL(file, document.baseURI));
        if (!response.ok) throw new Error(`Could not load ${file}`);

        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        placeholder.textContent = `Could not load ${id.replace("-placeholder", "")}.`;
        return;
    }

    if (id === "nav-placeholder") {
        highlightCurrentPage();

        if (typeof initializeNav === "function") {
            initializeNav();
        }
    }
}

function highlightCurrentPage() {

    let currentPage = window.location.pathname.split("/").pop().split("?")[0];

    // Default homepage
    if (currentPage === "") {
        currentPage = "index.html";
    }

    const navLinks = document.querySelectorAll(".menu a");

    navLinks.forEach(link => {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("current-page");
        }

    });
}

loadComponent("nav-placeholder", "nav.html");
loadComponent("footer-placeholder", "footer.html");