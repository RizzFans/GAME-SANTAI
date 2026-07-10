"use strict";

/*==========================
 BLOCK BLAST ENGINE
==========================*/
const G=8;
const B=document.getElementById("board");
const P=document.getElementById("pieces");
const S=document.getElementById("score");
const T=document.getElementById("best");
const O=document.getElementById("over");
const F=document.getElementById("final");
const X=document.getElementById("restart");
const C = document.getElementById("coin");
const L = document.getElementById("level");

const GAME = {
    score: 0,
    best: +localStorage.getItem("block_best") || 0,
    coin: 0,
    level:1,
    grid: [],
    cells: [],
    hand: []
};

function saveGame() {
    const saveData = {
        score: GAME.score,
        best: GAME.best,
        coin: GAME.coin,
        level: GAME.level,
        grid: GAME.grid,
        hand: GAME.hand.map(p => ({
            shape: p.shape,
            color: p.color
        }))
    };
    localStorage.setItem(
        "block_save",
        JSON.stringify(saveData)
    );
}

function loadGame() {
    const data = JSON.parse(
        localStorage.getItem("block_save")
    );
    if (!data) return false;
    GAME.score = data.score;
    GAME.best = data.best;
    GAME.coin = data.coin;
    GAME.level = data.level;
    GAME.grid = data.grid;
    S.textContent = GAME.score;
    T.textContent = GAME.best;
    C.textContent = GAME.coin;
    L.textContent = GAME.level;

    B.innerHTML = "";
    GAME.cells = [];
    for (let y = 0; y < G; y++) {
        for (let x = 0; x < G; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            GAME.cells.push(cell);
            B.appendChild(cell);
        }
    }
    P.innerHTML = "";
    GAME.hand = [];
    data.hand.forEach(item => {
        const el = document.createElement("div");
        el.className = "piece";
        item.shape.forEach(r => {
            const row = document.createElement("div");
            row.className = "row";
            r.forEach(v => {
                const b = document.createElement("div");
                b.className = "block";
                if (v) {
                    b.style.background = item.color;
                } else {
                    b.style.visibility = "hidden";
                }
                row.appendChild(b);
            });
            el.appendChild(row);
        });
        GAME.hand.push({
            shape: item.shape,
            color: item.color,
            el
        });
        P.appendChild(el);
    });
    drawBoard();
    return true;
}
T.textContent=GAME.best;

const COLORS = [
    "#39ff88",
    "#5ab4ff",
    "#ffd93d",
    "#ff6b6b",
    "#ae7cff"
];


const SHAPES=[
[[1]],
[[1,1]],
[[1],[1]],
[[1,1,1]],
[[1],[1],[1]],
[[1,1],[1,1]],
[[1,0],[1,1]],
[[0,1],[1,1]],
[[1,1],[1,0]],
[[1,1],[0,1]],
[[1,1,1],[0,1,0]],
[[1,0,0],[1,1,1]],
[[0,0,1],[1,1,1]],
[[1,1,1],[1,0,0]],
[[1,1,1],[0,0,1]]
];
const clone=a=>structuredClone(a[Math.random()*a.length|0]);
function makeBoard(){
B.innerHTML="";
GAME.grid=[];
GAME.cells=[];
for(let y=0;y<G;y++){
GAME.grid[y]=[];
for(let x=0;x<G;x++){
GAME.grid[y][x]=0;
let c=document.createElement("div");
c.className="cell";
GAME.cells.push(c);
B.appendChild(c);
}
}
}

const menu = document.getElementById("menu");
const gameApp = document.getElementById("gameApp");
const playBtn = document.getElementById("playBtn");
const menuBest = document.getElementById("menuBest");

menuBest.textContent = GAME.best;



function makePieces(){
P.innerHTML="";
GAME.hand=[];
for(let i=0;i<3;i++){
let shape=clone(SHAPES);
let color=COLORS[Math.random()*COLORS.length|0];
let el=document.createElement("div");
el.className="piece";
el.classList.add("spawn");
el.style.animationDelay = (i * 0.12) + "s";
shape.forEach(r=>{
let row=document.createElement("div");
row.className="row";
r.forEach(v=>{
let b=document.createElement("div");
b.className="block";
if(v)b.style.background=color;
else b.style.visibility="hidden";
row.appendChild(b);
});
el.appendChild(row);
});

GAME.hand.push({
shape,
color,
el
});
P.appendChild(el);
}
}

function drawBoard(){
    GAME.cells.forEach((c,i)=>{
        let x=i%G;
        let y=i/G|0;
        c.style.background =
            GAME.grid[y][x] || "var(--cell)";
    });
}

