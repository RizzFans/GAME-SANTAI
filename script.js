"use strict";
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    getDoc,
    doc,
    setDoc,
    deleteDoc,
    where,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyCI3x7d9QNfAC9TEuy6Brw0BzQLkL2-kmA",
    authDomain: "block-puzzle-5b92b.firebaseapp.com",
    projectId: "block-puzzle-5b92b",
    storageBucket: "block-puzzle-5b92b.firebasestorage.app",
    messagingSenderId: "420646759926",
    appId: "1:420646759926:web:734645dbee1876560babd7"
};
const app = initializeApp(firebaseConfig);
window.db = getFirestore(app);
const avatarImg = document.getElementById("avatarImg");
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const loginBtn =document.getElementById("loginBtn");
console.log(window.db);
let PLAYER_ID =localStorage.getItem("block_player_id");
if (!PLAYER_ID) {PLAYER_ID =crypto.randomUUID();
    localStorage.setItem("block_player_id",PLAYER_ID);
}
window.PLAYER_ID =PLAYER_ID;
let PUBLIC_ID = localStorage.getItem("block_public_id");
if (!PUBLIC_ID) {
    PUBLIC_ID =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        ).toString();
    localStorage.setItem("block_public_id",PUBLIC_ID);
}
window.PUBLIC_ID =PUBLIC_ID;
/*==========================
 BLOCK BLAST ENGINE
==========================*/
const loadingFill = document.getElementById("loadingFill");
const loadingPercent = document.getElementById("loadingPercent");
const loadingScreen = document.getElementById("loadingScreen");
let progress = 0;
function updateLoading() {
    if (progress < 50) {
        progress += Math.floor(Math.random() * 8) + 5;
    } else if (progress < 80) {
        progress += Math.floor(Math.random() * 5) + 2;
    } else if (progress < 95) {
        progress += Math.floor(Math.random() * 3) + 1;
    } else {
        progress += 1;
    }
    if (progress > 100) {progress = 100;}
    loadingFill.style.width = progress + "%";
    loadingPercent.textContent = progress + "%";
    if (progress >= 100) {
        setTimeout(() => {
            loadingScreen.style.transition = "opacity .7s ease";
            loadingScreen.style.opacity = "0";
            setTimeout(() => {loadingScreen.remove();}, 700);}, 500);
        return;
    }
    let nextDelay;
    if (progress < 50) {
        nextDelay = 880;
    } else if (progress < 80) {
        nextDelay = 150;
    } else {
        nextDelay = 280;
    }
    setTimeout(updateLoading, nextDelay);
}
updateLoading();
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
const missionBtn =    document.getElementById("missionBtn");
const missionPanel =    document.getElementById("missionPanel");
const closeMission =    document.getElementById("closeMission");
missionBtn.onclick = () => {    missionPanel.classList.remove("hide");};
closeMission.onclick = () => {    missionPanel.classList.add("hide");};
const GAME = {
    score: 0,
    best: +localStorage.getItem("block_best") || 0,
    coin: +localStorage.getItem("block_coin") || 0,
    level: +localStorage.getItem("block_level") || 1,
    grid: [],
    cells: [],
    hand: []
};
const leaderboardBtn =document.getElementById("leaderboardBtn");
const leaderboardMenu =document.getElementById("leaderboardMenu");
const closeLeaderboardTop =document.getElementById("closeLeaderboardTop");
closeLeaderboardTop.onclick = () => { leaderboardMenu.classList.add("hide");};
const playerNameText =document.getElementById("playerName");
const avatarInput =document.getElementById("avatarInput");
const changeNameBtn =document.getElementById("changeNameBtn");
const usernamePopup =document.getElementById("usernamePopup");
const usernameInput =document.getElementById("usernameInput");
const saveUsername =document.getElementById("saveUsername");
let USERNAME =localStorage.getItem("block_username");
if (USERNAME) {usernamePopup.classList.add("hide");
    playerNameText.textContent = USERNAME;document.getElementById("avatarImg").src =`https://api.dicebear.com/7.x/bottts/svg?seed=${USERNAME}`;
} else {
    usernamePopup.classList.remove("hide");
}
saveUsername.onclick = async () => {
    const nama = usernameInput.value.trim();
    if (!nama) {showToast("Masukkan username!","error");
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nama)) {
    showToast("Hanya huruf, angka, dan _","error");
    return;
}
    if (nama.length < 3 ||nama.length > 15
    ) {
        showToast("Username harus 3-15 karakter!","error");
        return;
    }
    const usernameRef = doc(window.db,"usernames",nama.toLowerCase());
    const usernameSnap =await getDoc(usernameRef);
    if (usernameSnap.exists()) {showToast("Nickname sudah dipakai!","error");
        return;
    }
    await setDoc(
    usernameRef,
    {
        playerId: PLAYER_ID,
        publicId: PUBLIC_ID,
        username: nama,
        createdAt: Date.now()
    }
);
    USERNAME = nama;
    localStorage.setItem("block_username",USERNAME);
    playerNameText.textContent =USERNAME;
    usernamePopup.classList.add("hide");
    loadProfile();
};
changeNameBtn.onclick = async () => {
    const namaBaru = prompt("Masukkan nickname baru:",USERNAME);
    if (!namaBaru) return;
    const nickname = namaBaru.trim();
if (nickname.length < 3 ||nickname.length > 15) {
    showToast("Username harus 3-15 karakter!","error");
    return;
}
if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
    showToast("Hanya huruf, angka, dan _","error");
    return;
}
if (nickname.toLowerCase() ===USERNAME.toLowerCase()
) {
    showToast("Itu nickname kamu sekarang!","error");
    return;
}
    const newUsernameRef = doc(window.db,"usernames",nickname.toLowerCase());
    const snap = await getDoc(newUsernameRef);
    if (snap.exists()) {showToast("Nickname sudah dipakai!","error");
        return;
    }
    await deleteDoc(doc(window.db,"usernames",USERNAME.toLowerCase()));
    await setDoc(newUsernameRef,
        {
            playerId: PLAYER_ID,
            username: nickname,
            updatedAt: Date.now()
        }
    );
    USERNAME = nickname;
    localStorage.setItem("block_username",USERNAME);
    playerNameText.textContent = USERNAME;
    await saveScoreGlobal();
    showToast("Nickname berhasil diganti!","success");
};
avatarInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
        const image = reader.result;
        document.getElementById("avatarImg").src = image;
        localStorage.setItem("block_avatar",image);
    };
    reader.readAsDataURL(file);
};
function loadProfile() {
    const avatar = localStorage.getItem("block_avatar");
    if (avatar) {avatarImg.src = avatar;
    } else {
        avatarImg.src =`https://api.dicebear.com/7.x/bottts/svg?seed=${USERNAME || "Player"}`;
    }
    playerNameText.textContent = USERNAME || "Pemain";
    const playerIdText =document.getElementById( "playerId");
    playerIdText.textContent = PUBLIC_ID;
    menuBest.textContent = GAME.best;
    menuCoin.textContent = GAME.coin;
    menuLevel.textContent = GAME.level;
    updateRank();
}
function updateRank() {
    const rank = document.querySelector(".player-rank");
    if (GAME.level >= 50) {
        rank.textContent = "👑 Master";
    } else if (GAME.level >= 20) {
        rank.textContent = "🔥 Pro";
    } else if (GAME.level >= 10) {
        rank.textContent = "⭐ Veteran";
    } else {
        rank.textContent = "🏆 Rookie";
    }
}
async function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = "Memuat...";
    const q = query(
        collection(window.db, "leaderboard"),
        orderBy("score", "desc"),
        limit(10)
    );
    const snapshot = await getDocs(q);
    let html = "";
    snapshot.forEach((doc, index) => {
        const data = doc.data();
        let rankIcon = "🏅";
        if (index === 0) rankIcon = "🥇";
        if (index === 1) rankIcon = "🥈";
        if (index === 2) rankIcon = "🥉";
        html += `
            <div class="leader-item">
                <img
                    class="leader-avatar"
                    src="${
                        data.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }"
                >
                <div class="leader-info">
                    <div class="leader-name">
                        ${rankIcon} ${data.username}
                    </div>
                    <div class="leader-level">
                        ⭐ Level ${data.level}
                    </div>
                </div>
                <div class="leader-score">
                    🏆 ${data.score}
                </div>
            </div>
        `;
    });
    leaderboardList.innerHTML = html || "<p>Belum ada pemain.</p>";
}
leaderboardBtn.onclick = async () => {leaderboardMenu.classList.remove("hide");
    await loadLeaderboard();
};
async function saveScoreGlobal() {

    if ( !USERNAME || USERNAME === "Player") {
        return;
    }
    const ref = doc(
        window.db,
        "leaderboard",
        window.PLAYER_ID
    );
    const snap = await getDoc(ref);
    const oldData = snap.exists()
        ? snap.data()
        : {};
    await setDoc(
        ref,
        {
            playerId: window.PLAYER_ID,
            publicId: window.PLAYER_ID,
            username:USERNAME ||oldData.username,
            score: Math.max(oldData.score || 0,GAME.best || 0),
            level: Math.max(oldData.level || 1,GAME.level || 1),
            coin: Math.max(oldData.coin || 0,GAME.coin || 0),
            avatar: localStorage.getItem("block_avatar") || oldData.avatar || "",
            updatedAt: Date.now()
        },
        {
            merge: true
        }
    );
}
function saveGuestData() {
    if (auth.currentUser) return;

    if ( !USERNAME || USERNAME === "Player"
    ) {
        return;
    }
    localStorage.setItem( "guest_username", USERNAME);
    localStorage.setItem("guest_best",GAME.best);
    localStorage.setItem("guest_level",GAME.level);
    localStorage.setItem("guest_coin",GAME.coin);
    localStorage.setItem("guest_avatar",localStorage.getItem("block_avatar") || "");
}
function loadGuestData() {
    USERNAME =localStorage.getItem("guest_username")
        || localStorage.getItem("block_username")
        || "Player";

    GAME.best = +localStorage.getItem("guest_best")
        || +localStorage.getItem("block_best")
        || 0;
    GAME.level = +localStorage.getItem("guest_level")
        || +localStorage.getItem("block_level")
        || 1;
    GAME.coin =+localStorage.getItem("guest_coin")
        || +localStorage.getItem("block_coin")
        || 0;
    const avatar =localStorage.getItem("guest_avatar")
        || localStorage.getItem("block_avatar");
    localStorage.setItem("block_username",USERNAME);
    localStorage.setItem("block_best",GAME.best);
    localStorage.setItem("block_level",GAME.level);
    localStorage.setItem("block_coin",GAME.coin);
    if (avatar) {localStorage.setItem("block_avatar",avatar);}
    loadProfile();
}
async function loadGoogleData(user) {
    const uid = user.uid;
    const oldPlayerId = localStorage.getItem("block_player_id");
    const ref = doc( window.db, "leaderboard", uid);
    let snap = await getDoc(ref);
    // PINDAHKAN DATA LAMA KE AKUN GOOGLE
    if (!snap.exists() && oldPlayerId) {
        const oldRef = doc(window.db,"leaderboard",oldPlayerId);
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists()) {const oldData = oldSnap.data();
            if (oldData.username === "Player" &&localStorage.getItem("block_username")
) {
    oldData.username = localStorage.getItem("block_username");
}
            await setDoc(
                ref,
                {
                    ...oldData,
                    playerId: uid,
                    migratedAt: Date.now()
                }
            );
            await setDoc(
    oldRef,
    {
        migrated: true,
        migratedTo: uid
    },
    {
        merge: true
    }
);
            console.log("Data lama berhasil dipindahkan");
            snap = await getDoc(ref);
        }
    }
    window.PLAYER_ID = uid;localStorage.setItem("block_player_id",uid);
    if (!snap.exists()) {
        const dataBaru = {playerId: uid,username:
                localStorage.getItem("block_username")
                || user.displayName
                || "Player",
            score:
                +localStorage.getItem("block_best")
                || 0,
            level:
                +localStorage.getItem("block_level")
                || 1,
            coin:
                +localStorage.getItem("block_coin")
                || 0,
            avatar:
                localStorage.getItem("block_avatar")
                || user.photoURL
                || ""
        };
        await setDoc(ref, dataBaru);
        USERNAME = dataBaru.username;
        GAME.best = dataBaru.score;
        GAME.level = dataBaru.level;
        GAME.coin = dataBaru.coin;

    } else {
        const data = snap.data();
USERNAME =
    data.username ||
    localStorage.getItem("block_username") ||
    "Player";
GAME.best =
    data.score ??
    +localStorage.getItem("block_best") ??
    0;
GAME.level =
    data.level ??
    +localStorage.getItem("block_level") ??
    1;
GAME.coin =
    data.coin ??
    +localStorage.getItem("block_coin") ??
    0;
        if (data.avatar) {
            localStorage.setItem("block_avatar",data.avatar);
        }
    }
    localStorage.setItem("block_username",USERNAME);
    localStorage.setItem("block_best",GAME.best);
    localStorage.setItem("block_level",GAME.level);
    localStorage.setItem("block_coin",GAME.coin);
    loadProfile();
}
loginBtn.onclick = async () => {
    if (auth.currentUser) {
        await signOut(auth);
        loadGuestData();
        loginBtn.innerHTML = `
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            >
            <span>Login with Google</span>
        `;
        return;
    }
    try {
        saveGuestData();
        const result =
            await signInWithPopup(
                auth,
                provider
            );

        await loadGoogleData(result.user);
        loginBtn.innerHTML ="Logout";
        await saveScoreGlobal();
    } catch (e) {console.error(e);
        showToast("Login gagal","error");
    }
};
let authReady = false;
onAuthStateChanged(auth, async (user) => {
    authReady = true;
    if (user) {
        await loadGoogleData(user);
    } else {
        const username = localStorage.getItem("block_username");
        if (username &&username !== "Player"
        ) {
            loadGuestData();
        } else {
            loadProfile();
        }
    }
});    
// const spinBtn =
//     document.getElementById("spinBtn");
// const spinMenu =
//     document.getElementById("spinMenu");
// const closeSpin =
//     document.getElementById("closeSpin");
// const startSpin =
//     document.getElementById("startSpin");
// const wheel =
//     document.getElementById("wheel");
// const spinResult =
//     document.getElementById("spinResult");
// const spinRewards = [
//     {
//         text: "50 Coin",
//         coin: 50
//     },
//     {
//         text: "100 Coin",
//         coin: 100
//     },
//     {
//         text: "250 Coin",
//         coin: 250
//     },
//     {
//         text: "500 Coin",
//         coin: 500
//     },
//     {
//         text: "ZONK",
//         coin: 0
//     },
//     {
//         text: "75 Coin",
//         coin: 75
//     }
// ];
// let spinning = false;
// let rotation = 0;

