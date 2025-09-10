const sheetDBUsers='https://sheetdb.io/api/v1/p1ncxt35jrm81';
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pseudo = document.getElementById('pseudo').value;
  const password = document.getElementById('password').value;
  const users = await fetch(sheetDBUsers).then(r => r.json());
  if(users.find(u => u.pseudo === pseudo)){
    document.getElementById('registerMsg').textContent = 'Pseudo déjà utilisé';
    return;
  }
  await fetch(sheetDBUsers, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({data:{pseudo,password,highscore:0,date:new Date().toISOString()}})
  });
  document.getElementById('registerMsg').textContent = "Compte créé !";
});
