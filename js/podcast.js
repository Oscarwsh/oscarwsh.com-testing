// ======= +2 PODCAST GLOBAL ARCHITECTURE =======
// Automatically bound to your live Anchor distribution pipeline
const SPOTIFY_RSS_URL = "https://anchor.fm"; 

let EPISODES = [];
let scrollAmount = 0;
const scrollStep = 400; // Pixels per slide shift movement
const autoScrollInterval = 4500; // Slide rotation timing window

// Cache target structural container nodes
const carousel = document.getElementById("podcastCarousel");
const latestContainer = document.getElementById("latestEpisode");

// ======= CORE INITIALIZATION LOGIC =======
function initDynamicPodcast() {
    // Convert live XML distribution feed data straight to clean JSON notation mapping via proxy
    fetch(`https://rss2json.com{encodeURIComponent(SPOTIFY_RSS_URL)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items.length > 0) {
                // Populate universal memory matrix. RSS logs newest releases at index item zero (0).
                EPISODES = data.items;

                // Fire presentation engines
                loadLatestEpisode();
                loadEpisodesCarousel();
            } else {
                if (latestContainer) latestContainer.innerText = "Failed to sync episodes.";
                if (carousel) carousel.innerText = "Failed to sync carousel items.";
            }
        })
        .catch(err => {
            console.error("Error fetching the podcast feed:", err);
            if (latestContainer) latestContainer.innerText = "Error linking to live feed.";
            if (carousel) carousel.innerText = "Error linking to live feed.";
        });
}

// ======= CONVERSION TRANSLATION FILTER MATRIX =======
function convertToEmbed(episodeData) {
    if (!episodeData || !episodeData.link) return "";
    
    const url = episodeData.link;
    
    // Check if link array pattern matching yields explicit episode variables
    if (url.includes("/episode/")) {
        const baseParts = url.split("/episode/");
        const id = baseParts[1].split("?")[0];
        return `https://spotify.com{id}?theme=0`;
    }
    
    // Fallback translation: Extract raw hash strings mapped straight out of guid markers
    if (episodeData.guid && episodeData.guid.includes("anchor.fm/")) {
        const parts = episodeData.guid.split("/");
        const id = parts[parts.length - 1];
        // Redirecting back safely into your core open Spotify show window mapping structure
        return `https://spotify.com`;
    }
    
    return `https://spotify.com`;
}

// ======= LATEST RELEASE INJECTION =======
function loadLatestEpisode() {
    if (!latestContainer || EPISODES.length === 0) return;

    // Fetch actual target index item 0 (the absolute latest live podcast installment record)
    const latest = EPISODES[0]; 
    latestContainer.innerHTML = `
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

// ======= DYNAMIC CAROUSEL BUILDER =======
function loadEpisodesCarousel() {
    if (!carousel || EPISODES.length === 0) return;
    
    // Purge lingering native tracking loaders
    carousel.innerHTML = "";

    // Loop through global array structures dynamically
    EPISODES.forEach((episode, i) => {
        const card = document.createElement("div");
        card.className = "podcast-card";

        // Assign clean target headings or construct string index identifiers safely
        const episodeTitle = episode.title || `Episode ${EPISODES.length - i}`;

        card.innerHTML = `
            <iframe
                data-src="${convertToEmbed(episode)}"
                width="100%"
                height="232"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style="border-radius:12px">
            </iframe>
            <h3 class="podcast-title" style="font-size: 14px; margin-top: 8px; text-align: center;">${episodeTitle}</h3>
        `;

        carousel.appendChild(card);
    });

    // Fire lazy loading sequence engine
    setupCarouselObserver();
}

// ======= LAZY LOADING INTERSECTION OBSERVER =======
function setupCarouselObserver() {
    if (!carousel) return;

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

// ======= ROTATION TRANSITION INTERFACES =======
function scrollCarousel() {
    if (!carousel || EPISODES.length === 0) return;
    scrollAmount += scrollStep;

    // Loop index layout variables back to track base positions once maximum bounds are broken
    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
        scrollAmount = 0;
    }

    carousel.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
    });
}

// Bind click events on control button systems if they exist on the page
const nextButton = document.querySelector(".podcast-arrow.next");
const prevButton = document.querySelector(".podcast-arrow.prev");

if (nextButton) {
    nextButton.onclick = () => {
        if (!carousel) return;
        scrollAmount += scrollStep;
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) scrollAmount = 0;
        carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
    };
}

if (prevButton) {
    prevButton.onclick = () => {
        if (!carousel) return;
        scrollAmount -= scrollStep;
        if (scrollAmount < 0) scrollAmount = carousel.scrollWidth - carousel.clientWidth;
        carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
    };
}

// Trigger interval slider rotation
setInterval(scrollCarousel, autoScrollInterval);

// ======= GLOBAL EXECUTION SEQUENCE ON DOM READY =======
document.addEventListener("DOMContentLoaded", () => {
    initDynamicPodcast();
});
