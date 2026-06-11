const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function buildProjectCard(p){
  const tools = (p.tools || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('');
  const highlights = (p.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');

  let link = '';
  if(p.link){
    if(p.category === 'CAD'){
      link = `<a class="btn-link" href="./cad-view.html?id=${encodeURIComponent(p.id)}" target="_self" rel="noreferrer">View Model</a>`;
    }else{
      link = `<a class="btn-link" href="${escapeHtml(p.link)}" target="_blank" rel="noreferrer">View</a>`;
    }
  }

  return `
    <article class="project" data-tools="${escapeHtml((p.tools||[]).join(','))}">
      <div class="project-top">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <div class="badges" style="margin-top:8px;">${tools}</div>
        </div>
      </div>
      <p>${escapeHtml(p.summary || '')}</p>
      ${highlights ? `<ul>${highlights}</ul>` : ''}
      <div class="meta">
        <span><span class="year">${escapeHtml(p.year || '')}</span></span>
        ${link}
      </div>
    </article>
  `;
}


function renderFeatured(projects){
  const grid = qs('#featuredGrid');
  if(!grid) return;
  const featured = projects.slice(0, 3);
  grid.innerHTML = featured.map(buildProjectCard).join('');
}

function renderCadShowcase(projects){
  // New: hover-based horizontal CAD buttons + detail area with image
  const tabs = qs('#cadTabs');
  const detailText = qs('#cadDetailText');
  const detailImg = qs('#cadDetailImage');
  if(!tabs || !detailText || !detailImg) return;

  const cad = projects.filter(p => p.category === 'CAD');
  const showcase = cad.slice(0, 6);
  if(showcase.length === 0) return;

  const getImageForProject = (p) => {
    // prefer projects.json `image` field; fallback to common v6 engine image if missing
    if(p.image && String(p.image).trim()) return p.image;
    return '';
  };

  const buildTab = (p, idx) => {
    const img = getImageForProject(p);
    const activeClass = idx === 0 ? ' is-active' : '';
    return `
<button type="button" class="cad-tab${activeClass}" role="tab" aria-selected="${idx===0}" data-id="${escapeHtml(p.id)}">
        ${escapeHtml(p.title)}
      </button>
    `;
  };

  // Set initial active project (first)
  const setActive = (p) => {
    const tools = (p.tools || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('');
    const highlights = (p.highlights || []).slice(0, 3).map(h => `<li>${escapeHtml(h)}</li>`).join('');

    detailText.innerHTML = `
      <div class="cad-detail-title">${escapeHtml(p.title)}</div>
      <div class="cad-detail-meta">
        <span class="cad-detail-year">${escapeHtml(p.year || '')}</span>
        <span class="cad-detail-cat">${escapeHtml(p.category || 'CAD')}</span>
      </div>
      <div class="cad-detail-tools" style="margin-top:10px;">${tools}</div>
      ${p.summary ? `<p class="cad-detail-summary">${escapeHtml(p.summary)}</p>` : ''}
      ${highlights ? `<ul class="cad-detail-list">${highlights}</ul>` : ''}
      <div class="cad-detail-actions" style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn" href="./cad-view.html?id=${encodeURIComponent(p.id)}">View Model</a>
      </div>
    `;

    const img = getImageForProject(p);
    detailImg.src = img ? img : '';
    detailImg.alt = p.title ? `${p.title} preview` : 'CAD project preview';
    detailImg.style.display = img ? 'block' : 'none';
  };

  tabs.innerHTML = showcase.map(buildTab).join('');

  // Activate handlers
  const tabButtons = qsa('.cad-tab', tabs);
  let current = showcase[0];
  setActive(current);

  tabButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const id = btn.getAttribute('data-id');
      const p = showcase.find(x => x.id === id);
      if(!p) return;

      current = p;
      tabButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      setActive(p);
    });

    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const url = `./cad-view.html?id=${encodeURIComponent(id)}`;
      window.location.href = url;
    });
  });
}



function getUnique(arr){
  return Array.from(new Set(arr)).filter(Boolean);
}

function applyFilters(projects, category){
  const grid = qs('#projectsGrid');
  if(!grid) return;

  const search = (qs('#q')?.value || '').trim().toLowerCase();
  const tool = qs('#tool')?.value || '';
  const year = qs('#year')?.value || '';

  let filtered = projects.filter(p => p.category === category);
  if(search){
    filtered = filtered.filter(p => {
      const hay = [p.title, p.summary, ...(p.highlights||[]), ...(p.tools||[])].join(' ').toLowerCase();
      return hay.includes(search);
    });
  }
  if(tool){
    filtered = filtered.filter(p => (p.tools||[]).includes(tool));
  }
  if(year){
    filtered = filtered.filter(p => String(p.year) === String(year));
  }

  const empty = qs('#emptyState');
  const html = filtered.map(buildProjectCard).join('');
  grid.innerHTML = html;
  if(empty){
    empty.hidden = filtered.length !== 0;
  }
}

function hydrateFilterOptions(projects, category){
  const toolSel = qs('#tool');
  const yearSel = qs('#year');
  if(!toolSel || !yearSel) return;

  const catProjects = projects.filter(p => p.category === category);
  const tools = getUnique(catProjects.flatMap(p => p.tools || []));
  const years = getUnique(catProjects.map(p => p.year));

  toolSel.innerHTML = '<option value="">All</option>' + tools.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  yearSel.innerHTML = '<option value="">All</option>' + years.map(y => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('');
}

async function loadProjects(){
  const res = await fetch('./projects.json');
  if(!res.ok) throw new Error('Failed to load projects.json');
  return await res.json();
}

function setYear(){
  const y = qs('#footerYear'); // Updated selector
  if(y) y.textContent = new Date().getFullYear();
}

(async function main(){
  try{
    setYear();
    const data = await loadProjects();
    const projects = data.projects || [];

    renderFeatured(projects);
    renderCadShowcase(projects);

    const grid = qs('#projectsGrid');
    if(grid){
      const category = grid.getAttribute('data-category');
      hydrateFilterOptions(projects, category);

      const rerun = () => applyFilters(projects, category);

      qs('#q')?.addEventListener('input', rerun);
      qs('#tool')?.addEventListener('change', rerun);
      qs('#year')?.addEventListener('change', rerun);
      qs('#reset')?.addEventListener('click', () => {
        if(qs('#q')) qs('#q').value = '';
        if(qs('#tool')) qs('#tool').value = '';
        if(qs('#year')) qs('#year').value = '';
        rerun();
      });

      applyFilters(projects, category);
    }
  }catch(err){
    console.error(err);
  }
})();

