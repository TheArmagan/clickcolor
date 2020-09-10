const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const Jimp = require("jimp");

app.set("view engine", "ejs");
app.set("x-powered-by", false);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const SESSION_COLORS = new Map();

const log = (...args)=>{console.log(`[${new Date().toLocaleTimeString()}]`, ...args)}

app.get("/",(req,res)=>{res.render("index.ejs",{RANDOM_HEX:randomHexColor()})})

app.get("/session/:SESSION_ID",(req,res)=>{
    const {SESSION_ID} = req.params;
    res.render("session",{SESSION_ID,SESSION_COLOR:(SESSION_COLORS.get(SESSION_ID) || "#000000")});
});

io.on("connection",(socket)=>{
    socket.once(":setupConnection",({SESSION_ID})=>{
        const ROOM_NAME = `SESSION:${SESSION_ID}`;
        let _isNewSession = !Object.values(io.sockets.sockets).some(s=>s.ROOM_NAME == ROOM_NAME);
        socket.join(ROOM_NAME);
        socket.ROOM_NAME = ROOM_NAME;
        socket.emit(":onReady",{
            _sessionColor: SESSION_COLORS.get(SESSION_ID) || HEX_COLOR_REGEX.test("#"+SESSION_ID) ? "#"+SESSION_ID : "#000000",
            _isNewSession
        });

        socket.on(":updateColor",(hexColor)=>{
            if (!HEX_COLOR_REGEX.test(hexColor)) return;
            SESSION_COLORS.set(SESSION_ID, hexColor);
            socket.emit(":updateColor",hexColor);
            socket.to(ROOM_NAME).emit(":updateColor",hexColor);
        })

        socket.once("disconnect",()=>{
            if (Object.values(io.sockets.sockets).filter(s=>s.ROOM_NAME == ROOM_NAME).length != 1) {
                SESSION_COLORS.delete(SESSION_ID);
            }
        })
    })

})


app.get("/api/image/cursor",async (req,res)=>{
    let {color} = req.query;
    if (!color.startsWith("#")) color = "#"+color;
    if (!HEX_COLOR_REGEX.test(color)) color = randomHexColor();
    let image = await Jimp.create(64,64,color);
    image.mask(await Jimp.read("./public/other/pointer64.png"),0,0);
    let imgBuffer = await image.getBufferAsync("image/png");
    res.end(imgBuffer);
    setTimeout(()=>{imgBuffer.fill(0)},100);
})


const PORT = process.env.PORT || 2448;
app.get("/*",(req,res)=>{res.redirect("/")});
server.listen(PORT,()=>{log(`*:${PORT}`)});




// https://stackoverflow.com/a/5092846
function randomHexColor() {
    return "#"+(Math.random()*0xFFFFFF<<0).toString(16);
}