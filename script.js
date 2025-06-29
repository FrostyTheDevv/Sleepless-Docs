let db, currentCat = null;

// ─── Load Data ─────────────────────────────────────────────
async function loadData() {
  const saved = localStorage.getItem('sleepless-commands');
  if (saved) {
    try {
      db = JSON.parse(saved);
    } catch (e) {
      console.error('Corrupt localStorage, refetching:', e);
      db = await fetchAndCache();
    }
  } else {
    db = await fetchAndCache();
  }
  renderCategories();
  renderCards();
}

// Fetch commands.json once, then cache in localStorage
async function fetchAndCache() {
  const json = await fetch('commands.json').then(r => r.json());
  localStorage.setItem('sleepless-commands', JSON.stringify(json));
  return json;
}

// When another tab writes to localStorage, re-render
window.addEventListener('storage', (e) => {
  if (e.key === 'sleepless-commands') {
    loadData();
  }
});

loadData();


// ─── Render Category Bar ───────────────────────────────────
function renderCategories() {
  const bar = document.getElementById('categoryBar');
  bar.innerHTML = '';

  // “All” button
  const allBtn = createButton('All', () => {
    currentCat = null;
    activateButton(allBtn);
    renderCards();
  });
  bar.appendChild(allBtn);

  db.categories.forEach(cat => {
    const btn = createButton(cat.name, () => {
      currentCat = cat.id;
      activateButton(btn);
      renderCards();
    });
    bar.appendChild(btn);
  });
}

// ─── Button Activation ────────────────────────────────────
function activateButton(activeBtn) {
  document
    .querySelectorAll('.category-bar button')
    .forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

// ─── Render Command Cards ──────────────────────────────────
function renderCards() {
  const term = document.getElementById('search').value.toLowerCase();
  const out  = document.getElementById('cards');
  out.innerHTML = '';

  db.commands
    .filter(cmd => {
      if (currentCat && cmd.categoryId !== currentCat) return false;
      if (term && !(
           cmd.name.toLowerCase().includes(term) ||
           cmd.description.toLowerCase().includes(term)
         )) return false;
      return true;
    })
    .forEach(cmd => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${cmd.name}</h3>
        <p class="desc">${cmd.description}</p>
        <h4 class="field">arguments</h4>
        <p class="value">${cmd.args.length ? cmd.args.join(', ') : 'none'}</p>
        <h4 class="field">permissions</h4>
        <p class="value">${cmd.perms.length ? cmd.perms.join(', ') : 'none'}</p>
      `;
      out.appendChild(card);
    });
}

// ─── Search Input Handler ─────────────────────────────────
document.getElementById('search')
        .addEventListener('input', renderCards);

// ─── Helper to create buttons ──────────────────────────────
function createButton(text, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}