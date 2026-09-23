// ======= +2 PODCAST GLOBAL ARCHITECTURE =======
const RAW_RSS_URL = "https://anchor.fm"; 
// Bypasses browser security layout blocks flawlessly on GitHub Pages
const SPOTIFY_RSS_URL = `https://corsproxy.io{encodeURIComponent(RAW_RSS_URL)}`;

let EPISODES = [];
let scrollAmount = 0;
const scrollStep = 400; // Pixels shifted per slide transition toggle click
const autoScrollInterval = 4500; // Carousel automated sliding loop interval delay

// Cache target structural container nodes safely from global DOM trees
const carousel = document.getElementById("podcastCarousel");
const latestContainer = document.getElementById("latestEpisode");

// ======= CORE INITIALIZATION LOGIC =======
function initDynamicPodcast() {
    fetch(SPOTIFY_RSS_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network data sync failure');
            return response.text(); // Read raw XML data stream
        })
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            if (items && items.length > 0) {
                // Map XML nodes list cleanly into a JavaScript array matrix
                EPISODES = Array.from(items).map(item => {
                    return {
                        title: item.querySelector("title") ? item.querySelector("title").textContent : "",
                        link: item.querySelector("link") ? item.querySelector("link").textContent : "",
                        guid: item.querySelector("guid") ? item.querySelector("guid").textContent : ""
                    };
                });

                // Clear out loading placeholders and build view layouts
                loadLatestEpisode();
                loadEpisodesCarousel();
            } else {
                showErrorText("No episodes found in feed.");
            }
        })
        .catch(err => {
            console.error("Podcast synchronization crash log:", err);
            showErrorText("Error syncing with your live podcast pipeline.");
        });
}

function showErrorText(msg) {
    if (latestContainer) latestContainer.innerHTML = `<span style="color:#b3b3b3; font-size:14px;">${msg}</span>`;
    if (carousel) carousel.innerHTML = `<span style="color:#b3b3b3; font-size:14px;">${msg}</span>`;
}

// ======= ROBUST EMBED ID PARSER (FIXED) =======
function convertToEmbed(episodeData) {
    if (!episodeData) return "https://spotify.com";
    
    let url = episodeData.link || "";
    let guid = episodeData.guid || "";
    
    if (typeof url !== "string") url = "";
    if (typeof guid !== "string") guid = "";

    // Pattern 1: Handle standard direct /episode/ layout formatting safely
    if (url.includes("/episode/")) {
        const parts = url.split("/episode/");
        if (parts && parts.length > 1) {
            const id = parts[1].split("?")[0];
            return `https://spotify.com{id}?theme=0`;
        }
    }
    
    // Pattern 2: Convert standard Anchor page links to clean interactive embeds
    // Converts: .../oscarwsh/episodes/title-e2g1abc -> .../oscarwsh/embed/episodes/title-e2g1abc
    if (url.includes("anchor.fm") && url.includes("/episodes/")) {
        const cleanUrl = url.split("?")[0];
        return cleanUrl.replace("/episodes/", "/embed/episodes/");
    }
    
    // Pattern 3: Fallback translation filter handling for modern podcasters.spotify mapping schemas
    if (url.includes("podcasters.spotify.com") && url.includes("/episodes/")) {
        const cleanUrl = url.split("?")[0];
        const pieces = cleanUrl.split("/episodes/");
        if (pieces && pieces.length > 1) {
            const episodeSlugAndId = pieces[1];
            return `https://anchor.fm{episodeSlugAndId}`;
        }
    }
    
    // Baseline backup default: Fall back to embedding your main show profile player list
    return "https://spotify.com";
}

// ======= LATEST RELEASE INJECTION =======
function loadLatestEpisode() {
    if (!latestContainer || EPISODES.length === 0) return;

    const latest = EPISODES[0]; // Index 0 is always your absolute newest release record
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
    
    carousel.innerHTML = "";

    // Display all episodes directly out of your live RSS data array
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

// Bind arrow control event handlers safely
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

setInterval(scrollCarousel, autoScrollInterval);

document.addEventListener("DOMContentLoaded", () => {
    initDynamicPodcast();
});
