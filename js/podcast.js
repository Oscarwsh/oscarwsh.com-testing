// ======= +2 PODCAST GLOBAL ARCHITECTURE =======
const SPOTIFY_RSS_URL = "https://anchor.fm"; 

let EPISODES = [];
let scrollAmount = 0;
const scrollStep = 400; // Pixels shifted per slide transition toggle click
const autoScrollInterval = 4500; // Carousel automated sliding loop interval delay

// Cache target structural container nodes safely from global DOM trees
const carousel = document.getElementById("podcastCarousel");
const latestContainer = document.getElementById("latestEpisode");

// ======= CORE INITIALIZATION LOGIC =======
function initDynamicPodcast() {
    // Utilize public secure RSS-to-JSON engine proxying framework to completely sidestep browser CORS request blockage
    fetch(`https://rss2json.com{encodeURIComponent(SPOTIFY_RSS_URL)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.status === 'ok' && data.items && data.items.length > 0) {
                // Populate global layout cache array block
                EPISODES = data.items;

                // Fire presentation builder layout layers
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

// ======= ADVANCED STRING TRANSLATION PIPELINE =======
function convertToEmbed(episodeData) {
    if (!episodeData) return "https://spotify.com";
    
    const url = episodeData.link || "";
    const guid = episodeData.guid || "";
    
    // Pattern 1: URL contains a direct link with /episode/ format
    if (url.includes("/episode/")) {
        const parts = url.split("/episode/");
        if (parts[1]) {
            const id = parts[1].split("?")[0];
            return `https://spotify.com{id}?theme=0`;
        }
    }
    
    // Pattern 2: Process direct guid hashes from standard Anchor RSS strings safely
    if (guid.includes("anchor.fm/") || guid.includes("podcasters.spotify.com/")) {
        const cleanGuid = guid.split("?")[0];
        const pieces = cleanGuid.split("/");
        const extractedId = pieces[pieces.length - 1];
        if (extractedId) {
            return `https://spotify.com{extractedId}?theme=0`;
        }
    }

    // Pattern 3: Process links directly via URL string parsing fallback loops
    if (url.includes("anchor.fm/") || url.includes("podcasters.spotify.com/")) {
        const cleanUrl = url.split("?")[0];
        const pieces = cleanUrl.split("/");
        const extractedId = pieces[pieces.length - 1];
        if (extractedId) {
            return `https://spotify.com{extractedId}?theme=0`;
        }
    }
    
    // Baseline backup default: Fall back to embedding your main show profile view node context
    return "https://spotify.com";
}

// ======= LATEST RELEASE INJECTION =======
function loadLatestEpisode() {
    if (!latestContainer || EPISODES.length === 0) return;

    // Anchor updates log dynamic feeds with position index 0 matching your absolute newest release record
    const latest = EPISODES[0]; 
    const embedUrl = convertToEmbed(latest);
    
    latestContainer.innerHTML = `
        <iframe
            src="${embedUrl}"
            width="100%"
            height="232"
            frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style="border-radius:12px; border: none;">
        </iframe>
    `;
}

// ======= DYNAMIC CAROUSEL BUILDER =======
function loadEpisodesCarousel() {
    if (!carousel || EPISODES.length === 0) return;
    
    // Flush manual strings or loading texts
    carousel.innerHTML = "";

    // Display episodes (RSS lists newest first)
    EPISODES.forEach((episode, i) => {
        const card = document.createElement("div");
        card.className = "podcast-card";

        const episodeTitle = episode.title || `Episode ${EPISODES.length - i}`;
        const embedUrl = convertToEmbed(episode);

        card.innerHTML = `
            <iframe
                data-src="${embedUrl}"
                width="100%"
                height="232"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style="border-radius:12px; border: none;">
            </iframe>
            <h3 class="podcast-title" style="font-size: 14px; margin-top: 8px; text-align: center;">${episodeTitle}</h3>
        `;

        carousel.appendChild(card);
    });

    // Invoke observation attachment routines
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

    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
        scrollAmount = 0;
    }

    carousel.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
    });
}

// Bind click event observers to manual arrow toggles safely
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

// Initialize sliding intervals tracker loop
setInterval(scrollCarousel, autoScrollInterval);

// ======= GLOBAL EXECUTION SEQUENCE ON DOM READY =======
document.addEventListener("DOMContentLoaded", () => {
    initDynamicPodcast();
});
