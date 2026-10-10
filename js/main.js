(() => {
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */

  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Header shadow on scroll ---------- */

  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Typewriter headline ---------- */

  const typed = document.querySelector('.typed');

  if (typed && !reduceMotion) {
    const words = JSON.parse(typed.dataset.words);
    let index = 0;
    let length = words[0].length;
    let deleting = true;

    const tick = () => {
      const word = words[index];

      if (deleting) {
        length -= 1;
        typed.textContent = word.slice(0, length);
        if (length === 0) {
          deleting = false;
          index = (index + 1) % words.length;
          setTimeout(tick, 350);
        } else {
          setTimeout(tick, 45);
        }
        return;
      }

      length += 1;
      typed.textContent = word.slice(0, length);
      if (length === word.length) {
        deleting = true;
        setTimeout(tick, 2200);
      } else {
        setTimeout(tick, 95);
      }
    };

    setTimeout(tick, 2400);
  }

  /* ---------- Reveal on scroll ---------- */

  const revealItems = document.querySelectorAll('.reveal');

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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- Quote form → email ---------- */

  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const get = (key) => String(data.get(key) || '').trim();

    const lines = [
      `Name: ${get('name')}`,
      `Email: ${get('email')}`,
    ];
    if (get('organization')) lines.push(`Organization: ${get('organization')}`);
    lines.push(`Service: ${get('service')}`, `Languages: ${get('languages')}`);
    if (get('deadline')) lines.push(`Deadline: ${get('deadline')}`);
    lines.push('', get('message'));

    const subject = `Quote request: ${get('service')} (${get('name')})`;
    const email = form.dataset.email;

    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

    status.textContent = `Your email app should open with the request. If it doesn't, write to us at ${email}.`;
  });

  /* ---------- Footer year ---------- */

  document.getElementById('year').textContent = new Date().getFullYear();
})();
