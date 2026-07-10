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

const GAME={
score:0,
best:+localStorage.getItem("block_best")||0,
grid:[],
cells:[],
hand:[]
};
T.textContent=GAME.best;

const COLORS=[
"#39ff88",
"#5ab4ff",
"#ffd93d",
"#ff6b6b",
"#ae7cff",
"#00d9ff",
"#ff9f43"
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

playBtn.onclick = () => {

    menu.classList.add("hide");

    gameApp.classList.remove("hide");

};

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
S.textContent=
GAME.score;
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
gameOver();
}

addEventListener("pointerup",e=>{
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
X.onclick=()=>{
GAME.score=0;
S.textContent=0;
O.classList.add("hide");
GAME.grid=[];
GAME.cells=[];
GAME.hand=[];
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
 SOUND
==========================*/
const audioCtx = new (
    window.AudioContext ||
    window.webkitAudioContext
)();

function playSound(freq, duration){
    const osc =
        audioCtx.createOscillator();
    const gain =
        audioCtx.createGain();
    osc.connect(gain);
    gain.connect(
        audioCtx.destination
    );
    osc.type = "square";
    osc.frequency.value =
        freq;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime +
        duration
    );
    osc.stop(
        audioCtx.currentTime +
        duration
    );
}
/*==========================
BACKGROUND MUSIC
==========================*/
const bgMusic = new Audio(
    "music.mp3"
);
bgMusic.loop = true;
bgMusic.volume = 0.3;
function startMusic() {
    bgMusic.play().catch(() => {});
}
document.addEventListener(
    "pointerdown",
    startMusic,
    { once: true }
);
const musicBtn =
    document.getElementById(
        "musicBtn"
    );
musicBtn.onclick = () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.textContent =
            "🔊 Musik";
    } else {
        bgMusic.pause();
        musicBtn.textContent =
            "🔇 Musik";
    }
};