const ADMIN_PASSWORD = "Marius2013.";
const sheetDBUsers = 'https://sheetdb.io/api/v1/p1ncxt35jrm81';
const sheetDBScores = 'https://sheetdb.io/api/v1/p7fydq5tsp2br';
const loginForm = document.getElementById('adminLoginForm');
const adminPanel = document.getElementById('adminPanel');
const adminContent = document.getElementById('adminContent');

loginForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const pwd = document.getElementById('adminPassword').value;
    if(pwd!==ADMIN_PASSWORD){ alert("Mot de passe incorrect"); return; }
    loginForm.style.display='none';
    adminPanel.style.display='block';
    await loadAdmin();
});

async function loadAdmin(){
    adminContent.innerHTML='<h3>Utilisateurs :</h3>';
    const users = await fetch(sheetDBUsers).then(r=>r.json());
    users.forEach(u=>{
        const div = document.createElement('div');
        div.textContent = `${u.pseudo} - Highscore: ${u.highscore}`;
        adminContent.appendChild(div);
    });

    adminContent.innerHTML+='<h3>Scores :</h3>';
    const scores = await fetch(sheetDBScores).then(r=>r.json());
    scores.forEach(s=>{
        const div = document.createElement('div');
        div.textContent = `${s.pseudo} : ${s.score}`;
        adminContent.appendChild(div);
    });
}
