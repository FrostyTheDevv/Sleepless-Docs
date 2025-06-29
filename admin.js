let db;

// DOM refs
const catList      = document.getElementById('category-list');
const cmdList      = document.getElementById('command-list');
const cmdCatSelect = document.getElementById('cmd-cat');

const newCatIdInput   = document.getElementById('new-cat-id');
const newCatNameInput = document.getElementById('new-cat-name');
const addCatBtn       = document.getElementById('add-cat');

const cmdIdInput    = document.getElementById('cmd-id');
const cmdNameInput  = document.getElementById('cmd-name');
const cmdDescInput  = document.getElementById('cmd-desc');
const cmdArgsInput  = document.getElementById('cmd-args');
const cmdPermsInput = document.getElementById('cmd-perms');
const addCmdBtn     = document.getElementById('add-cmd');

// ─── Load & Initialize ─────────────────────────────────────
async function loadData() {
  const saved = localStorage.getItem('sleepless-commands');
  if (saved) {
    try {
      db = JSON.parse(saved);
    } catch {
      console.warn('Invalid saved data, reloading from commands.json');
      db = await fetchAndCache();
    }
  } else {
    db = await fetchAndCache();
  }
  renderCategoriesAdmin();
  renderCommandsAdmin();
  populateCategorySelect();
}

// Fetch original commands.json once and cache it
async function fetchAndCache() {
  const json = await fetch('commands.json').then(r => r.json());
  persist(json);
  return json;
}

// Listen for changes in other tabs
window.addEventListener('storage', e => {
  if (e.key === 'sleepless-commands') {
    loadData();
  }
});

loadData();


// ─── Render Categories ──────────────────────────────────────
function renderCategoriesAdmin() {
  catList.innerHTML = '';
  db.categories.forEach(cat => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = `${cat.id} — ${cat.name}`;
    li.appendChild(span);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Delete';
    btn.onclick = () => {
      db.categories = db.categories.filter(c => c.id !== cat.id);
      // also remove commands in that category
      db.commands = db.commands.filter(c => c.categoryId !== cat.id);
      updateAll();
    };
    li.appendChild(btn);

    catList.appendChild(li);
  });
}


// ─── Render Commands ────────────────────────────────────────
function renderCommandsAdmin() {
  cmdList.innerHTML = '';
  db.commands.forEach(cmd => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = `${cmd.id} — ${cmd.name} [${cmd.categoryId}]`;
    li.appendChild(span);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Delete';
    btn.onclick = () => {
      db.commands = db.commands.filter(c => c.id !== cmd.id);
      updateAll();
    };
    li.appendChild(btn);

    cmdList.appendChild(li);
  });
}


// ─── Populate Category Select ───────────────────────────────
function populateCategorySelect() {
  cmdCatSelect.innerHTML = '';
  db.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    cmdCatSelect.appendChild(opt);
  });
}


// ─── Add Category Handler ───────────────────────────────────
addCatBtn.type = 'button';
addCatBtn.onclick = () => {
  const id   = newCatIdInput.value.trim();
  const name = newCatNameInput.value.trim();
  if (!id || !name) {
    return alert('Both ID & Name are required');
  }
  if (db.categories.some(c => c.id === id)) {
    return alert('Category ID already exists');
  }
  db.categories.push({ id, name });
  newCatIdInput.value   = '';
  newCatNameInput.value = '';
  newCatIdInput.focus();
  updateAll();
};


// ─── Add Command Handler ────────────────────────────────────
addCmdBtn.type = 'button';
addCmdBtn.onclick = () => {
  const id    = cmdIdInput.value.trim();
  const name  = cmdNameInput.value.trim();
  const desc  = cmdDescInput.value.trim();
  const args  = cmdArgsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  const perms = cmdPermsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  const cat   = cmdCatSelect.value;

  if (!id || !name || !desc) {
    return alert('ID, Name & Description are required');
  }
  if (db.commands.some(c => c.id === id)) {
    return alert('Command ID already exists');
  }

  db.commands.push({ id, name, description: desc, args, perms, categoryId: cat });
  cmdIdInput.value    = '';
  cmdNameInput.value  = '';
  cmdDescInput.value  = '';
  cmdArgsInput.value  = '';
  cmdPermsInput.value = '';
  cmdIdInput.focus();
  updateAll();
};


// ─── Persist & Re-render ───────────────────────────────────
function updateAll() {
  persist(db);
  renderCategoriesAdmin();
  renderCommandsAdmin();
  populateCategorySelect();
}

// Save to localStorage
function persist(data) {
  localStorage.setItem('sleepless-commands', JSON.stringify(data));
}