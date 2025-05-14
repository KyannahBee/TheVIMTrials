document.addEventListener("keydown", function (e) {
    e.preventDefault();
    switch (e.key) {
        case "ArrowLeft":
            window.location.href = "Prim.html";
            break;
        case "ArrowRight":
            window.location.href = "BFS.html";
            break;
        case "Escape":
            window.location.href = "../StartPage/index.html";
            break;
    }
});
