const {map} = rxjs.operators;
const {fromEvent} = rxjs;

let steps = []; //stappen uit het Json bestand
let text = []; //algemene text zodat niet hardgecodeerd
let currentStep = 0; //houdt huisige stap bij
//stel dat eventueel tutorial na gemiddeld level dan kan die startende stap omhoog gaan
let playerPosition = {x: 2, y: 2}; // Startpositie van de speler

document.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.key === "Escape") {
        const homeLink = document.getElementById("home-link");
        if (homeLink) {
            homeLink.click();
        }
    }
});


window.onload = function () {
    getTutorial();
    initializeGrid();
    document.addEventListener("keydown", function (event) {
        check(event);
    });

    document.getElementById("nextButton").addEventListener("click", nextStep);


}

//deze functie haalt de json bestanden op
async function getTutorial() {
    try {
        // Haal JSON-bestanden op met fetch
        const tutorialResponse = await fetch('./data/TutorialTextEngels.json');
        steps = await tutorialResponse.json(); // Zet de response om naar JSON

        const generalTextResponse = await fetch('./data/GeneralText.json');
        text = await generalTextResponse.json(); // Zet de response om naar JSON

        begin();
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

//deze functie is voor het het begin als de pagina geladen wordt en start het spel
function begin() {

    let textArea = document.getElementById("textArea");
    let textareaTitle = document.createElement("div");
    textareaTitle.innerText = text[0].startTutorial;
    textareaTitle.classList.add("text-title");

    let textAreaText = document.createElement("div");
    textAreaText.innerText = text[1].beginTutorial;
    textAreaText.classList.add("text-body");

    textArea.appendChild(textareaTitle);
    textArea.appendChild(textAreaText);

    let beginButton = document.getElementById("startButton");
    beginButton.style.display = "block";
    beginButton.addEventListener("click", spel);
    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && beginButton.style.display === "block") {
            spel();
        }
    });

}


function spel() {
    let beginButton = document.getElementById("startButton");
    beginButton.style.display = "none";
    let textArea = document.getElementById("textArea");
    textArea.innerHTML = "";

    //reset playerposition
    playerPosition = {x: 2, y: 2};
    let player = document.querySelector(".player");
    player.style.gridColumnStart = playerPosition.x + 1;
    player.style.gridRowStart = playerPosition.y + 1;

    //toont text van opgave
    let textareaTitle = document.createElement("div");
    textareaTitle.innerText = steps[currentStep].title;
    textareaTitle.classList.add("text-title");
    let textAreaText = document.createElement("div");
    textAreaText.innerText = steps[currentStep].text;
    textAreaText.classList.add("text-body");
    textArea.appendChild(textareaTitle);
    textArea.appendChild(textAreaText);
    check();


}

//deze functie checkt de key, stuurt verplaatsing door en checkt of juiste key voor volgende stap
function check(event) {
    if (!event) return;
    const key = event.key;
    if (key === "h" || key === "j" || key === "k" || key === "l") {
        moveInGrid(key);
        if (steps[currentStep] && key === steps[currentStep].key) {
            document.getElementById("nextButton").style.display = "block";
        }
    }
    if (key === "Enter") {
        const nextButton = document.getElementById("nextButton");

        if (nextButton && nextButton.style.display === "block") {
            nextStep();
        }
    }
}

//deze functie dient om te verplaatsen in het grid
function moveInGrid(key) {
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    //checken welke toets
    if (key === "h" && newX > 0) newX -= 1;
    if (key === "l" && newX < 4) newX += 1;
    if (key === "k" && newY > 0) newY -= 1;
    if (key === "j" && newY < 4) newY += 1;

    // Update positie
    playerPosition.x = newX;
    playerPosition.y = newY;

    // Verplaats visueel
    let player = document.querySelector(".player");
    player.style.gridColumnStart = newX + 1;
    player.style.gridRowStart = newY + 1;
    //de +1 moet gebeuren omdat naar CSS wordt omgezet
}

//deze functie is voor het eide van het spel om door te gaan naar het beginner level
//hier of in html moet nog een link komen naar beginner level
function endTutorial() {
    let textArea = document.getElementById("textArea");
    textArea.innerHTML = ""; // wis vorige inhoud

    let endTitle = document.createElement("div");
    endTitle.classList.add("text-title");
    endTitle.innerText = "Tutorial Complete";

    let endText = document.createElement("div");
    endText.classList.add("text-body");
    endText.innerText = text[2].end;

    textArea.appendChild(endTitle);
    textArea.appendChild(endText);
    document.getElementById("BeginnerStartButton").style.display = "block";
    document.addEventListener("keydown", function (e) {
        const btn = document.getElementById("BeginnerStartButton");
        if (e.key === "Enter" && btn.style.display === "block") {
            btn.click();
        }
    });
}

function nextStep() {
    currentStep++;
    document.getElementById("nextButton").style.display = "none";
    if (currentStep < steps.length) {
        spel();
    } else {
        endTutorial();
    }

}


//deze functie zal het grid maken en wordt in de css gestylt zodat je de speler ziet bewegen
function initializeGrid() {
    let grid = document.getElementById("grid");

    for (let i = 1; i < 25; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        grid.appendChild(cell);

    }

    let player = document.createElement("div");
    player.classList.add("player");
    grid.appendChild(player);
    player.style.gridColumnStart = playerPosition.x + 1;
    player.style.gridRowStart = playerPosition.y + 1;

}
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
            window.location.href = "../StartPage/index.html";

    }
});

