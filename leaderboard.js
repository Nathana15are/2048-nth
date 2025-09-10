const sheetDBScores = 'https://sheetdb.io/api/v1/p7fydq5tsp2br';
const leaderboardEl = document.getElementById('leaderboard');

async function loadLeaderboard(){
    const scores = await fetch(sheetDBScores).then(r=>r.json());
    scores.sort((a,b)=>b.score - a.score);
    leaderboardEl.innerHTML = '';
    scores.slice(0,10).forEach((s,i)=>{
        const p = document.createElement('p');
        p.textContent = `${i+1}. ${s.pseudo} : ${s.score}`;
        leaderboardEl.appendChild(p);
    });
}

loadLeaderboard();
