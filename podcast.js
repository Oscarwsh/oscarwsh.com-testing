/**
 * podcast.js
 * Fetches the podcast RSS feed, parses the XML, and populates the HTML
 * elements for the latest episode and the interactive episode carousel.
 */

document.addEventListener("DOMContentLoaded", () => {
    const rssUrl = "https://anchor.fm/s/10d4e7f4c/podcast/rss";
    // Using a reliable CORS proxy to prevent cross-origin issues in the browser
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    const latestEpisodeContainer = document.getElementById("latestEpisode");
    const carouselContainer = document.getElementById("podcastCarousel");
    const prevButton = document.querySelector(".podcast-arrow.prev");
    const nextButton = document.querySelector(".podcast-arrow.next");

    let episodes = [];
    let currentIndex = 0;
    const itemsPerView = 3; // Number of visible items in the carousel at once

    // Fetch and parse RSS feed
    fetch(proxyUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const items = data.querySelectorAll("item");
            
            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "Untitled Episode";
                const link = item.querySelector("link")?.textContent || "#";
                const pubDate = item.querySelector("pubDate")?.textContent || "";
                const description = item.querySelector("description")?.textContent || "";
                const enclosureUrl = item.querySelector("enclosure")?.getAttribute("url") || "";
                
                // Try to find image (standard rss, itunes:image, or media:content)
                let imageUrl = "images/+2-icon.png"; // Fallback to your site icon
                const itunesImage = item.getElementsByTagName("itunes:image")[0];
                if (itunesImage) {
                    imageUrl = itunesImage.getAttribute("href");
                } else {
                    const channelImage = data.querySelector("channel > image > url");
                    if (channelImage) {
                        imageUrl = channelImage.textContent;
                    }
                }

                // Format publication date safely
                let formattedDate = pubDate;
                if (pubDate) {
                    const dateObj = new Date(pubDate);
                    if (!isNaN(dateObj)) {
                        formattedDate = dateObj.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                }

                episodes.push({ title, link, formattedDate, description, enclosureUrl, imageUrl });
            });

            if (episodes.length > 0) {
                renderLatestEpisode(episodes[0]);
                renderCarousel(episodes);
                setupCarouselControls();
            } else {
                latestEpisodeContainer.textContent = "No episodes found.";
                carouselContainer.textContent = "No episodes found.";
            }
        })
        .catch(error => {
            console.error("Error loading podcast feed:", error);
            latestEpisodeContainer.textContent = "Failed to load the latest episode.";
            carouselContainer.textContent = "Failed to load episodes.";
        });

    // Render the single topmost latest episode
    function renderLatestEpisode(episode) {
        // Strip HTML tags for a clean description snippet if needed
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = episode.description;
        const cleanDesc = tempDiv.textContent || tempDiv.innerText || "";
        const shortDesc = cleanDesc.length > 200 ? cleanDesc.substring(0, 200) + "..." : cleanDesc;

        latestEpisodeContainer.innerHTML = `
            <div class="latest-episode-card" style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                <img src="${episode.imageUrl}" alt="${episode.title}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" />
                <div class="latest-episode-details" style="flex: 1; min-width: 250px;">
                    <span class="episode-date" style="font-size: 0.85rem; color: #666;">Published: ${episode.formattedDate}</span>
                    <h3 style="margin: 5px 0 10px 0;">${episode.title}</h3>
                    <p style="margin-bottom: 15px; font-size: 0.95rem; line-height: 1.4;">${shortDesc}</p>
                    <div class="player-actions" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        ${episode.enclosureUrl ? `<audio controls src="${episode.enclosureUrl}" style="max-width: 100%;"></audio>` : ""}
                        <a href="${episode.link}" target="_blank" rel="noopener noreferrer" class="listen-btn" style="text-decoration: underline; font-weight: bold; color: inherit;">View Full Episode →</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Render all episodes inside the horizontal carousel structure
    function renderCarousel(episodeList) {
        carouselContainer.innerHTML = "";
        
        // Wrap everything in an inner container to handle CSS layout transformations cleanly
        const track = document.createElement("div");
        track.className = "carousel-track";
        track.style.display = "flex";
        track.style.transition = "transform 0.4s ease-in-out";
        track.style.width = "100%";

        episodeList.forEach(episode => {
            const card = document.createElement("div");
            card.className = "carousel-item";
            // Adaptive inline styles to make sure items sizing fits flexible responsive viewports
            card.style.flex = `0 0 calc(${100 / itemsPerView}% - 20px)`;
            card.style.margin = "0 10px";
            card.style.boxSizing = "border-box";

            card.innerHTML = `
                <div class="episode-card-inner" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <img src="${episode.imageUrl}" alt="${episode.title}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 10px;" />
                        <span style="font-size: 0.8rem; color: #777;">${episode.formattedDate}</span>
                        <h4 style="margin: 5px 0; font-size: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${episode.title}</h4>
                    </div>
                    <a href="${episode.link}" target="_blank" rel="noopener noreferrer" style="margin-top: 10px; font-size: 0.9rem; font-weight: bold; text-decoration: underline; color: inherit;">Listen</a>
                </div>
            `;
            track.appendChild(card);
        });

        carouselContainer.appendChild(track);
        carouselContainer.style.overflow = "hidden";
        carouselContainer.style.width = "100%";
    }

    // Handle interactive prev/next button transitions
    function setupCarouselControls() {
        if (!prevButton || !nextButton) return;

        const updateCarouselPosition = () => {
            const track = carouselContainer.querySelector(".carousel-track");
            if (!track) return;
            
            // Re-calculate active viewport item width dynamically
            const itemWidth = carouselContainer.offsetWidth / itemsPerView;
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        };

        nextButton.addEventListener("click", () => {
            const maxIndex = episodes.length - itemsPerView;
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Wrap around to the start
            }
            updateCarouselPosition();
        });

        prevButton.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = Math.max(0, episodes.length - itemsPerView); // Wrap to the end
            }
            updateCarouselPosition();
        });

        // Maintain accurate styling positioning on browser resize
        window.addEventListener("resize", updateCarouselPosition);
    }
});
