function user(){try{return JSON.parse(localStorage.getItem('borrowUser'))}catch(e){return null}}
function needLogin(){if(!user()){location.href='login.html';return false}return true}
function logout(){localStorage.removeItem('borrowUser');location.href='index.html'}
function data(form){return new URLSearchParams(new FormData(form)).toString()}
const rf=document.getElementById('registerForm');
if(rf)rf.onsubmit=async e=>{e.preventDefault();let r=await fetch('/register',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data(rf)});let m=await r.text();document.getElementById('message').textContent=m;if(m==='Registration successful!'){rf.reset();setTimeout(()=>location.href='login.html',700)}};
const lf=document.getElementById('loginForm');
if(lf)lf.onsubmit=async e=>{e.preventDefault();let r=await fetch('/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data(lf)});let x=await r.text();if(x.includes('|')){let p=x.split('|');localStorage.setItem('borrowUser',JSON.stringify({name:p[0],email:p[1]}));location.href='dashboard.html'}else document.getElementById('message').textContent=x};
const w=document.getElementById('welcome');if(w&&needLogin())w.textContent=user().name;
const af=document.getElementById('addItemForm');
if(af&&needLogin())af.onsubmit=async e=>{e.preventDefault();let d=new URLSearchParams(new FormData(af));d.append('ownerEmail',user().email);let r=await fetch('/add-item',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d});let m=await r.text();document.getElementById('message').textContent=m;if(m==='Item added successfully!')af.reset()};
const itemsBox=document.getElementById('items');
if(itemsBox&&needLogin())loadItems();
async function loadItems(){let r=await fetch('/api/items');let a=await r.json();itemsBox.innerHTML=a.length?'':'<p>No items added yet.</p>';a.forEach(x=>{let c=document.createElement('div');c.className='item-card';let b=x.status==='Available'&&x.owner!==user().email?`<button onclick="borrow(${x.id})">Request to Borrow</button>`:'';c.innerHTML=`<h3>${safe(x.name)}</h3><p><b>Category:</b> ${safe(x.category)}</p><p>${safe(x.description)}</p><p><b>Condition:</b> ${safe(x.condition)}</p><p><span class="badge">${safe(x.status)}</span></p>${b}`;itemsBox.appendChild(c)})}
async function borrow(id){let d=new URLSearchParams({itemId:id,borrowerEmail:user().email});let r=await fetch('/borrow',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d});alert(await r.text());loadItems()}
const reqBox=document.getElementById('requests');if(reqBox&&needLogin())loadRequests();
async function getRequests(){let d=new URLSearchParams({email:user().email});let r=await fetch('/requests',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d});return await r.json()}
async function loadRequests(){let a=await getRequests();reqBox.innerHTML=a.length?'':'<p>No requests found.</p>';a.forEach(x=>{let c=document.createElement('div');c.className='request-card';let b=x.owner===user().email&&x.status==='Pending'?`<button onclick="approve(${x.id})">Approve Request</button>`:'';c.innerHTML=`<h3>${safe(x.itemName)}</h3><p>Borrower: ${safe(x.borrower)}</p><p>Owner: ${safe(x.owner)}</p><p>Status: ${safe(x.status)}</p>${b}`;reqBox.appendChild(c)})}
async function approve(id){let d=new URLSearchParams({requestId:id,ownerEmail:user().email});let r=await fetch('/approve',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d});alert(await r.text());loadRequests()}
const retBox=document.getElementById('returns');if(retBox&&needLogin())loadReturns();
async function loadReturns(){let a=await getRequests();let mine=a.filter(x=>x.borrower===user().email&&x.status==='Approved');retBox.innerHTML=mine.length?'':'<p>You have no currently borrowed items.</p>';mine.forEach(x=>{let c=document.createElement('div');c.className='request-card';c.innerHTML=`<h3>${safe(x.itemName)}</h3><p>Owner: ${safe(x.owner)}</p><p>Status: Borrowed</p><button onclick="returnItem(${x.itemId})">Return Item</button>`;retBox.appendChild(c)})}
async function returnItem(id){let d=new URLSearchParams({itemId:id,borrowerEmail:user().email});let r=await fetch('/return',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d});alert(await r.text());loadReturns()}
function safe(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
