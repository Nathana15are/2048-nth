// -------------------------
// CONFIG UTILISATEUR
// -------------------------
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {pseudo:'Guest', highscore:0};
const sheetDBScores = 'https://sheetdb.io/api/v1/p7fydq5tsp2br';

let gridSize = 4, grid = [], score = 0;
const scoreEl = document.getElementById('score'), gridContainer = document.querySelector('.grid');

// Bloquer scroll mobile
document.body.addEventListener('touchmove', e => { e.preventDefault(); }, {passive:false});

// -------------------------
// INITIALISATION GRILLE
// -------------------------
function initGrid() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    addTile();
    addTile();
    renderGrid();
}

// Ajouter une tuile aléatoire
function addTile() {
    let empty = [];
    for(let r=0;r<gridSize;r++) for(let c=0;c<gridSize;c++)
        if(grid[r][c]===0) empty.push([r,c]);
    if(empty.length>0){
        let [r,c] = empty[Math.floor(Math.random()*empty.length)];
        grid[r][c] = Math.random()<0.9?2:4;
    }
}

// Affichage grille
function renderGrid() {
    gridContainer.innerHTML = '';
    for(let r=0;r<gridSize;r++){
        for(let c=0;c<gridSize;c++){
            const cell = document.createElement('div');
            cell.className = 'cell';
            if(grid[r][c]!==0){ cell.textContent = grid[r][c]; cell.classList.add('tile'); }
            gridContainer.appendChild(cell);
        }
    }
    scoreEl.textContent = score;
}

// -------------------------
// LOGIQUE DE DÉPLACEMENT
// -------------------------
function move(direction){
    function slide(row){
        let arr = row.filter(v=>v!==0);
        for(let i=0;i<arr.length-1;i++){
            if(arr[i]===arr[i+1]){ arr[i]*=2; score+=arr[i]; arr[i+1]=0; }
        }
        arr = arr.filter(v=>v!==0);
        while(arr.length<gridSize) arr.push(0);
        return arr;
    }

    let oldGrid = JSON.stringify(grid);

    if(direction==='left') grid = grid.map(row => slide(row));
    else if(direction==='right') grid = grid.map(row => slide(row.reverse()).reverse());
    else if(direction==='up'){
        grid = grid[0].map((_,c)=>slide(grid.map(r=>r[c]))).map((col,r)=>col.map((val,rr)=>grid[rr][r]=val));
    }
    else if(direction==='down'){
        grid = grid[0].map((_,c)=>slide(grid.map(r=>r[c]).reverse()).reverse()).map((col,r)=>col.map((val,rr)=>grid[rr][r]=val));
    }

    if(JSON.stringify(grid)!==oldGrid){
        addTile();
        renderGrid();
        sendScore(); // Met à jour le leaderboard aussi
    }

    if(checkGameOver()) alert('Game Over !');
}

// Fin de partie
function checkGameOver(){
    for(let r=0;r<gridSize;r++){
        for(let c=0;c<gridSize;c++){
            if(grid[r][c]===0) return false;
            if(c<gridSize-1 && grid[r][c]===grid[r][c+1]) return false;
            if(r<gridSize-1 && grid[r][c]===grid[r+1][c]) return false;
        }
    }
    return true;
}

// -------------------------
// CONTROLES CLAVIER
// -------------------------
document.addEventListener('keydown', e=>{
    if(e.key==='ArrowUp') move('up');
    else if(e.key==='ArrowDown') move('down');
    else if(e.key==='ArrowLeft') move('left');
    else if(e.key==='ArrowRight') move('right');
});

// -------------------------
// SWIPE MOBILE
// -------------------------
let touchStartX=0, touchStartY=0, threshold=30;
document.addEventListener('touchstart', e=>{
    touchStartX=e.changedTouches[0].screenX;
    touchStartY=e.changedTouches[0].screenY;
});
document.addEventListener('touchend', e=>{
    const dx=e.changedTouches[0].screenX - touchStartX;
    const dy=e.changedTouches[0].screenY - touchStartY;
    if(Math.abs(dx)>Math.abs(dy)){
        if(dx>threshold) move('right');
        else if(dx<-threshold) move('left');
    } else {
        if(dy>threshold) move('down');
        else if(dy<-threshold) move('up');
    }
});

// -------------------------
// BOUTONS
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Nouvelle partie
    document.getElementById('new-game').addEventListener('click', () => {
        score = 0;
        initGrid();
        scoreEl.textContent = score;
    });

    // Partager
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', async () => {
        const url = "https://2048-nth2.netlify.app/";
        const message = `J'ai fait ${score} points sur 2048 ! Viens jouer avec moi ici : ${url}`;
        
        if (navigator.share) {
            try { await navigator.share({ title:"2048 NTH2", text: message, url:url }); } 
            catch(err){ alert("Partage annulé ou erreur: " + err); }
        } else if(navigator.clipboard) {
            try { await navigator.clipboard.writeText(message); alert("Message copié dans le presse-papier !"); } 
            catch(err){ alert("Impossible de copier : "+err); }
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = message;
            document.body.appendChild(textArea);
            textArea.select();
            try { document.execCommand('copy'); alert("Message copié dans le presse-papier !"); } 
            catch(err){ alert("Impossible de copier : "+err); }
            document.body.removeChild(textArea);
        }
    });

    // Déconnexion
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = "Se déconnecter";
    logoutBtn.style.marginLeft = "10px";
    document.querySelector('.controls').appendChild(logoutBtn);

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        alert("Déconnecté !");
        location.reload();
    });

    // Charger leaderboard au démarrage
    loadLeaderboard();
});

// -------------------------
// LEADERBOARD
// -------------------------
const leaderboardEl = document.getElementById('leaderboard');

async function loadLeaderboard(){
    try {
        const res = await fetch(sheetDBScores);
        const data = await res.json();
        leaderboardEl.innerHTML = '';

        data.sort((a,b)=>Number(b.score)-Number(a.score));

        data.slice(0,10).forEach((entry,i)=>{
            const p = document.createElement('p');
            p.textContent = `${i+1}. ${entry.pseudo} : ${entry.score}`;
            leaderboardEl.appendChild(p);
        });
    } catch(err){
        console.error("Erreur leaderboard:", err);
        leaderboardEl.textContent = "Impossible de charger le leaderboard.";
    }
}

// -------------------------
// ENVOI SCORE
// -------------------------
async function sendScore(){
    if(!currentUser.pseudo || currentUser.pseudo==='Guest') return;

    await fetch(sheetDBScores,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({data:{pseudo:currentUser.pseudo, score:score}})
    });

    if(score>currentUser.highscore){
        currentUser.highscore = score;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    loadLeaderboard(); // <-- Met à jour après chaque envoi
}

// -------------------------
// INITIALISATION
// -------------------------
initGrid();
