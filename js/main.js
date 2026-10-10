(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* ---------- Header & mobile menu ---------- */

  const header = $('#header');
  const menu = $('#menu');
  const menuToggle = $('#menu-toggle');

  const setMenu = (open) => {
    if (!menu || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', menuToggle).textContent = open ? 'Close menu' : 'Open menu';
    menu.classList.toggle('is-open', open);
  };

  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.classList.contains('is-open') && !event.target.closest('#menu, #menu-toggle')) setMenu(false);
    });
    const desktop = window.matchMedia('(min-width: 901px)');
    const onDesktop = (event) => {
      if (event.matches) setMenu(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- In-page links without "#" in the address bar ---------- */

  const isHome = (path) => /\/(index\.html)?$/.test(path);
  const samePage = (url) => url.pathname === location.pathname || (isHome(url.pathname) && isHome(location.pathname));
  const cleanUrl = () => history.replaceState(null, '', location.pathname + location.search);

  const goTo = (target) => {
    target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    if (target.matches('main')) target.focus({ preventScroll: true });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.href, location.href);
    if (!samePage(url) || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    goTo(target);
    cleanUrl();
  });

  // Arriving from another page with a hash (e.g. /#languages): scroll there, then tidy the URL
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    cleanUrl();
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  /* ---------- Reveal on scroll (content is never hidden) ---------- */

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- Hero: pause the drifting language rows ---------- */

  const weave = $('#weave');
  const weaveToggle = $('#weave-toggle');
  if (weave && weaveToggle) {
    weaveToggle.addEventListener('click', () => {
      const paused = !weave.classList.contains('is-paused');
      weave.classList.toggle('is-paused', paused);
      weaveToggle.setAttribute('aria-pressed', String(paused));
      $('span', weaveToggle).textContent = paused ? 'Play animation' : 'Pause animation';
    });
  }

  /* ---------- Languages by district ----------
     Main and minor languages per district follow the published district
     language table (Kabui listed as Rongmei, Poula as Poumai). */

  const DISTRICTS = {
    'Bishnupur': { main: ['Meiteilon'], also: ['Kom', 'Rongmei'] },
    'Chandel': { main: ['Thadou', 'Anal', 'Lamkang'], also: ['Maring', 'Moyon', 'Monsang', 'Chothe', 'Gangte', 'Tarao', 'Vaiphei'] },
    'Churachandpur': { main: ['Paite', 'Thadou', 'Hmar', 'Vaiphei', 'Zou', 'Gangte'], also: ['Kom', 'Aimol', 'Chiru', 'Meiteilon', 'Simte'] },
    'Imphal East': { main: ['Meiteilon', 'Rongmei'], also: ['Tangkhul', 'Thadou', 'Mao', 'Hmar', 'Paite', 'Gangte', 'Vaiphei'] },
    'Imphal West': { main: ['Meiteilon', 'Rongmei'], also: ['Tangkhul', 'Thadou', 'Mao', 'Hmar', 'Paite', 'Gangte', 'Vaiphei'] },
    'Jiribam': { main: ['Meiteilon', 'Bengali', 'Hmar'], also: ['Rongmei', 'Thadou', 'Paite', 'Gangte', 'Vaiphei'] },
    'Kakching': { main: ['Meiteilon'], also: [] },
    'Kamjong': { main: ['Tangkhul'], also: ['Thadou'] },
    'Kangpokpi': { main: ['Thadou', 'Nepali'], also: ['Kom', 'Liangmai', 'Thangal', 'Rongmei', 'Aimol', 'Tangkhul', 'Koireng', 'Kharam', 'Vaiphei', 'Gangte', 'Hmar'] },
    'Noney': { main: ['Rongmei', 'Inpui'], also: ['Gangte', 'Vaiphei'] },
    'Pherzawl': { main: ['Hmar', 'Thadou'], also: ['Simte', 'Paite', 'Bengali', 'Vaiphei', 'Gangte'] },
    'Senapati': { main: ['Mao', 'Poumai'], also: ['Maram', 'Thangal', 'Liangmai', 'Rongmei', 'Inpui', 'Tangkhul'] },
    'Tamenglong': { main: ['Rongmei', 'Liangmai', 'Zeme', 'Inpui'], also: ['Thadou', 'Chiru', 'Hmar'] },
    'Tengnoupal': { main: ['Maring', 'Thadou', 'Gangte'], also: ['Aimol', 'Zou'] },
    'Thoubal': { main: ['Meiteilon'], also: ['Aimol', 'Anal', 'Maring'] },
    'Ukhrul': { main: ['Tangkhul'], also: ['Thadou'] },
  };

  const VALLEY = ['Imphal West', 'Imphal East', 'Thoubal', 'Bishnupur', 'Kakching'];
  const GROUPS = { valley: { label: 'Imphal valley', districts: VALLEY } };
  Object.keys(DISTRICTS).forEach((name) => {
    if (VALLEY.indexOf(name) === -1) GROUPS[name.toLowerCase().replace(/[^a-z]+/g, '-')] = { label: name, districts: [name] };
  });

  const LANGUAGES = {};
  const entry = (lang) => (LANGUAGES[lang] = LANGUAGES[lang] || { main: [], also: [] });
  Object.keys(DISTRICTS).forEach((district) => {
    DISTRICTS[district].main.forEach((lang) => entry(lang).main.push(district));
    DISTRICTS[district].also.forEach((lang) => entry(lang).also.push(district));
  });

  const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
  const unique = (items) => items.filter((item, i) => items.indexOf(item) === i);
  const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const strongList = (items) => list(items.map((item) => `<strong>${escapeHtml(item)}</strong>`));

  const chips = $$('.chip');

  /* ---------- Language map ---------- */

  const map = $('#map');
  if (map) {
    const frame = $('#map-frame');
    const paths = $$('.district', map);
    const callouts = $$('.callout-btn');
    const leaders = $$('.leader, .pin');
    const title = $('#map-info-title');
    const main = $('#map-info-main');
    const also = $('#map-info-also');
    const cta = $('#map-info-cta');
    const clear = $('#map-info-clear');
    const initial = { title: title.textContent, main: main.textContent };
    let selection = null;

    const groupOf = (district) => Object.keys(GROUPS).filter((id) => GROUPS[id].districts.indexOf(district) !== -1)[0];

    const highlight = (districts) => {
      const groups = districts.map(groupOf);
      const any = districts.length > 0;
      map.classList.toggle('has-selection', any);
      frame.classList.toggle('has-selection', any);
      paths.forEach((p) => p.classList.toggle('is-active', districts.indexOf(p.dataset.district) !== -1));
      leaders.forEach((el) => el.classList.toggle('is-active', groups.indexOf(el.dataset.group) !== -1));
      callouts.forEach((b) => b.setAttribute('aria-pressed', String(groups.indexOf(b.dataset.group) !== -1)));
    };

    const setInfo = (info) => {
      title.textContent = info.title;
      main.innerHTML = info.main;
      also.hidden = !info.also;
      also.textContent = info.also || '';
      cta.hidden = !info.lang;
      if (info.lang) {
        cta.textContent = `Get a quote in ${info.lang}`;
        cta.href = `contact.html?into=${encodeURIComponent(info.lang)}`;
      }
      clear.hidden = !selection;
    };

    const districtInfo = (districts, label) => {
      const mains = unique([].concat(...districts.map((d) => DISTRICTS[d].main)));
      const alsos = unique([].concat(...districts.map((d) => DISTRICTS[d].also))).filter((l) => mains.indexOf(l) === -1);
      return {
        title: label,
        main: `Main languages: ${strongList(mains)}.`,
        also: alsos.length ? `Also spoken: ${list(alsos)}.` : '',
        lang: mains.length === 1 ? mains[0] : null,
      };
    };

    const languageInfo = (lang) => {
      const info = LANGUAGES[lang];
      const label = lang === 'Meiteilon' ? 'Meiteilon (Manipuri)' : lang;
      if (!info) {
        return { title: label, main: `${escapeHtml(lang)} is spoken by smaller communities across Manipur. Tell us where your audience is and we'll match the right linguist.`, lang };
      }
      return {
        title: label,
        main: info.main.length ? `Main language in ${strongList(info.main)}.` : `Spoken in ${strongList(info.also)}.`,
        also: info.main.length && info.also.length ? `Also spoken in ${list(info.also)}.` : '',
        lang,
      };
    };

    const render = () => {
      if (!selection) {
        highlight([]);
        title.textContent = initial.title;
        main.textContent = initial.main;
        also.hidden = true;
        cta.hidden = true;
        clear.hidden = true;
        return;
      }
      const { type, id } = selection;
      if (type === 'group') {
        const g = GROUPS[id];
        highlight(g.districts);
        setInfo(districtInfo(g.districts, g.districts.length > 1 ? g.label : `${g.label} district`));
      } else if (type === 'district') {
        highlight([id]);
        setInfo(districtInfo([id], `${id} district`));
      } else {
        const info = LANGUAGES[id];
        highlight(info ? info.main.concat(info.also) : []);
        setInfo(languageInfo(id));
      }
    };

    const select = (next) => {
      const same = selection && next && selection.type === next.type && selection.id === next.id;
      selection = same ? null : next;
      chips.forEach((chip) => chip.setAttribute('aria-pressed', String(!!selection && selection.type === 'language' && selection.id === chip.dataset.lang)));
      render();
    };

    paths.forEach((path) => {
      const name = path.dataset.district;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      label.textContent = name;
      path.appendChild(label);
      path.addEventListener('click', () => select({ type: 'district', id: name }));
      path.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && !selection) {
          highlight([name]);
          setInfo(districtInfo([name], `${name} district`));
        }
      });
      path.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && !selection) render();
      });
    });

    callouts.forEach((btn) => btn.addEventListener('click', () => select({ type: 'group', id: btn.dataset.group })));

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        select({ type: 'language', id: chip.dataset.lang });
        if (selection && window.matchMedia('(max-width: 860px)').matches) {
          $('.map-info').scrollIntoView({ behavior: scrollBehavior, block: 'center' });
        }
      });
    });

    clear.addEventListener('click', () => select(null));
  }

  /* ---------- Language search ---------- */

  const search = $('#lang-search');
  if (search) {
    const count = $('#lang-count');
    const empty = $('#lang-empty');
    const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    search.addEventListener('input', () => {
      const query = normalize(search.value.trim());
      let shown = 0;
      chips.forEach((chip) => {
        const match = !query || normalize(`${chip.textContent} ${chip.dataset.aliases || ''}`).indexOf(query) !== -1;
        chip.parentElement.hidden = !match;
        if (match) shown += 1;
      });
      count.textContent = query ? `Showing ${shown} of ${chips.length} languages` : `Showing all ${chips.length} languages`;
      empty.hidden = shown > 0;
    });
  }

  /* ---------- Copy email ---------- */

  const copyBtn = $('#copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const label = $('span', copyBtn);
      const fallback = () => {
        const range = document.createRange();
        range.selectNodeContents($('#email-link'));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        label.textContent = 'Press Ctrl+C';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyBtn.dataset.copy).then(() => { label.textContent = 'Copied'; }, fallback);
      } else {
        fallback();
      }
      setTimeout(() => { label.textContent = 'Copy'; }, 2200);
    });
  }

  /* ---------- Quote form ---------- */

  const form = $('#quote');
  if (form) {
    const status = $('#form-status');
    const params = new URLSearchParams(location.search);
    if (params.get('into')) $('#f-into').value = params.get('into');
    if (params.get('into') && !$('#f-from').value) $('#f-from').value = 'English';

    form.setAttribute('novalidate', '');

    const rules = [
      { field: $('#f-from'), test: (v) => v.length > 0 },
      { field: $('#f-into'), test: (v) => v.length > 0 },
      { field: $('#f-name'), test: (v) => v.length > 0 },
      { field: $('#f-email'), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { field: $('#f-message'), test: (v) => v.length > 0 },
    ];

    const validate = (rule) => {
      const ok = rule.test(rule.field.value.trim());
      rule.field.setAttribute('aria-invalid', String(!ok));
      $(`#${rule.field.id}-error`).hidden = ok;
      return ok;
    };

    rules.forEach((rule) => {
      rule.field.addEventListener('blur', () => {
        if (rule.field.value.trim() || rule.field.getAttribute('aria-invalid') === 'true') validate(rule);
      });
      rule.field.addEventListener('input', () => {
        if (rule.field.getAttribute('aria-invalid') === 'true') validate(rule);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const failed = rules.filter((rule) => !validate(rule));
      if (failed.length) {
        failed[0].field.focus();
        status.className = 'form-status is-error';
        status.textContent = 'Please complete the highlighted fields.';
        return;
      }

      const data = new FormData(form);
      const get = (key) => String(data.get(key) || '').trim();
      const lines = [`Service: ${get('service')}`, `From: ${get('from')}`, `Into: ${get('into')}`, '', `Name: ${get('name')}`, `Email: ${get('email')}`];
      if (get('organization')) lines.push(`Organization: ${get('organization')}`);
      if (get('deadline')) lines.push(`Deadline: ${get('deadline')}`);
      lines.push('', get('message'));

      const subject = `Quote request: ${get('service')} (${get('from')} to ${get('into')})`;
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

      status.className = 'form-status is-success';
      status.textContent = `Your email app should now open with your request. If it doesn't, write to ${form.dataset.email}.`;
    });
  }

  /* ---------- Footer year ---------- */

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