makeBoard();
makePieces();
drawBoard();

console.log("ENGINE PART 1 OK");

/*==========================
 BLOCK BLAST ENGINE
==========================*/

let PICK = null;
let OFFX = 0;
let OFFY = 0;
let SIZE = 0;
let HOLDER = null;
let PREVIEW = [];
let paused = false;

function updateSize() {
    const cell = B.querySelector(".cell");
    SIZE = cell.getBoundingClientRect().width;
}

updateSize();
addEventListener(
"resize",
updateSize
);

function boardPos(px, py) {
    const boardRect = B.getBoundingClientRect();
    const cellRect =
        B.firstElementChild.getBoundingClientRect();
    const stepX =
        cellRect.width + 4;
    const stepY =
        cellRect.height + 4;
    const startX =
        px - OFFX;
    const startY =
        py - OFFY;
    return {
        x: Math.round(
            (startX - boardRect.left - 8) / stepX
        ),
        y: Math.round(
            (startY - boardRect.top - 8) / stepY
        )
    };
}

P.addEventListener("pointerdown", (e) => {
    if (paused) return;
    const pieceEl = e.target.closest(".piece");
    if (!pieceEl) return;
    PICK = null;
    for (const item of GAME.hand) {
        if (item.el === pieceEl) {
            PICK = item;
            break;
        }
    }
    if (!PICK) return;
    const rect = pieceEl.getBoundingClientRect();
    OFFX = e.clientX - rect.left;
    OFFY = e.clientY - rect.top;
    PICK.offsetWidth = rect.width;
    PICK.offsetHeight = rect.height;
    HOLDER = document.createElement("div");
    HOLDER.style.width = rect.width + "px";
    HOLDER.style.height = rect.height + "px";
    pieceEl.parentNode.insertBefore(
    HOLDER,
    pieceEl
);
    Object.assign(pieceEl.style, {
    position: "fixed",
    left: rect.left + "px",
    top: rect.top + "px",
    zIndex: 9999,
    pointerEvents: "none",

});
pieceEl.classList.add("drag");
});

addEventListener("pointermove", (e) => {
    if (paused) return;
    if (!PICK) return;
    const x = e.clientX - OFFX;
    const y = e.clientY - OFFY;
    const pos = boardPos(
    e.clientX,
    e.clientY
);
if (
    canPlace(
        PICK,
        pos.x,
        pos.y
    )
) {
    showPreview(
        PICK,
        pos.x,
        pos.y
    );
} else {
    clearPreview();
}
    PICK.el.style.left = x + "px";
    PICK.el.style.top = y + "px";
});

function resetPiece(p){
    if (HOLDER) {
    HOLDER.remove();
    HOLDER = null;

}
Object.assign(
p.el.style,
{
position:"",
left:"",
top:"",
margin:"",
zIndex:"",
pointerEvents:"",
transform:""
}
);
p.el.classList.remove("drag");
}

function clearPreview() {
    PREVIEW.forEach(cell => {
        cell.classList.remove("preview");
    });
    PREVIEW = [];
}

function showPreview(piece, x, y) {
    clearPreview();
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (!piece.shape[r][c]) continue;
            const X = x + c;
            const Y = y + r;
            if (
                X < 0 ||
                Y < 0 ||
                X >= G ||
                Y >= G
            ) continue;
            const cell = GAME.cells[Y * G + X];
            cell.classList.add("preview");
            PREVIEW.push(cell);
        }
    }
}

console.log(
"ENGINE PART 2 OK"
);

/*==========================
 BLOCK BLAST ENGINE
==========================*/
function canPlace(p,x,y){
for(let r=0;r<p.shape.length;r++)
for(let c=0;c<p.shape[r].length;c++){
if(!p.shape[r][c])continue;
let X=x+c;
let Y=y+r;
if(
X<0||
Y<0||
X>=G||
Y>=G
)return false;

if(
GAME.grid[Y][X]
)return false;
}
return true;
}

