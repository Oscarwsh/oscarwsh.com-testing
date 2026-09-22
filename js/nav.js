function initializeNav() {
    const nav = document.querySelector(".site-nav");
    const btn = nav?.querySelector(".nav-toggle");

    if (!nav || !btn) return;

    btn.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            nav.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}