const sheetDBUsers='https://sheetdb.io/api/v1/p1ncxt35jrm81';
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pseudo = document.getElementById('pseudo').value;
  const password = document.getElementById('password').value;
  const users = await fetch(sheetDBUsers).then(r => r.json());
  const user = users.find(u => u.pseudo === pseudo && u.password === password);
  if(user){
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href='game.html';
  } else {
    document.getElementById('loginMsg').textContent = "Pseudo ou mot de passe incorrect";
  }
});
