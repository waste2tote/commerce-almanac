// Glossary page: thumb-index category tabs + live search filter

let activeCategory = "all";

function catLabel(id) {
  if (id === "all") return "All Entries";
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

function renderTabs() {
  const wrap = document.getElementById("indexTabs");
  const counts = {};
  TERMS.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);

  const allTab = `
    <button class="index-tab ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
      <span class="idx-mark">ALL</span> Full Ledger <span class="idx-count">${TERMS.length}</span>
    </button>`;

  const tabs = CATEGORIES.map(c => `
    <button class="index-tab ${activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
      <span class="idx-mark">${c.tab}</span> ${c.label} <span class="idx-count">${counts[c.id] || 0}</span>
    </button>`).join("");

  wrap.innerHTML = allTab + tabs;

  wrap.querySelectorAll(".index-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderTabs();
      renderEntries();
    });
  });
}

function renderEntries() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const list = TERMS.filter(t => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesQuery = !query ||
      t.term.toLowerCase().includes(query) ||
      t.definition.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const countEl = document.getElementById("resultCount");
  countEl.textContent = `${list.length} entr${list.length === 1 ? "y" : "ies"} — ${catLabel(activeCategory)}${query ? ` — matching "${query}"` : ""}`;

  const container = document.getElementById("entryList");
  if (list.length === 0) {
    container.innerHTML = `<p class="no-results">No terms match that search. Try a shorter word, or clear the filter.</p>`;
    return;
  }

  container.innerHTML = list.map(t => {
    const cat = CATEGORIES.find(c => c.id === t.category);
    return `
      <article class="entry">
        <div class="entry-head">
          <span class="entry-term">${t.term}</span>
          <span class="entry-tag">${cat ? cat.label : t.category}</span>
        </div>
        <p class="entry-def">${t.definition}</p>
        ${t.example ? `<p class="entry-example">${t.example}</p>` : ""}
      </article>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const catParam = params.get("cat");
  if (catParam && (catParam === "all" || CATEGORIES.some(c => c.id === catParam))) {
    activeCategory = catParam;
  }
  renderTabs();
  renderEntries();
  document.getElementById("searchInput").addEventListener("input", renderEntries);
});
