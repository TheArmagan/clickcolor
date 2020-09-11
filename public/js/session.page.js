const socket = io();

const colorPicker = document.querySelector("#colorPicker");
const pickerButton = document.querySelector("#pickerButton");
const optionsPage = document.querySelector("#optionsPage");
const postRequestSaveButton = document.querySelector("#postRequestSaveButton");
const postRequestURLInput = document.querySelector("#postRequestURLInput");
const postRequestBodyTextArea = document.querySelector("#postRequestBodyTextArea");
const postRequestResetButton = document.querySelector("#postRequestResetButton");
const disableMemesCheckbox = document.querySelector("#disableMemesCheckbox");
const catVideo = document.querySelector("#catVideo");
const pageIconLinkElement = document.querySelector("#pageIconLink");


const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

socket.emit(":setupConnection",{SESSION_ID});
socket.on(":connection",({_sessionColor, _isNewSession})=>{
    console.log({_sessionColor, _isNewSession})
    document.body.style.backgroundColor = _sessionColor;
    pickerButton.textContent = "Pick Color";

    if (HEX_COLOR_REGEX.test("#"+location.pathname.slice(9)) && _isNewSession) {
        socket.emit(":updateColor","#"+location.pathname.slice(9));
    } else if (localStorage.getItem("setSessionColorTo") && _isNewSession) {
        let color = localStorage.getItem("setSessionColorTo");
        socket.emit(":updateColor",color);
    }
    localStorage.removeItem("setSessionColorTo");

    socket.on(":updateColor",(hexColor)=>{
        document.body.style.backgroundColor = hexColor;
        pageIconLinkElement.href = `/api/image/cursor?color=${hexColor.slice(1)}`;

        if (`${hexColor}`.toUpperCase() == "#00FFE1" && !localStorage.getItem("disableMemes")) {
            showCat();
        }

        let postReqUrl = localStorage.getItem("postRequestUrl");
        if (postReqUrl) {
            let postReqBody = localStorage.getItem("postRequestBody");
            postReqBody = postReqBody.replace(/{{#hexColor}}/gm,hexColor);
            postReqBody = postReqBody.replace(/{{hexColor}}/gm,hexColor.slice(1));
            postReqBody = postReqBody.replace(/{{colorNumber}}/gm,parseInt(hexColor.slice(1),16));
            postReqBody = postReqBody.replace(/{{SESSION_ID}}/gm,SESSION_ID);
            console.log("[POST] URL:", postReqUrl);
            console.log("[POST] Body:", postReqBody);
            fetch(postReqUrl,{
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: postReqBody
            }).then((d)=>{
                d.text().then(text=>{
                    if (d.ok) {
                        console.log("[POST] Fetch successful!",{text})
                    } else {
                        console.log("[POST] Fetch error!",{d},{text});
                    }
                })
            }).catch((err)=>{
                console.log("[POST] Fetch error!",err);
            })
        }
    });
    colorPicker.addEventListener("change",()=>{
        socket.emit(":updateColor",colorPicker.value);
    })
})

function toggleOptionsPage() {
    optionsPage.classList.toggle('active');
}

catVideo.volume = 0.01;

postRequestURLInput.value = localStorage.getItem("postRequestUrl");
postRequestBodyTextArea.value = localStorage.getItem("postRequestBody");
disableMemesCheckbox.checked = Boolean(localStorage.getItem("disableMemes"));

function postRequestSave() {
    if (!URL_REGEX.test(postRequestURLInput.value)) return alert("Invalid URL!");
    localStorage.setItem("postRequestUrl", postRequestURLInput.value);
    localStorage.setItem("postRequestBody", postRequestBodyTextArea.value);
    postRequestSaveButton.classList.add("green-color");
    setTimeout(()=>{
        postRequestSaveButton.classList.remove("green-color");
        setTimeout(()=>{toggleOptionsPage();},100);
    },300);
}

function postRequestReset() {
    localStorage.removeItem("postRequestUrl");
    localStorage.removeItem("postRequestBody");
    postRequestURLInput.value = "";
    postRequestBodyTextArea.value = "";
    postRequestResetButton.classList.add("green-color");
    setTimeout(()=>{
        postRequestResetButton.classList.remove("green-color");
        setTimeout(()=>{toggleOptionsPage();},100);
    },300)
}

function showCat() {
    catVideo.currentTime = 0;
    catVideo.classList.remove("hidden");
    catVideo.classList.remove("perish");
    catVideo.play();
}

function hideCat() {
    catVideo.classList.add("perish");
    setTimeout(()=>{
        catVideo.classList.add("hidden");
        catVideo.pause();
    },300);
    
}

catVideo.addEventListener("ended",()=>{
    hideCat();
})

disableMemesCheckbox.addEventListener("change",()=>{
    if (disableMemesCheckbox.checked) {
        localStorage.setItem("disableMemes","true");
    } else {
        localStorage.removeItem("disableMemes");
    }
})

addTabSupport(postRequestBodyTextArea,"\t");