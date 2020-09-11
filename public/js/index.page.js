const sessionIdInput = document.querySelector("#sessionIdInput");
const createSessionButton = document.querySelector("#createSessionButton");
const titleElement = document.querySelector("#title");

sessionIdInput.value = randomText();

createSessionButton.addEventListener("click",()=>{
    if (!sessionIdInput.value) sessionIdInput.value = randomText();
    localStorage.setItem("setSessionColorTo", RANDOM_HEX);
    window.location = `/session/${sessionIdInput.value}`;
})