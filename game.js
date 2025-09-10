const sheetDBScores = 'https://sheetdb.io/api/v1/p7fydq5tsp2br';
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {pseudo:'Guest', highscore:0};
let gridSize = 4, grid = [], score = 0;
const scoreEl = document.getElementById('score'), gridContainer = document.querySelector('.grid');

// Bloquer scroll mobile
document.body.addEventListener('touchmove', e => { e.preventDefault(); }, {passive:false});

// Initialisation
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

// Déplacements
function move(direction){
    let moved=false;
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

    if(direction==='left'){
        grid = grid.map(row => slide(row));
    } else if(direction==='right'){
        grid = grid.map(row => slide(row.reverse()).reverse());
    } else if(direction==='up'){
        grid = grid[0].map((_,c)=>slide(grid.map(r=>r[c]))).map((col,r)=>col.map((val,rr)=>grid[rr][r]=val));
    } else if(direction==='down'){
        grid = grid[0].map((_,c)=>slide(grid.map(r=>r[c]).reverse()).reverse()).map((col,r)=>col.map((val,rr)=>grid[rr][r]=val));
    }

    if(JSON.stringify(grid)!==oldGrid){
        addTile();
        renderGrid();
        moved=true;
    }
    let touchStartX = 0;
let touchStartY = 0;
const threshold = 30; // distance minimale pour considérer un swipe

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    if(Math.abs(dx) > Math.abs(dy)){
        if(dx > threshold) move('right');
        else if(dx < -threshold) move('left');
    } else {
        if(dy > threshold) move('down');
        else if(dy < -threshold) move('up');
    }
});

    if(checkGameOver()) alert('Game Over !');
    return moved;
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

// Contrôles clavier
document.addEventListener('keydown', e=>{
    let moved=false;
    if(e.key==='ArrowUp') moved=move('up');
    else if(e.key==='ArrowDown') moved=move('down');
    else if(e.key==='ArrowLeft') moved=move('left');
    else if(e.key==='ArrowRight') moved=move('right');
    if(moved) sendScore();
});

// Partage
document.getElementById('share-btn').addEventListener('click', ()=>{
    const url = "https://2048-nth2.netlify.app/";
    navigator.clipboard.writeText(`J'ai fait ${score} points sur 2048 ! Viens jouer avec moi ici : ${url}`);
    alert('Message copié dans le presse-papier !');
});

// Nouvelle partie
document.getElementById('new-game').addEventListener('click', ()=>{
    score=0;
    initGrid();
});

// Envoi score
async function sendScore(){
    if(score>currentUser.highscore){
        await fetch(sheetDBScores, {
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({data:{pseudo:currentUser.pseudo, score:score}})
        });
        localStorage.setItem('currentUser', JSON.stringify({...currentUser, highscore:score}));
    }
}

initGrid();