// function updateSpinButton() {
//     const data = JSON.parse(
//         localStorage.getItem(
//             "spinData"
//         )
//     ) || {
//         date: "",
//         used: false
//     };
//     const today = new Date()
//         .toISOString()
//         .split("T")[0];
//     if (data.date !== today) {
//         data.used = false;
//         data.date = today;
//         localStorage.setItem(
//             "spinData",
//             JSON.stringify(data)
//         );
//     }
//     if (data.used) {
//         startSpin.innerHTML = `
//             💳 Spin 1x
//             <small>(Rp15.000)</small>
//         `;
//     } else {
//         startSpin.innerHTML = `
//             🎰 Spin 1x
//             <small>(Gratis)</small>
//         `;
//     }
// }
// spinBtn.onclick = () => {
//     spinMenu.classList.remove(
//         "hide"
//     );
//     updateSpinButton();
// };
// closeSpin.onclick = () => {
//     spinMenu.classList.add(
//         "hide"
//     );
// };
// startSpin.onclick = () => {
//     if (spinning) return;
//     const data = JSON.parse(
//         localStorage.getItem(
//             "spinData"
//         )
//     ) || {
//         date: "",
//         used: false
//     };
//     if (data.used) {
//         alert(
//             "Spin gratis hari ini sudah habis.\n\nBayar Rp15.000 untuk spin lagi."
//         );
//         return;
//     }
//     data.used = true;
//     localStorage.setItem(
//         "spinData",
//         JSON.stringify(data)
//     );
//     updateSpinButton();
//     spinning = true;
//     const index = Math.floor(
//     Math.random() * spinRewards.length
// );
// const angle = 360 / spinRewards.length;
// /*
//     Karena panah ada di atas,
//     kita geser ke tengah tiap kotak
// */
// const targetAngle =
//     360 -
//     (index * angle + angle / 2);
// rotation +=
//     360 * 5 +
//     targetAngle;
// wheel.style.transform =
//     `rotate(${rotation}deg)`;
//     setTimeout(() => {
//         const reward =
//             spinRewards[index];
//         GAME.coin += reward.coin;
//         updateUI();
//         spinResult.textContent =
//             `🎉 ${reward.text}`;
//         spinning = false;
//     }, 5000);
// };