async function placePiece(p, x, y) {
for(let r=0;r<p.shape.length;r++)
for(let c=0;c<p.shape[r].length;c++){
if(!p.shape[r][c])continue;
GAME.grid[y+r][x+c] =
    p.color;
const cell =
    GAME.cells[
        (y + r) * G + (x + c)
    ];
const rect =
    cell.getBoundingClientRect();
burst(
    rect.left +
    rect.width / 2,
    rect.top +
    rect.height / 2,
    p.color
);
}
const addScore =
    p.shape
    .flat()
    .filter(Boolean)
    .length * 10;
GAME.score += addScore;
showScore(
    "+" + addScore,
    window.innerWidth / 2,
    window.innerHeight / 2
);
S.textContent=GAME.score;

GAME.coin += addScore / 10;
if (GAME.score >= GAME.level * 1000) {
    GAME.level++;
    showCombo(
        "LEVEL UP!"
    );
    playSound(
        1500,
        0.4
    );
}
C.textContent = GAME.coin;
L.textContent = GAME.level;

if(GAME.score>GAME.best)
{
GAME.best=
GAME.score;
T.textContent=GAME.best;
S.textContent = GAME.score;
C.textContent = GAME.coin;
L.textContent = GAME.level;
localStorage.setItem(
"block_best",
GAME.best
);
}
p.el.remove();
GAME.hand=
GAME.hand.filter(
v=>v!==p
);
drawBoard();



await clearLines();
if(
GAME.hand.length===0
){
makePieces();
}
saveGame();
gameOver();
}

addEventListener("pointerup",e=>{
if (paused) return;
if(!PICK)return;
let pos=
boardPos(
e.clientX,
e.clientY
);
if(
canPlace(
PICK,
pos.x,
pos.y
)
){
placePiece(
    PICK,
    pos.x,
    pos.y
);
playSound(
    420,
    0.12
);
}else{
resetPiece(
PICK
);
}
if (HOLDER) {
    HOLDER.remove();
    HOLDER = null;
}
clearPreview();
PICK=null;
}
);

console.log(
"ENGINE PART 3 OK"
);

/*==========================
 BLOCK BLAST ENGINE
==========================*/
const COMBO = document.getElementById(
    "comboText"
);
function showCombo(text){
    COMBO.textContent = text;
    COMBO.classList.remove(
        "show"
    );
    void COMBO.offsetWidth;
    COMBO.classList.add(
        "show"
    );
}

async function clearLines() {
    let rows = [];
    let cols = [];

    // cek baris
    for (let y = 0; y < G; y++) {
        let full = true;
        for (let x = 0; x < G; x++) {
            if (!GAME.grid[y][x]) {
                full = false;
                break;
            }
        }
        if (full) rows.push(y);
    }

    // cek kolom
    for (let x = 0; x < G; x++) {
        let full = true;
        for (let y = 0; y < G; y++) {
            if (!GAME.grid[y][x]) {
                full = false;
                break;
            }
        }
        if (full) cols.push(x);
    }
    if (
        rows.length === 0 &&
        cols.length === 0
    ) return;

    const flash = [];
    rows.forEach(y => {
        for (let x = 0; x < G; x++) {
            flash.push(
                GAME.cells[y * G + x]
            );
        }
    });

    cols.forEach(x => {
        for (let y = 0; y < G; y++) {
            flash.push(
                GAME.cells[y * G + x]
            );
        }
    });

    flash.forEach(cell => {
        cell.classList.add("clear");
    });

    await new Promise(r => setTimeout(r, 180));
    rows.forEach(y => {
        for (let x = 0; x < G; x++) {
            GAME.grid[y][x] = 0;
        }
    });
    cols.forEach(x => {
        for (let y = 0; y < G; y++) {
            GAME.grid[y][x] = 0;
        }
    });
    flash.forEach(cell => {
        cell.classList.remove("clear");
    });
  const lines =
    rows.length + cols.length;
let bonus = 0;
if (lines === 1) {
    bonus = 100;
    showCombo(
        "Mantab!"
    );

    playSound(
        700,
        0.18
    );
}

else if (lines === 2) {
    bonus = 300;
    showCombo(
        "COMBO x2"
    );
    playSound(
        900,
        0.22
    );
}

else if (lines === 3) {
    bonus = 700;
    showCombo(
        "ANJAY!"
    );
    playSound(
        1100,
        0.28
    );
}
else {
    bonus = 1500;
    showCombo(
        "GILE LU!"
    );
    playSound(
        1300,
        0.35
    );
}
GAME.score += bonus;
S.textContent = GAME.score;
drawBoard();
}

function gameOver(){
for(let p of GAME.hand){
for(let y=0;y<G;y++){
for(let x=0;x<G;x++){
if(
canPlace(
p,
x,
y
)
){
return false;
}
}
}
}
F.textContent=
GAME.score;
O.classList.remove(
"hide"
);
return true;
}
/*==========================
 BLOCK BLAST ENGINE
==========================*/
X.onclick = () => {
    GAME.score = 0;
    GAME.coin = 0;
    GAME.level = 1;

    S.textContent = GAME.score;
    C.textContent = GAME.coin;
    L.textContent = GAME.level;

    O.classList.add("hide");

    makeBoard();
    makePieces();
    drawBoard();
};

