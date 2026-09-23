// ======= +2 PODCAST GLOBAL ARCHITECTURE =======
const SPOTIFY_RSS_URL = "https://anchor.fm"; 

let EPISODES = [];
let scrollAmount = 0;
const scrollStep = 400; 
const autoScrollInterval = 4500; 

// Cache target structural container nodes safely
const carousel = document.getElementById("podcastCarousel");
const latestContainer = document.getElementById("latestEpisode");

// ======= CORE INITIALIZATION LOGIC =======
function initDynamicPodcast() {
    // Pull data directly from Spotify without third-party proxy sites
    fetch(SPOTIFY_RSS_URL, { 
        method: 'GET',
        credentials: 'omit' // Strips cookies to bypass CORS blocks cleanly
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response failure');
        return response.text(); // Read raw XML directly
    })
    .then(xmlString => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        if (items && items.length > 0) {
            // Map XML records straight into your layout array
            EPISODES = Array.from(items).map(item => {
                return {
                    title: item.querySelector("title") ? item.querySelector("title").textContent : "",
                    link: item.querySelector("link") ? item.querySelector("link").textContent : "",
                    guid: item.querySelector("guid") ? item.querySelector("guid").textContent : ""
                };
            });

            // Fire presentation engines
            loadLatestEpisode();
            loadEpisodesCarousel();
        } else {
            showErrorText("No episodes found in feed.");
        }
    })
    .catch(err => {
        console.error("Direct connection error:", err);
        showErrorText("Error syncing with your live podcast pipeline.");
    });
}

function showErrorText(msg) {
    if (latestContainer) latestContainer.innerHTML = `<span style="color:#b3b3b3; font-size:14px;">${msg}</span>`;
    if (carousel) carousel.innerHTML = `<span style="color:#b3b3b3; font-size:14px;">${msg}</span>`;
}

// ======= TRANSLATION FILTER MATRIX =======
function convertToEmbed(episodeData) {
    if (!episodeData) return "https://spotify.com";
    
    const url = episodeData.link || "";
    const guid = episodeData.guid || "";
    
    // Pattern 1: URL contains direct /episode/ layout format
    if (url.includes("/episode/")) {
        const id = url.split("/episode/")[1].split("?")[0];
        return `https://spotify.com{id}?theme=0`;
    }
    
    // Pattern 2: Extract alphanumeric hash block directly from Anchor GUID structures
    const fallbackSource = guid.includes("anchor.fm") ? guid : url;
    if (fallbackSource.includes("anchor.fm/") || fallbackSource.includes("://spotify.com")) {
        const cleanUrl = fallbackSource.split("?")[0];
        const pieces = cleanUrl.split("/");
        const extractedId = pieces[pieces.length - 1];
        if (extractedId && extractedId.length > 5) {
            return `https://spotify.com{extractedId}?theme=0`;
        }
    }
    
    return "https://spotify.com";
}

// ======= LATEST RELEASE INJECTION =======
function loadLatestEpisode() {
    if (!latestContainer || EPISODES.length === 0) return;

    const latest = EPISODES[0]; // Index 0 is always your absolute newest release
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

// Bind arrow control listeners
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
