async function loadTutorials() {

    const response = await fetch("/data/tutorials.json");
    const tutorials = await response.json();

    const container = document.getElementById("tutorials-container");

    tutorials.forEach(tutorial => {

        const card = document.createElement("div");
        card.className = "tutorial-card";

        card.innerHTML = `
            <img class="tutorial-card__img"
                 src="${tutorial.image}"
                 alt="${tutorial.title}">

            <div class="tutorial-card__body">

                <span class="tutorial-card__difficulty">
                    ${tutorial.difficulty}
                </span>

                <h3 class="tutorial-card__title">
                    ${tutorial.title}
                </h3>

                <p class="tutorial-card__text">
                    ${tutorial.text}
                </p>

                <a class="tutorial-card__button"
                   href="${tutorial.link}">
                   View Tutorial
                </a>

            </div>
        `;

        container.appendChild(card);
    });
}

loadTutorials();