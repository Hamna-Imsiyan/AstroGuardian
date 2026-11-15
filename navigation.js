/* Feature pages share one static app shell so local records work on any host. */
(() => {
  const pages = [...document.querySelectorAll('[data-page]')];
  const names = {overview:'Mission overview', 'check-in':'Daily check-in', trends:'Trends & insights', body:'Body explorer', history:'Health history', wellness:'Wellness missions', mission:'Mission tools', offline:'Offline support', emergency:'Emergency support', assistant:'Meet ASTRA'};
  const main = document.getElementById('mainContent');
  const mobileButton = document.getElementById('mobileMenuButton');
  const nav = document.getElementById('mainNavigation');
  const groups = [...document.querySelectorAll('.nav-group')];
  let currentPage;

  function closeDropdowns(except) {
    groups.forEach(group => {
      if (group === except) return;
      group.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
      group.querySelector('.nav-dropdown').hidden = true;
    });
  }
  function closeNavigation() {
    closeDropdowns();
    mobileButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('mobile-open');
  }
  function updateOverview() {
    const latest = healthRecords[0];
    document.getElementById('overviewRecordCount').textContent = healthRecords.length;
    document.getElementById('overviewLatest').textContent = latest ? 'Latest check-in · ' + latest.date : 'Your first check-in starts here';
    document.querySelectorAll('[data-overview-metric]').forEach(el => {
      el.textContent = latest ? latest[el.dataset.overviewMetric] : '—';
    });
  }
  function renderPage(focus = true) {
    let requested = 'overview';
    try { requested = decodeURIComponent(location.hash.slice(1)).replace(/^\//, '').replace(/\/$/, '') || 'overview'; }
    catch (_) { /* A malformed bookmark returns to the overview. */ }
    const aliases = {healthDashboard:'trends', bodyMap:'body', healthForm:'check-in', astraAssistant:'assistant', wellnessPanel:'wellness', emergencyPanel:'emergency', missionTools:'mission'};
    const page = aliases[requested] || (names[requested] ? requested : 'overview');
    if (location.hash !== '#/' + page) history.replaceState(null, '', '#/' + page);
    if (currentPage === page) return;
    window.AstraCompanion?.close();
    pages.forEach(section => { section.hidden = section.dataset.page !== page; });
    // Emergency panel was previously a disclosure within the long page.
    document.getElementById('emergencyPanel').hidden = page !== 'emergency';
    currentPage = page;
    document.body.dataset.currentPage = page;
    document.title = names[page] + ' | AstroGuardian';
    document.querySelectorAll('.main-navigation a').forEach(link => {
      if (link.hash === '#/' + page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    groups.forEach(group => group.classList.toggle('has-current', !!group.querySelector('[aria-current="page"]')));
    closeNavigation();
    document.getElementById('routeAnnouncement').textContent = names[page] + ' page';
    if (focus) {
      document.getElementById('title-' + page).focus({preventScroll:true});
      window.scrollTo({top:0, behavior:'instant'});
    }
    window.dispatchEvent(new CustomEvent('astroguardian:page-changed', {detail:{page}}));
  }
  function navigate(path) {
    const page = String(path).replace(/^#?\//, '');
    const hash = '#/' + (names[page] ? page : 'overview');
    if (location.hash === hash) renderPage();
    else { location.hash = hash; renderPage(); }
  }
  window.AstroGuardian = {navigate, get page(){return currentPage;}};
  window.addEventListener('hashchange', () => renderPage());
  window.addEventListener('astroguardian:navigate', event => navigate(event.detail?.page || 'overview'));
  window.addEventListener('astroguardian:records-updated', updateOverview);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-reminder-settings]')) {
      event.preventDefault();
      navigate('/mission');
      requestAnimationFrame(() => {
        document.getElementById('enhReminderEnabled').focus({preventScroll:true});
        document.getElementById('measurementReminderSettings').scrollIntoView({block:'start'});
      });
      return;
    }
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      main.focus({preventScroll:true});
      main.scrollIntoView({block:'start'});
      return;
    }
    const call = event.target.closest('[data-open-assistant]');
    if (call) window.dispatchEvent(new Event('astroguardian:open-assistant'));
    if (!event.target.closest('.nav-group')) closeDropdowns();
    if (event.target.closest('.main-navigation a')) closeNavigation();
  });
  groups.forEach(group => {
    const trigger = group.querySelector('.nav-trigger');
    const dropdown = group.querySelector('.nav-dropdown');
    trigger.addEventListener('click', () => {
      const opening = dropdown.hidden;
      closeDropdowns(group);
      dropdown.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
    });
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        closeDropdowns(group);
        dropdown.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.querySelector('a').focus();
      }
    });
    group.addEventListener('focusout', () => setTimeout(() => {
      if (!group.contains(document.activeElement)) {
        dropdown.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    }, 0));
  });
  mobileButton.addEventListener('click', () => {
    const open = mobileButton.getAttribute('aria-expanded') !== 'true';
    mobileButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('mobile-open', open);
    if (!open) closeDropdowns();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = groups.find(group => group.querySelector('.nav-trigger').getAttribute('aria-expanded') === 'true');
    if (active) { closeDropdowns(); active.querySelector('.nav-trigger').focus(); }
    else if (nav.classList.contains('mobile-open')) { closeNavigation(); mobileButton.focus(); }
  });
  nav.addEventListener('keydown', event => {
    // Keep keyboard navigation predictable within each expanded dropdown.
    const panel = event.target.closest('.nav-dropdown');
    if (!panel || !['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    const links = [...panel.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  });
  document.getElementById('missionDate').textContent = new Intl.DateTimeFormat(undefined, {weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(new Date());
  updateOverview();
  renderPage(false);
})();
