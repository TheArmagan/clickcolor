const sessionIdInput = document.querySelector("#sessionIdInput");
const createOrJoinSessionButton = document.querySelector("#createOrJoinSessionButton");
const titleElement = document.querySelector("#title");

sessionIdInput.value = randomText();

createOrJoinSessionButton.addEventListener("click",()=>{
    if (!sessionIdInput.value) sessionIdInput.value = randomText();
    localStorage.setItem("setSessionColorTo", RANDOM_HEX);
    window.location = `/session/${sessionIdInput.value}`;
})

function updateCreateOrJoinSessionButtonTextContent(i=1) {
    if (createOrJoinSessionButton.textContent == "Create Session") {
        createOrJoinSessionButton.textContent = "Join To Session";
    } else {
        createOrJoinSessionButton.textContent = "Create Session";
    }
    setTimeout(()=>{updateCreateOrJoinSessionButtonTextContent()},5000);
}

updateCreateOrJoinSessionButtonTextContent();