function updateUI() {
    document.getElementById("score").textContent = GAME.score;
    document.getElementById("best").textContent = GAME.best;
    document.getElementById("coin").textContent = GAME.coin;
    document.getElementById("level").textContent = GAME.level;
    document.getElementById("menuBest").textContent = GAME.best;
    document.getElementById("menuCoin").textContent = GAME.coin;
    document.getElementById("menuLevel").textContent = GAME.level;
    localStorage.setItem("block_coin", GAME.coin);
    localStorage.setItem("block_level", GAME.level);
    updateRank();
}
const MISSIONS = JSON.parse(localStorage.getItem("block_missions")) || {
    play: 0,
    lines: 0,
    score: 0,
    scoreTarget: 2000,
    rewardLineClaimed: false,
    rewardScoreClaimed: false
};
function saveMissions() {localStorage.setItem("block_missions",JSON.stringify(MISSIONS));}
function updateMissionUI() {
    const m1 = document.getElementById("mission1");
    const m2 = document.getElementById("mission2");
    const m3 = document.getElementById("mission3");
    m1.textContent = `${MISSIONS.play}/1`;
    m2.textContent = `${Math.min(MISSIONS.lines, 5)} / 5`;
    m3.textContent = `${MISSIONS.score}/2000`;
    if (MISSIONS.score >= 2000) { MISSIONS.score = 2000;}
    // Misi: main 1 kali
    if (MISSIONS.play >= 1) {m1.parentElement.classList.add("done");}
    // Misi: hapus 5 baris
    if (MISSIONS.lines >= 5) {m2.parentElement.classList.add("done");
        if (!MISSIONS.rewardLineClaimed) {MISSIONS.rewardLineClaimed = true;
            GAME.coin += 100;showToast("🎉 Misi selesai!\n+100 coin","success");
            localStorage.setItem("block_coin",GAME.coin
);
            updateUI();
        }}
    // Misi: skor 2000
    // Misi: skor 2000
if (MISSIONS.score >= 2000) {
    m3.parentElement.classList.add("done");
    if (!MISSIONS.rewardScoreClaimed) {MISSIONS.rewardScoreClaimed = true;GAME.coin += 250;
        localStorage.setItem("block_coin", GAME.coin);
        showToast("🏆 Misi skor selesai!\n+250 coin","success");
        updateUI();
        saveMissions();
    }
}}
// function saveProgress() {
//     localStorage.setItem("block_coin",GAME.coin);
//     localStorage.setItem("block_level",GAME.level);
//     localStorage.setItem("block_best",GAME.best);
// }
function saveGame() {
    const saveData = {
        score: GAME.score,
        best: GAME.best,
        coin: GAME.coin,
        level: GAME.level,
        grid: GAME.grid,
        hand: GAME.hand.map(p => ({shape: p.shape,color: p.color}))
    };
    localStorage.setItem("block_save",JSON.stringify(saveData));
}
function loadGame() {
    const data = JSON.parse(localStorage.getItem("block_save"));
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
                if (v) {b.style.background = item.color;
                } else {b.style.visibility = "hidden";
                }
                row.appendChild(b);
            });
            el.appendChild(row);
        });
        GAME.hand.push({ shape: item.shape,color: item.color, el});
        P.appendChild(el);
    });
    updateUI()
    drawBoard();
    return true;
}
T.textContent=GAME.best;
const COLORS = ["#39ff88","#5ab4ff","#ffd93d","#ff6b6b","#ae7cff"];
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
}}}
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
if (v) {
b.style.background = `linear-gradient(135deg,#ffffff33 0%,${color} 25%,${color} 85%)`;
b.style.boxShadow = `inset 0 2px 5px rgba(255,255,255,.18),inset 0 -4px 8px rgba(0,0,0,.25),`;}
else b.style.visibility="hidden";
row.appendChild(b);});
el.appendChild(row);});
GAME.hand.push({shape,color,el});P.appendChild(el);}}

