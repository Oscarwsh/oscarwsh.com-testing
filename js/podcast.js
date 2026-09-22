// ======= EPISODES LIST =======
const EPISODES = [
    "https://open.spotify.com/episode/7gXsD7WvGL2vgaL4DcCV73?si=NeyF-brrTg6Su8SG6d32Nw",
    "https://open.spotify.com/episode/79CaqQBI5lf2UDAgos8sAh?si=BOUCFLcBT7Kc4Qcvuzf2Xg",
    "https://open.spotify.com/episode/6Do6mlndjDcwQgcDu6338h?si=ArvOZT2ETiGWQXH3EigmXg",
    "https://open.spotify.com/episode/1JB9ivsNimSci1cSzpYw63?si=vN6WhO3LR-q6alwHP6GvKg",
    "https://open.spotify.com/episode/3V9gpnBYqOsoGalte7OJJc?si=6JSp_0egRYe-6DlgQoawcw",
    "https://open.spotify.com/episode/7oawpAszvD3COq1DzkJCMJ?si=lZOhEoLjTLS1Hu9nj1JCTg",
    "https://open.spotify.com/episode/17dxkU9jCFQSEUlds3Ka0C?si=RCh7xPgzRhGEmp0foTUTvQ",
    "https://open.spotify.com/episode/0n7YwwqznpfANClkiRnunr?si=0Xx0WxYrSLO0O3L5ykekvg",
    "https://open.spotify.com/episode/1bLTGVAxudnxVLcyFwJbMq?si=cs5AJAceQwCfOMT4aoQ4rA",
    "https://open.spotify.com/episode/7wuc3SJbh5LLvUpK56pEFU?si=sucX0ZN-T8iliOFIu1VyHA",
    "https://open.spotify.com/episode/1nQIcv1UoAgUdN87Yw4kGS?si=zz-pWmGCSU-SGGw8gxrBnQ",
    "https://open.spotify.com/episode/65XZVz0pKijUB6EOW9HSnM?si=Dz4spTrhRsSf-AEnJBAE6A",
];

// ======= HELPER FUNCTION =======
function convertToEmbed(url) {
    const id = url.split("/episode/")[1].split("?")[0];
    return `https://open.spotify.com/embed/episode/${id}?theme=0`;
}

// ======= LATEST EPISODE SECTION =======
function loadLatestEpisode() {
    const container = document.getElementById("latestEpisode");
    if (!container) return;

    const latest = EPISODES[EPISODES.length - 1]; // newest episode last
    container.innerHTML = `
        <iframe
            src="${convertToEmbed(latest)}"
            width="100%"
            height="232"
            frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style="border-radius:12px">
        </iframe>
    `;
}

// ======= CAROUSEL =======
const carousel = document.getElementById("podcastCarousel");

function loadEpisodesCarousel() {
    // Reverse order for newest first
    EPISODES.slice().reverse().forEach((url, i) => {
        const card = document.createElement("div");
        card.className = "podcast-card";

        // Lazy-load: use data-src, load iframe only when near viewport
        card.innerHTML = `
            <iframe
                data-src="${convertToEmbed(url)}"
                width="100%"
                height="232"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style="border-radius:12px">
            </iframe>
            <h3 class="podcast-title">Episode ${EPISODES.length - i}</h3>
        `;

        carousel.appendChild(card);
    });

    // Setup IntersectionObserver for lazy-loading iframes
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target.querySelector("iframe");
                    if (iframe && iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                        delete iframe.dataset.src;
                        obs.unobserve(entry.target);
                    }
                }
            });
        },
        { root: carousel, rootMargin: "200px", threshold: 0.1 }
    );

    document.querySelectorAll(".podcast-card").forEach(card => observer.observe(card));
}

// ======= CAROUSEL SCROLL =======
let scrollAmount = 0;
const scrollStep = 400; // pixels per move
const autoScrollInterval = 4500;

function scrollCarousel() {
    if (!carousel) return;
    scrollAmount += scrollStep;

    // infinite scroll: reset if reach end
    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
        scrollAmount = 0;
    }

    carousel.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
    });
}

// ======= ARROWS =======
document.querySelector(".podcast-arrow.next").onclick = () => {
    scrollAmount += scrollStep;
    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) scrollAmount = 0;
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
};

document.querySelector(".podcast-arrow.prev").onclick = () => {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) scrollAmount = carousel.scrollWidth - carousel.clientWidth;
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
};

// ======= AUTO SLIDE =======
setInterval(scrollCarousel, autoScrollInterval);

// ======= INIT =======
document.addEventListener("DOMContentLoaded", () => {
    loadLatestEpisode();
    loadEpisodesCarousel();
});