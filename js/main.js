(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* ---------- Languages by district ----------
     Main and minor languages follow the language table in Wikipedia's
     "List of districts of Manipur" (Kabui listed as Rongmei, Poula as Poumai). */

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

  const GROUPS = {
    valley: { label: 'Imphal valley', districts: ['Imphal West', 'Imphal East', 'Thoubal', 'Bishnupur', 'Kakching'] },
  };
  Object.keys(DISTRICTS).forEach((name) => {
    const id = name.toLowerCase().replace(/[^a-z]+/g, '-');
    if (!GROUPS[id] && !GROUPS.valley.districts.includes(name)) GROUPS[id] = { label: name, districts: [name] };
  });

  // Language → districts where it is a main or minor language
  const LANGUAGES = {};
  Object.entries(DISTRICTS).forEach(([district, { main, also }]) => {
    main.forEach((lang) => ((LANGUAGES[lang] ||= { main: [], also: [] }).main.push(district)));
    also.forEach((lang) => ((LANGUAGES[lang] ||= { main: [], also: [] }).also.push(district)));
  });

  const list = (items) => {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
  };
  const unique = (items) => [...new Set(items)];

  /* ---------- Navigation ---------- */

  const navToggle = $('.nav-toggle');
  const navLinks = $('#nav-links');

  const setMenu = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
  };

  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (navLinks.classList.contains('is-open') && !event.target.closest('.nav')) setMenu(false);
  });

  // Highlight the section in view
  const navAnchors = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((a) => {
            if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    navAnchors.forEach((a) => {
      const section = $(a.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
  }

  // Scroll progress
  const progressBar = $('.progress-bar');
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- Hero: rotating language card ---------- */

  const chips = $$('.chip');
  const languageNames = chips.map((chip) => chip.dataset.lang);

  const describe = (lang) => {
    if (lang === 'Meiteilon') return 'Official language of Manipur';
    const info = LANGUAGES[lang];
    if (!info) return 'Spoken by smaller communities across Manipur';
    if (info.main.length) return `Main language in ${list(info.main)}`;
    return `Spoken in ${list(info.also)}`;
  };

  const helloCard = $('.hello-card');
  const helloWord = $('#hello-word');
  const helloNative = $('#hello-native');
  const helloWhere = $('#hello-where');
  const helloCount = $('#hello-count');
  const helloToggle = $('#hello-toggle');

  if (helloCard && languageNames.length) {
    const order = languageNames.filter((name) => name !== 'Meiteilon');
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.unshift('Meiteilon');

    let index = 0;
    let timer = null;
    const pad = (n) => String(n).padStart(2, '0');

    const show = (i) => {
      const lang = order[i];
      helloWord.textContent = lang;
      helloNative.hidden = lang !== 'Meiteilon';
      helloWhere.textContent = describe(lang);
      helloCount.textContent = `${pad(i + 1)} / ${order.length}`;
    };

    const next = () => {
      helloCard.classList.add('is-changing');
      setTimeout(() => {
        index = (index + 1) % order.length;
        show(index);
        helloCard.classList.remove('is-changing');
      }, 350);
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(next, 2800);
      helloToggle.setAttribute('aria-pressed', 'false');
      $('.sr-only', helloToggle).textContent = 'Pause the language slideshow';
    };

    const pause = () => {
      clearInterval(timer);
      timer = null;
      helloToggle.setAttribute('aria-pressed', 'true');
      $('.sr-only', helloToggle).textContent = 'Play the language slideshow';
    };

    show(0);
    if (reduceMotion) pause();
    else play();

    helloToggle.addEventListener('click', () => (timer ? pause() : play()));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && timer) {
        clearInterval(timer);
        timer = 'hidden';
      } else if (!document.hidden && timer === 'hidden') {
        play();
      }
    });
  }

  /* ---------- Language map ---------- */

  const mapFrame = $('#map-frame');
  const map = $('#map');
  const districtPaths = $$('.district', map);
  const calloutButtons = $$('.callout-btn');
  const leaders = $$('.leader, .pin');
  const infoTitle = $('#map-info-title');
  const infoMain = $('#map-info-main');
  const infoAlso = $('#map-info-also');
  const infoCta = $('#map-info-cta');
  const infoClear = $('#map-info-clear');
  const intoField = $('#f-into');

  const defaultInfo = {
    title: infoTitle.textContent,
    main: infoMain.textContent,
  };

  let selection = null;

  const groupOf = (district) =>
    Object.keys(GROUPS).find((id) => GROUPS[id].districts.includes(district));

  const highlight = (districts) => {
    const active = new Set(districts);
    const activeGroups = new Set(districts.map(groupOf));
    const any = active.size > 0;
    map.classList.toggle('has-selection', any);
    mapFrame.classList.toggle('has-selection', any);
    districtPaths.forEach((path) => path.classList.toggle('is-active', active.has(path.dataset.district)));
    leaders.forEach((el) => el.classList.toggle('is-active', activeGroups.has(el.dataset.group)));
    calloutButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(activeGroups.has(btn.dataset.group))));
  };

  const setInfo = ({ title, main, also, lang }) => {
    infoTitle.textContent = title;
    infoMain.innerHTML = main;
    infoAlso.hidden = !also;
    infoAlso.innerHTML = also || '';
    infoCta.hidden = !lang;
    if (lang) {
      infoCta.textContent = `Get a quote in ${lang}`;
      infoCta.dataset.lang = lang;
    }
    infoClear.hidden = !selection;
  };

  const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const strongList = (items) => list(items.map((item) => `<strong>${escapeHtml(item)}</strong>`));

  const showGroup = (groupId) => {
    const group = GROUPS[groupId];
    const main = unique(group.districts.flatMap((d) => DISTRICTS[d].main));
    const also = unique(group.districts.flatMap((d) => DISTRICTS[d].also)).filter((l) => !main.includes(l));
    highlight(group.districts);
    setInfo({
      title: group.districts.length > 1 ? `${group.label}` : `${group.label} district`,
      main: `Main languages: ${strongList(main)}.`,
      also: also.length ? `Also spoken: ${list(also)}.` : '',
      lang: main.length === 1 ? main[0] : null,
    });
  };

  const showDistrict = (district) => {
    const { main, also } = DISTRICTS[district];
    highlight([district]);
    setInfo({
      title: `${district} district`,
      main: `Main languages: ${strongList(main)}.`,
      also: also.length ? `Also spoken: ${list(also)}.` : '',
      lang: main.length === 1 ? main[0] : null,
    });
  };

  const showLanguage = (lang) => {
    const info = LANGUAGES[lang];
    if (!info) {
      highlight([]);
      setInfo({
        title: lang,
        main: `${escapeHtml(lang)} is spoken by smaller communities across Manipur. Tell us where your audience is and we'll match the right linguist.`,
        lang,
      });
      return;
    }
    highlight([...info.main, ...info.also]);
    const label = lang === 'Meiteilon' ? 'Meiteilon (Manipuri)' : lang;
    setInfo({
      title: label,
      main: info.main.length ? `Main language in ${strongList(info.main)}.` : `Spoken in ${strongList(info.also)}.`,
      also: info.main.length && info.also.length ? `Also spoken in ${list(info.also)}.` : '',
      lang,
    });
  };

  const render = () => {
    if (!selection) {
      highlight([]);
      infoTitle.textContent = defaultInfo.title;
      infoMain.textContent = defaultInfo.main;
      infoAlso.hidden = true;
      infoCta.hidden = true;
      infoClear.hidden = true;
      return;
    }
    if (selection.type === 'group') showGroup(selection.id);
    if (selection.type === 'district') showDistrict(selection.id);
    if (selection.type === 'language') showLanguage(selection.id);
  };

  const select = (next) => {
    const same = selection && next && selection.type === next.type && selection.id === next.id;
    selection = same ? null : next;
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(!!selection && selection.type === 'language' && selection.id === chip.dataset.lang)));
    render();
  };

  districtPaths.forEach((path) => {
    const name = path.dataset.district;
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = name;
    path.appendChild(title);
    path.addEventListener('click', () => select({ type: 'district', id: name }));
    path.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && !selection) showDistrict(name);
    });
    path.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse' && !selection) render();
    });
  });

  calloutButtons.forEach((btn) => {
    btn.addEventListener('click', () => select({ type: 'group', id: btn.dataset.group }));
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      select({ type: 'language', id: chip.dataset.lang });
      if (selection && window.matchMedia('(max-width: 860px)').matches) {
        $('#map-info').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  });

  infoClear.addEventListener('click', () => select(null));

  infoCta.addEventListener('click', () => {
    if (intoField && infoCta.dataset.lang) {
      intoField.value = infoCta.dataset.lang;
      intoField.removeAttribute('aria-invalid');
      $('#f-into-error').hidden = true;
    }
  });

  /* ---------- Language search ---------- */

  const search = $('#lang-search');
  const count = $('#lang-count');
  const empty = $('#lang-empty');
  const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  search.addEventListener('input', () => {
    const query = normalize(search.value.trim());
    let shown = 0;
    chips.forEach((chip) => {
      const haystack = normalize(`${chip.textContent} ${chip.dataset.aliases || ''}`);
      const match = !query || haystack.includes(query);
      chip.parentElement.hidden = !match;
      if (match) shown += 1;
    });
    count.textContent = query
      ? `Showing ${shown} of ${chips.length} languages`
      : `Showing all ${chips.length} languages`;
    empty.hidden = shown > 0;
  });

  /* ---------- Reveal on scroll ---------- */

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- Copy email ---------- */

  const copyBtn = $('#copy-email');
  copyBtn.addEventListener('click', async () => {
    const label = $('span', copyBtn);
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.copy);
      label.textContent = 'Copied';
    } catch {
      label.textContent = 'Press Ctrl+C';
      const range = document.createRange();
      range.selectNodeContents($('#email-link'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setTimeout(() => (label.textContent = 'Copy'), 2200);
  });

  /* ---------- Quote form ---------- */

  const form = $('#quote-form');
  const status = $('#form-status');
  const datalist = $('#lang-options');

  ['English', 'Hindi', ...languageNames].forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });

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
      status.classList.remove('is-success');
      status.textContent = 'Please complete the highlighted fields.';
      return;
    }

    const data = new FormData(form);
    const get = (key) => String(data.get(key) || '').trim();
    const lines = [
      `Service: ${get('service')}`,
      `From: ${get('from')}`,
      `Into: ${get('into')}`,
      '',
      `Name: ${get('name')}`,
      `Email: ${get('email')}`,
    ];
    if (get('organization')) lines.push(`Organization: ${get('organization')}`);
    if (get('deadline')) lines.push(`Deadline: ${get('deadline')}`);
    lines.push('', get('message'));

    const subject = `Quote request: ${get('service')} (${get('from')} → ${get('into')})`;
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

    status.classList.add('is-success');
    status.textContent = `Your email app should now open with your request. If it doesn't, write to ${form.dataset.email}.`;
  });

  /* ---------- Footer year ---------- */

  $('#year').textContent = new Date().getFullYear();
})();