function drawBoard(){
    GAME.cells.forEach((c,i)=>{
        let x = i % G;
        let y = (i / G) | 0;
       const color = GAME.grid[y][x];
if (color) {c.style.background = `linear-gradient(135deg,#ffffff33 0%,${color} 25%,${color} 85%)`;
c.style.boxShadow = `inset 0 2px 5px rgba(255,255,255,.18),inset 0 -4px 8px rgba(0,0,0,.25),`;
}else{
            c.style.background = "var(--cell)";
            c.style.boxShadow = "";
        }
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
let comboStreak = 0;
let comboTimeout = 0;

function updateSize() {const cell = B.querySelector(".cell"); SIZE = cell.getBoundingClientRect().width;}
updateSize();
addEventListener("resize",updateSize);

function boardPos(px, py) {
    const boardRect = B.getBoundingClientRect();
    const cellRect = B.firstElementChild.getBoundingClientRect();
    const stepX = cellRect.width + 4;
    const stepY =cellRect.height + 4;
    const startX =px - OFFX;
    const startY = py - OFFY;
    return {x: Math.round((startX - boardRect.left - 8) / stepX),y: Math.round((startY - boardRect.top - 8) / stepY)};
}
P.addEventListener("pointerdown", (e) => {
    if (paused) return;
    const pieceEl = e.target.closest(".piece");
    if (!pieceEl) return;
    PICK = null;
    for (const item of GAME.hand) {
        if (item.el === pieceEl) {PICK = item;break;}
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
pieceEl.classList.add("drag");});
addEventListener("pointermove", (e) => {
    if (paused) return;
    if (!PICK) return;
    const x = e.clientX - OFFX;
    const y = e.clientY - OFFY;
    const pos = boardPos(e.clientX,e.clientY);
if (canPlace(PICK,pos.x,pos.y)) {
    showPreview(PICK,pos.x,pos.y);
} else {
    clearPreview();
}
    PICK.el.style.left = x + "px";
    PICK.el.style.top = y + "px";
});

function resetPiece(p){
    if (HOLDER) {HOLDER.remove();HOLDER = null;}
Object.assign(p.el.style,{
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
            if (X < 0 ||Y < 0 ||X >= G ||Y >= G) continue;
            const cell = GAME.cells[Y * G + X];
            cell.classList.add("preview");
            PREVIEW.push(cell);
        }
    }
}
console.log("ENGINE PART 2 OK");
/*==========================
 BLOCK BLAST ENGINE
==========================*/
function canPlace(p,x,y){
for(let r=0;r<p.shape.length;r++)
for(let c=0;c<p.shape[r].length;c++){
if(!p.shape[r][c])continue;
let X=x+c;
let Y=y+r;
if(X<0||Y<0||X>=G||Y>=G)
return false;
if(GAME.grid[Y][X])
return false;}
return true;}

async function placePiece(p, x, y) {
for(let r=0;r<p.shape.length;r++)
for(let c=0;c<p.shape[r].length;c++){
    if(!p.shape[r][c]) continue;
    GAME.grid[y+r][x+c] = p.color;
    const cell =GAME.cells[(y+r)*G+c+x];
    cell.classList.remove("place-effect");
    void cell.offsetWidth;
    cell.classList.add("place-effect");
    cell.style.background = p.color;
    const rect =cell.getBoundingClientRect();
    burst(rect.left + rect.width / 2,rect.top + rect.height / 2,p.color);
    setTimeout(() => {cell.classList.remove("place-effect");}, 500);

const wave = document.createElement("div");
wave.className = "place-wave";
wave.style.left =rect.left +rect.width / 2 + "px";
wave.style.top =rect.top +rect.height / 2 + "px";
wave.style.borderColor =p.color;
document.body.appendChild(wave);
setTimeout(() => {wave.remove();}, 600);}
const addScore =p.shape.flat().filter(Boolean).length * 10;
GAME.score += addScore;
if (MISSIONS.score < 2000) {MISSIONS.score = Math.min(GAME.score, 2000);}
saveMissions();
updateUI();
updateMissionUI();
showScore("+" + addScore,window.innerWidth / 2,window.innerHeight / 2);
S.textContent=GAME.score;
GAME.coin += addScore / 10;
localStorage.setItem("block_coin", GAME.coin);
if (GAME.score >= GAME.level * 1000) {
    GAME.level++;
    localStorage.setItem(
    "block_level",
    GAME.level
);
    showCombo("LEVEL UP!");
    playSound(1500,0.4);
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
let pos=boardPos(e.clientX,e.clientY);
if(canPlace(PICK,pos.x,pos.y)){placePiece(PICK,pos.x,pos.y);playSound(420,0.12);
}else{
resetPiece(PICK);
}
if (HOLDER) {HOLDER.remove();HOLDER = null;}
clearPreview();
PICK=null;
}
);
console.log("ENGINE PART 3 OK");
/*==========================
 BLOCK BLAST ENGINE
==========================*/
const COMBO = document.getElementById("comboText");
function showCombo(text){
    COMBO.textContent = text;
    COMBO.classList.remove("show");
    void COMBO.offsetWidth;
    COMBO.classList.add("show");
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
   if (rows.length === 0 &&cols.length === 0) {
    return;
}
const cleared = rows.length + cols.length;
MISSIONS.lines += cleared;
if (MISSIONS.lines > 5) {MISSIONS.lines = 5;}
saveMissions();
updateMissionUI();   
const app = document.getElementById("gameApp");
app.classList.add("shake");
setTimeout(() => {app.classList.remove("shake");}, 300);
await new Promise(r => setTimeout(r, 180));
const cellsToRemove = [];
// Ambil semua balok baris
rows.forEach(y => {for (let x = 0; x < G; x++) {cellsToRemove.push({x,y});}});
// Ambil semua balok kolom
cols.forEach(x => {for (let y = 0; y < G; y++) {cellsToRemove.push({x,y});}});
// Hapus duplikat
const unique = [];
cellsToRemove.forEach(c => {if (!unique.some(v => v.x === c.x &&v.y === c.y)) {unique.push(c);}});
// Animasi hilang satu per satu
unique.forEach((pos, index) => {
    const cell =GAME.cells[pos.y * G + pos.x];
    setTimeout(() => {
    const cell = GAME.cells[ pos.y * G + pos.x];
    cell.classList.add("explode");
    setTimeout(() => {GAME.grid[pos.y][pos.x] = 0;
        drawBoard();
        cell.classList.remove("explode");}, 300);
}, index * 50);
});
await new Promise(r => setTimeout(r,unique.length * 50 + 350));
    const lines =rows.length + cols.length;
    const now = Date.now();
if (now - comboTimeout < 10000) {comboStreak++;
} else {comboStreak = 1;}
comboTimeout = now;
let bonus = 0;
if (comboStreak === 1) {bonus = 100;
    showCombo("MANTAB!");
    playSound(700, 0.18);
}
else if (comboStreak === 2) {bonus = 300;
    showCombo("⚡ COMBO x2");
    playSound(900, 0.22);
}
else if (comboStreak === 3) {bonus = 700;
    showCombo("BUSET!");
    playSound(1100, 0.28);
}
else if (comboStreak === 4) {bonus = 1500;
    showCombo("GILE LU NDRO!");
    playSound(1300, 0.35);
}
else {bonus = 3000;
    showCombo("MAKNYOOS!");
    playSound(1600, 0.45);
}
const totalBonus = bonus + (lines * 50);
GAME.score += totalBonus;
if (GAME.score > GAME.best) {GAME.best = GAME.score;
    localStorage.setItem("block_best",GAME.best);
    T.textContent = GAME.best;
}
saveMissions();
updateUI();
updateMissionUI();
showScore("+" + totalBonus,window.innerWidth / 2,window.innerHeight / 2);
S.textContent = GAME.score;
saveGame();
drawBoard();
}

async function gameOver() {
    for (let p of GAME.hand) {
        for (let y = 0; y < G; y++) {
            for (let x = 0; x < G; x++) {
                if (canPlace(p, x, y)) {
                    return false;
                }
            }
        }
    }
    F.textContent = GAME.score;
    O.classList.remove("hide");
    await saveScoreGlobal();
    await loadLeaderboard();
    return true;
}
/*==========================
 BLOCK BLAST ENGINE
==========================*/
X.onclick = () => {
    GAME.score = 0;
    GAME.coin =+localStorage.getItem("block_coin") || 0;
    GAME.level =+localStorage.getItem("block_level") || 1;
    if (MISSIONS.play < 1) {
        MISSIONS.play++;
        saveMissions();
    }
    updateMissionUI();
    comboStreak = 0;
    localStorage.removeItem("block_save");
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
console.log("ENGINE PART 5 OK");
function showScore(text, x, y){
    const el =document.createElement("div");
    el.className = "fly-score";
    el.textContent = text
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(() => {el.remove();}, 800);
}
function burst(x, y, color){
    for(let i = 0; i < 12; i++){
        const p =document.createElement("div");
        p.className ="particle";
        p.style.background =color;
        p.style.left =x + "px";
        p.style.top =y + "px";
        const angle =Math.random() * Math.PI * 2;
        const dist =40 + Math.random() * 60;
        p.style.setProperty("--tx",Math.cos(angle) * dist + "px");
        p.style.setProperty("--ty",Math.sin(angle) * dist + "px");
        document.body.appendChild(p);
        setTimeout(() => {p.remove();}, 600);}
}
/*==========================
MENU
==========================*/
const continueBtn =document.getElementById("continueBtn");
const tutorialBtn =document.getElementById("tutorialBtn");
playBtn.onclick = () => {
document.getElementById("avatarImg").src =`https://api.dicebear.com/7.x/bottts/svg?seed=${USERNAME}`;
localStorage.setItem("block_username",USERNAME);
playerNameText.textContent =USERNAME;
    const yakin = confirm("Mulai game baru?");
    if (!yakin) return;
    GAME.score = 0;
   if (MISSIONS.play < 1) {
    MISSIONS.play++;
    saveMissions();
}
    updateMissionUI();
    // updateSpinButton();
    localStorage.removeItem("block_save");
    updateUI();
    makeBoard();
    makePieces();
    drawBoard();
    if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
}
    menu.style.display = "none";
    gameApp.classList.remove("hide");
};
continueBtn.onclick = () => {if (!loadGame()) {showToast("Belum ada save game!","error");
        return;
    }
    if (bgMusic.paused) {bgMusic.play().catch(() => {});
}
    menu.style.display = "none";
    gameApp.classList.remove("hide");
};
tutorialBtn.onclick = () => {helpMenu.classList.remove("hide");};
/*==========================
TUTORIAL
==========================*/
const helpMenu = document.getElementById("helpMenu");
const closeHelp = document.getElementById("closeHelp");
closeHelp.onclick = () => {helpMenu.classList.add("hide");};
/*==========================
 SOUND
==========================*/
const audioCtx = new (window.AudioContext ||window.webkitAudioContext)();
let soundVolume =localStorage.getItem("sound_volume") || 80;
function playSound(freq,duration){if (soundVolume <= 0)
        return;
    const osc =audioCtx.createOscillator();
    const gain =audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "square";
    osc.frequency.value =freq;
    gain.gain.value =soundVolume / 100 * 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime +duration);
    osc.stop(audioCtx.currentTime +duration);
}
/*==========================
BACKGROUND MUSIC
==========================*/
const bgMusic = new Audio("CrayonSinchan.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;
const musicVolume =document.getElementById("musicVolume");
const musicValue =document.getElementById("musicValue");
const savedVolume =localStorage.getItem("music_volume");
if (savedVolume !== null) {
    bgMusic.volume =savedVolume / 100;
    musicVolume.value =savedVolume;
    musicValue.textContent =savedVolume + "%";
}
musicVolume.oninput = function () {
    const volume =this.value;
    bgMusic.volume =volume / 100;
    musicValue.textContent =volume + "%";
    localStorage.setItem("music_volume",volume);
};
const musicBtn =document.getElementById("musicBtn");
musicBtn.onchange = function () {bgMusic.pause();bgMusic.src = this.value;bgMusic.play();};
let currentSong = 0;
/* =====================
   SETTINGS
===================== */
const settings =document.getElementById("settings");
const settingBtn =document.getElementById( "settingBtn");
const closeSettings =document.getElementById("closeSettings");
settingBtn.onclick = () => {settings.classList.remove("hide");};
closeSettings.onclick = () => {settings.classList.add("hide");};
/* =====================
   EFEK SUARA
===================== */
const soundSlider =document.getElementById("soundVolume");
const soundValue = document.getElementById("soundValue");
soundSlider.value = soundVolume;
soundValue.textContent = soundVolume + "%";
soundSlider.oninput = function () {
        soundVolume =this.value;
        soundValue.textContent =soundVolume + "%";
        localStorage.setItem("sound_volume",soundVolume);
    };
// TEMA
const themes = [
{name: "Biru",bg1: "#0f172a",bg2: "#172554",panel: "#1e293b"},
{name: "Ungu",bg1: "#111827",bg2: "#4c1d95",panel: "#312e81"},
{name: "Hijau",bg1: "#111827",bg2: "#064e3b",panel: "#134e4a"},
{name: "Pink",bg1: "#f82ac1",bg2: "#ff60d5",panel: "#000000"},
];
let themeIndex = 0;
const themeBtn = document.getElementById("changeTheme");
themeBtn.onclick = () => {themeIndex++;
    if (themeIndex >= themes.length
    ) {themeIndex = 0;}
    const t = themes[themeIndex];
    document.documentElement.style.setProperty("--bg1",t.bg1);
    document.documentElement.style.setProperty("--bg2",t.bg2);
    document.documentElement.style.setProperty("--panel",t.panel);
    themeBtn.textContent =t.name;
};
const pauseBtn = document.getElementById("pauseBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const restartPauseBtn = document.getElementById("restartPauseBtn");
const homeBtn = document.getElementById("homeBtn");
pauseBtn.onclick = () => {paused = true;pauseMenu.classList.remove("hide");};
resumeBtn.onclick = () => {paused = false;pauseMenu.classList.add("hide");};
restartPauseBtn.onclick = () => {
    GAME.score = 0;
    if (MISSIONS.play < 1) {
    MISSIONS.play++;
    saveMissions();
}
    updateMissionUI();
    comboStreak = 0;
    localStorage.removeItem("block_save");
    S.textContent = GAME.score;
    C.textContent = GAME.coin;
    L.textContent = GAME.level
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
hintBtn.onclick = () => {const COST = 200;if (GAME.coin < COST) {showToast("Butuh " + COST + " coin!","error");
        return;
    }
    let bestMove = null;
    let bestScore = -1;
    for (const piece of GAME.hand) {
        for (let y = 0; y < G; y++) {
            for (let x = 0; x < G; x++) {
                if (!canPlace(piece,x,y)
                ) {
                    continue;
                }
                let score = 0;
                piece.shape.forEach(row => {row.forEach(cell => {if (cell) {score += 10;}
                            }
                        );
                    }
                );
                let rowBonus = 0;
                let colBonus = 0;
                for (let yy = 0;yy < G;yy++
                ) {
                    let filled = 0;
                    for (let xx = 0;xx < G;xx++
                    ) {
                        if (GAME.grid[yy][xx]
                        ) {filled++;}
                    }
                    if (filled >= 6) 
                        {rowBonus += 100;}
                }
                for (let xx = 0;xx < G;xx++
                ) {
                    let filled = 0;
                    for (let yy = 0;yy < G;yy++
                    ) {
                        if (GAME.grid[yy][xx]
                        ) {
                            filled++;
                        }
                    }
                    if (filled >= 6
                    ) {
                        colBonus += 100;
                    }
                }
                score +=rowBonus +colBonus;
                if (
                    score > bestScore
                ) {
                    bestScore =score;
                    bestMove = {piece,x,y
                    };
                }
            }
        }
    }
   if (!bestMove) {showToast("Tidak ada langkah!","error");
    return;
}
    GAME.coin -= COST;
    C.textContent =GAME.coin;
    showPreview(bestMove.piece,bestMove.x,bestMove.y);
    showCombo("💡 SMART HINT");
    showToast("💡 Posisi terbaik ditemukan!","info");
    setTimeout( clearPreview,2500);};
const toast = document.getElementById("toast");
function showToast(text, type = "") {toast.textContent = text;toast.className = "toast";
    if (type) { toast.classList.add(type);}
    toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {toast.classList.remove("show");}, 2500);
}
loadProfile();
updateUI();
updateMissionUI();
loadLeaderboard();
