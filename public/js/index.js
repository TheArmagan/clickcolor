function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomText(len=16,min=65,max=90) {
    return Array(len).fill("").map(()=>{return String.fromCharCode(randomNumber(min,max))}).join("")
}

// https://stackoverflow.com/a/5092846
function randomHexColor() {
    return "#"+(Math.random()*0xFFFFFF<<0).toString(16);
}