/* SKOR TERTINGGI */

function saveBest(){
if(
GAME.score>
GAME.best
){
GAME.best=
GAME.score;
T.textContent=
GAME.best;
localStorage.setItem(
"block_best",
GAME.best
);
}
}

console.log(
"ENGINE PART 5 OK");

function showScore(text, x, y){
    const el =
        document.createElement("div");
    el.className = "fly-score";
    el.textContent = text
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 800);
}

function burst(x, y, color){
    for(let i = 0; i < 12; i++){
        const p =
            document.createElement("div");
        p.className =
            "particle";
        p.style.background =
            color;
        p.style.left =
            x + "px";
        p.style.top =
            y + "px";
        const angle =
            Math.random() * Math.PI * 2;
        const dist =
            40 + Math.random() * 60;
        p.style.setProperty(
            "--tx",
            Math.cos(angle) * dist + "px"
        );
        p.style.setProperty(
            "--ty",
            Math.sin(angle) * dist + "px"
        );
        document.body.appendChild(p);
        setTimeout(() => {
            p.remove();
        }, 600);
    }
}

/*==========================
MENU
==========================*/
const continueBtn =
    document.getElementById(
        "continueBtn"
    );
const tutorialBtn =
    document.getElementById(
        "tutorialBtn"
    );
playBtn.onclick = () => {
    const yakin = confirm(
        "Mulai game baru?"
    );
    if (!yakin) return;
    GAME.score = 0;
    GAME.coin = 0;
    GAME.level = 1;
    localStorage.removeItem("block_save");
    S.textContent = GAME.score;
    C.textContent = GAME.coin;
    L.textContent = GAME.level;
    makeBoard();
    makePieces();
    drawBoard();
    menu.style.display = "none";
    gameApp.classList.remove("hide");
};
continueBtn.onclick = () => {
    if (!loadGame()) {
        showToast(
            "Belum ada save game!",
            "error"
        );
        return;
    }
    menu.style.display = "none";
    gameApp.classList.remove("hide");

};
tutorialBtn.onclick = () => {
    helpMenu.classList.remove("hide");
};

/*==========================
TUTORIAL
==========================*/
const helpMenu = document.getElementById("helpMenu");

const closeHelp = document.getElementById("closeHelp");

closeHelp.onclick = () => {
    helpMenu.classList.add("hide");
};

/*==========================
 SOUND
==========================*/
const audioCtx = new (
    window.AudioContext ||
    window.webkitAudioContext
)();

let soundEnabled = true;

function playSound(freq, duration){

    if (!soundEnabled) return;

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.connect(gain);

    gain.connect(
        audioCtx.destination
    );

    osc.type = "square";

    osc.frequency.value = freq;

    gain.gain.value = 0.08;

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration
    );

    osc.stop(
        audioCtx.currentTime + duration
    );
}
/*==========================
BACKGROUND MUSIC
==========================*/
const bgMusic = new Audio(
    "CrayonSinchan.mp3"
);

bgMusic.loop = true;
bgMusic.volume = 0.3;

const musicBtn =
    document.getElementById(
        "musicBtn"
    );

musicBtn.onchange = function () {

    bgMusic.pause();

    bgMusic.src = this.value;

    bgMusic.play();

};
let currentSong = 0;

/* =====================
   SETTINGS
===================== */

const settings =
    document.getElementById(
        "settings"
    );

const settingBtn =
    document.getElementById(
        "settingBtn"
    );

const closeSettings =
    document.getElementById(
        "closeSettings"
    );
settingBtn.onclick = () => {
    settings.classList.remove(
        "hide"
    );
};

closeSettings.onclick = () => {
    settings.classList.add(
        "hide"
    );
};
document.getElementById(
    "toggleMusic"
).onclick = function(){
    if(bgMusic.paused){
        bgMusic.play();
        this.textContent = "ON";
    }else{
        bgMusic.pause();
        this.textContent = "OFF";
    }
};

/* =====================
   EFEK SUARA
===================== */

const soundBtn = document.getElementById(
    "toggleSound"
);
soundBtn.onclick = function(){
    soundEnabled = !soundEnabled;
    this.textContent =
        soundEnabled
            ? "ON"
            : "OFF";
};

