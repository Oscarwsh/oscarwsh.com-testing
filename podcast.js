// ======= +2 PODCAST GLOBAL ARCHITECTURE =======
const RAW_RSS_URL = "https://anchor.fm"; 

let EPISODES = [];
let scrollAmount = 0;
const scrollStep = 400; // Pixels shifted per slide transition toggle click
const autoScrollInterval = 4500; // Carousel automated sliding loop interval delay

// Cache target structural container nodes safely from global DOM trees
const carousel = document.getElementById("podcastCarousel");
const latestContainer = document.getElementById("latestEpisode");

// ======= CORE INITIALIZATION LOGIC =======
function initDynamicPodcast() {
    // Utilizing a redundant, high-uptime secure API relay matrix that handles anchor layouts cleanly
    fetch(`https://rss2json.com{encodeURIComponent(RAW_RSS_URL)}&api_key=00000000000000000000000000000000`)
        .then(response => {
            if (!response.ok) throw new Error('Network bridge failure');
            return response.json();
        })
        .then(data => {
            if (data && data.status === 'ok' && data.items && data.items.length > 0) {
                // Populate universal layout cache array block
                EPISODES = data.items;

                // Fire presentation builder layout layers
                loadLatestEpisode();
                loadEpisodesCarousel();
            } else {
                // Fallback attempt: Try loading via an open alternative engine if primary times out
                fetchDirectXMLFallback();
            }
        })
        .catch(err => {
            console.warn("Primary fetch bridge failed, attempting direct engine layout fallback...", err);
            fetchDirectXMLFallback();
        });
}

// ======= BACKUP DIRECT XML FETCH PIPELINE =======
function fetchDirectXMLFallback() {
    fetch(`https://allorigins.win{encodeURIComponent(RAW_RSS_URL)}`)
        .then(res => {
            if (!res.ok) throw new Error('AllOrigins failure');
            return res.json();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            if (items && items.length > 0) {
                EPISODES = Array.from(items).map(item => {
                    return {
                        title: item.querySelector("title") ? item.querySelector("title").textContent : "",
                        link: item.querySelector("link") ? item.querySelector("link").textContent : "",
                        guid: item.querySelector("guid") ? item.querySelector("guid").textContent : ""
                    };
                });
                loadLatestEpisode();
                loadEpisodesCarousel();
            } else {
                showErrorText("No episodes found inside public feed.");
            }
        })
        .catch(finalErr => {
            console.error("All deployment feeds exhausted. Fallback error:", finalErr);
            showErrorText("Error syncing with your live podcast pipeline.");
        });
}

function showErrorText(msg) {
    if (latestContainer) latestContainer.innerHTML = `<span style="color:#b3b3b3; font-size:14px; font-family:sans-serif;">${msg}</span>`;
    if (carousel) carousel.innerHTML = `<span style="color:#b3b3b3; font-size:14px; font-family:sans-serif;">${msg}</span>`;
}

// ======= ROBUST AND SECURE EMBED CONVERTER =======
function convertToEmbed(episodeData) {
    if (!episodeData) return "https://spotify.com";
    
    // Safely assign properties, managing string formats gracefully
    const url = String(episodeData.link || "");
    const guid = String(episodeData.guid || "");

    // Strategy 1: Check if the link has a native Spotify style format
    if (url.includes("/episode/")) {
        const urlObj = url.split("?");
        const baseParts = urlObj[0].split("/episode/");
        if (baseParts.length > 1) {
            return `https://spotify.com{baseParts[1]}?theme=0`;
        }
    }
    
    // Strategy 2: Translate native Anchor landing URLs directly to clean iframe setups
    if (url.includes("anchor.fm") && url.includes("/episodes/")) {
        const cleanUrl = url.split("?")[0];
        return cleanUrl.replace("/episodes/", "/embed/episodes/");
    }

    // Strategy 3: Parse out raw alphanumeric hashes from GUID nodes
    if (guid.includes("/episodes/")) {
        const cleanGuid = guid.split("?")[0];
        const segments = cleanGuid.split("/episodes/");
        if (segments.length > 1) {
            return `https://anchor.fm{segments[1]}`;
        }
    }
    
    // Strategy 4: Handle string components out of fallback trailing parameters
    const trailingParts = url.split("/");
    const dynamicSlug = trailingParts[trailingParts.length - 1] || "";
    if (dynamicSlug.includes("-e") && dynamicSlug.length > 4) {
        const cleanSlug = dynamicSlug.split("?")[0];
        return `https://anchor.fm{cleanSlug}`;
    }

    // Safety Baseline: Mapped straight back to your base profile node container view
    return "https://spotify.com";
}

// ======= LATEST RELEASE INJECTION =======
function loadLatestEpisode() {
    if (!latestContainer || EPISODES.length === 0) return;

    // Anchor updates dynamic feeds with position index 0 matching your absolute newest release record
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
    
    // Wipe text placeholders
    carousel.innerHTML = "";

    // Render items smoothly across the container space
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

    // Invoke automated observation attachment routines
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