const themes = [
{
    name: "Biru",
    bg1: "#0f172a",
    bg2: "#172554",
    panel: "#1e293b"
},

{
    name: "Ungu",
    bg1: "#111827",
    bg2: "#4c1d95",
    panel: "#312e81"
},

{
    name: "Hijau",
    bg1: "#111827",
    bg2: "#064e3b",
    panel: "#134e4a"
},

{
    name: "Pink",
    bg1: "#ff00bb",
    bg2: "#ff60d5",
    panel: "#000000"
}

];

let themeIndex = 0;

const themeBtn =
    document.getElementById(
        "changeTheme"
    );

themeBtn.onclick = () => {

    themeIndex++;

    if (
        themeIndex >= themes.length
    ) {
        themeIndex = 0;
    }

    const t =
        themes[themeIndex];

    document.documentElement
        .style
        .setProperty(
            "--bg1",
            t.bg1
        );

    document.documentElement
        .style
        .setProperty(
            "--bg2",
            t.bg2
        );

    document.documentElement
        .style
        .setProperty(
            "--panel",
            t.panel
        );

    themeBtn.textContent =
        t.name;
};

const pauseBtn = document.getElementById("pauseBtn");
const pauseMenu = document.getElementById("pauseMenu");

const resumeBtn = document.getElementById("resumeBtn");
const restartPauseBtn = document.getElementById("restartPauseBtn");
const homeBtn = document.getElementById("homeBtn");

pauseBtn.onclick = () => {
    paused = true;
    pauseMenu.classList.remove("hide");
};
resumeBtn.onclick = () => {
    paused = false;
    pauseMenu.classList.add("hide");
};
restartPauseBtn.onclick = () => {
    GAME.score = 0;
    GAME.coin = 0;
    GAME.level = 1;
    S.textContent = GAME.score;
    C.textContent = GAME.coin;
    L.textContent = GAME.level;
    O.classList.add("hide");
    pauseMenu.classList.add("hide");
    makeBoard();
    makePieces();
    drawBoard();
    paused = false;
};
homeBtn.onclick = () => {
    pauseMenu.classList.add("hide");
    gameApp.classList.add("hide");
    menu.style.display = "flex";
    bgMusic.pause();
    paused = false;
};

const hintBtn = document.getElementById("hintBtn");

hintBtn.onclick = () => {
    const COST = 200;
    if (GAME.coin < COST) {
        showToast(
    " Butuh " + COST + " coin!",
    "error"
);
        return;
    }
    let bestMove = null;
    let bestScore = -1;
    for (const piece of GAME.hand) {
        for (let y = 0; y < G; y++) {
            for (let x = 0; x < G; x++) {
                if (
                    !canPlace(
                        piece,
                        x,
                        y
                    )
                ) {
                    continue;
                }
                let score = 0;
                piece.shape.forEach(
                    row => {
                        row.forEach(
                            cell => {
                                if (cell) {
                                    score += 10;
                                }
                            }
                        );
                    }
                );
                let rowBonus = 0;
                let colBonus = 0;

                for (
                    let yy = 0;
                    yy < G;
                    yy++
                ) {

                    let filled = 0;
                    for (
                        let xx = 0;
                        xx < G;
                        xx++
                    ) {

                        if (
                            GAME.grid[yy][xx]
                        ) {
                            filled++;
                        }
                    }

                    if (
                        filled >= 6
                    ) {
                        rowBonus += 100;
                    }
                }

                for (
                    let xx = 0;
                    xx < G;
                    xx++
                ) {
                    let filled = 0;
                    for (
                        let yy = 0;
                        yy < G;
                        yy++
                    ) {

                        if (
                            GAME.grid[yy][xx]
                        ) {
                            filled++;
                        }
                    }
                    if (
                        filled >= 6
                    ) {
                        colBonus += 100;
                    }
                }
                score +=
                    rowBonus +
                    colBonus;
                if (
                    score >
                    bestScore
                ) {
                    bestScore =
                        score;
                    bestMove = {
                        piece,
                        x,
                        y

                    };
                }
            }
        }
    }

   if (!bestMove) {

    showToast(
        "Tidak ada langkah!",
        "error"
    );

    return;
}
    GAME.coin -= COST;
    C.textContent =
        GAME.coin;
    showPreview(
        bestMove.piece,
        bestMove.x,
        bestMove.y
    );
    showCombo(
        "💡 SMART HINT"
    );
   showToast(
    "💡 Posisi terbaik ditemukan!",
    "info"
);
    setTimeout(
        clearPreview,
        2500
    );
};

const toast = document.getElementById("toast");
function showToast(text, type = "") {
    toast.textContent = text;
    toast.className = "toast";
    if (type) {
        toast.classList.add(type);
    }
    toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
