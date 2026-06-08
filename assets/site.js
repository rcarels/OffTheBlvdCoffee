const businessEmail = 'hello@offtheblvdcoffee.com';

const hardcodedFallback = {
  events: [
    {title:'Local Farmers Market',date:'2025-05-24',time:'9AM - 2PM',area:'The Inland Empire',type:'Public Event',details:'Exact location placeholder'},
    {title:'Community Market',date:'2025-06-07',time:'8AM - 12PM',area:'The Greater Los Angeles Area',type:'Public Event',details:'Exact location placeholder'},
    {title:'Private Event',date:'2025-06-14',time:'10AM - 2PM',area:'The Greater Los Angeles Area',type:'Private Booking',details:'Private booking'},
    {title:'Add Your Next Event',date:'2025-06-28',time:'TBD',area:'The Inland Empire',type:'Public Event',details:'Placeholder event'}
  ],
  aboutHtml: document.getElementById('aboutText') ? document.getElementById('aboutText').innerHTML : null,
  menuHtml: document.getElementById('menuGrid') ? document.getElementById('menuGrid').innerHTML : null,
  galleryHtml: document.getElementById('galleryGrid') ? document.getElementById('galleryGrid').innerHTML : null,
  reviewsHtml: document.getElementById('reviewsGrid') ? document.getElementById('reviewsGrid').innerHTML : null
};

let events = hardcodedFallback.events;
const fmt = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric'});

function svgIcon(){
  return '<svg class="icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></svg>';
}

function makeSvgNode(){
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgIcon();
  return wrapper.firstElementChild;
}

function safeText(str){
  return (str === undefined || str === null) ? '' : String(str);
}

function cacheBusted(url){
  return url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(String(Date.now()));
}

async function fetchJSON(url){
  const res = await fetch(cacheBusted(url), {cache:'no-store'});
  if(!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function renderEvents(){
  const searchEl = document.getElementById('eventSearch');
  const filterEl = document.getElementById('eventFilter');
  const grid = document.getElementById('eventsGrid');
  const emptyEl = document.getElementById('emptyEvents');
  if(!searchEl || !filterEl || !grid || !emptyEl) return;

  const q = searchEl.value.toLowerCase();
  const f = filterEl.value;
  grid.innerHTML = '';
  let shown = 0;

  events
    .filter(e => (f === 'all' || e.type === f) && JSON.stringify(e).toLowerCase().includes(q))
    .forEach(e => {
      shown++;

      const card = document.createElement('article');
      card.className = 'event-card';
      card.appendChild(makeSvgNode());

      const content = document.createElement('div');

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${fmt.format(new Date(e.date + 'T12:00:00'))} · ${e.time}`;

      const h3 = document.createElement('h3');
      h3.textContent = e.title;

      const p = document.createElement('p');
      p.textContent = e.area;

      const badge = document.createElement('span');
      badge.className = `badge ${e.type.includes('Private') ? 'private' : ''}`;
      badge.textContent = e.type;

      content.appendChild(meta);
      content.appendChild(h3);
      content.appendChild(p);
      content.appendChild(badge);
      card.appendChild(content);
      grid.appendChild(card);
    });

  emptyEl.style.display = shown ? 'none' : 'block';
}

function renderAbout(data){
  const aboutText = document.getElementById('aboutText');
  if(!aboutText) return;

  const about = data && data.about ? data.about : null;

  if(!about){
    aboutText.innerHTML = hardcodedFallback.aboutHtml ?? aboutText.innerHTML;
    return;
  }

  const heading = safeText(about.heading);
  const mainParagraph = safeText(about.main_paragraph);
  const storyParagraph = safeText(about.story_paragraph);
  const serviceAreaText = safeText(about.service_area_text);

  if(!heading || !mainParagraph){
    aboutText.innerHTML = hardcodedFallback.aboutHtml ?? aboutText.innerHTML;
    return;
  }

  aboutText.replaceChildren();

  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'About';

  const title = document.createElement('h2');
  title.className = 'title';
  title.textContent = heading;

  const mainP = document.createElement('p');
  mainP.className = 'section-copy';
  mainP.textContent = mainParagraph;

  aboutText.appendChild(eyebrow);
  aboutText.appendChild(title);
  aboutText.appendChild(mainP);

  if(storyParagraph){
    const storyP = document.createElement('p');
    storyP.className = 'section-copy';
    storyP.textContent = storyParagraph;
    aboutText.appendChild(storyP);
  }

  if(serviceAreaText){
    const areaP = document.createElement('p');
    areaP.className = 'section-copy';
    areaP.textContent = serviceAreaText;
    aboutText.appendChild(areaP);
  }

  const btn = document.createElement('a');
  btn.className = 'btn';
  btn.href = '#quote';
  btn.textContent = 'Book the Cart →';

  aboutText.appendChild(btn);
}

function renderMenu(data){
  const menuGrid = document.getElementById('menuGrid');
  if(!menuGrid) return;

  const items = data && Array.isArray(data.menu_items) ? data.menu_items : [];

  if(items.length === 0){
    menuGrid.innerHTML = hardcodedFallback.menuHtml ?? menuGrid.innerHTML;
    return;
  }

  const grouped = {};

  items.forEach(item => {
    const category = safeText(item.category);
    if(!category) return;
    if(!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  });

  menuGrid.innerHTML = '';

  Object.keys(grouped).forEach(category => {
    const card = document.createElement('div');
    card.className = 'menu-card';

    const h3 = document.createElement('h3');
    h3.textContent = category;
    card.appendChild(h3);

    grouped[category].forEach(item => {
      const itemName = safeText(item.item_name);
      const price = safeText(item.price);
      const description = safeText(item.description);
      if(!itemName) return;

      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';

      const left = document.createElement('div');
      left.textContent = itemName;

      if(description){
        const small = document.createElement('small');
        small.textContent = description;
        left.appendChild(small);
      }

      const span = document.createElement('span');
      span.className = 'price';
      span.textContent = price || '';

      menuItem.appendChild(left);
      menuItem.appendChild(span);
      card.appendChild(menuItem);
    });

    if(card.querySelectorAll('.menu-item').length) {
      menuGrid.appendChild(card);
    }
  });

  if(menuGrid.children.length === 0){
    menuGrid.innerHTML = hardcodedFallback.menuHtml ?? menuGrid.innerHTML;
  }
}

function renderGallery(data){
  const galleryGrid = document.getElementById('galleryGrid');
  if(!galleryGrid) return;

  const images = data && Array.isArray(data.images) ? data.images : [];

  if(images.length === 0){
    galleryGrid.innerHTML = hardcodedFallback.galleryHtml ?? galleryGrid.innerHTML;
    return;
  }

  galleryGrid.innerHTML = '';

  images.slice(0, 5).forEach((image, index) => {
    const imageUrl = safeText(image.image_url);
    const altText = safeText(image.alt_text) || 'Off The Blvd Coffee gallery photo';
    if(!imageUrl) return;

    const img = document.createElement('img');
    if(index === 0) img.className = 'big';
    img.src = imageUrl;
    img.alt = altText;
    galleryGrid.appendChild(img);
  });

  while(galleryGrid.children.length < 5){
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';

    const inner = document.createElement('div');

    const bold = document.createElement('b');
    bold.textContent = 'Photo Placeholder';

    const text = document.createTextNode('More photos coming soon');

    inner.appendChild(bold);
    inner.appendChild(text);
    placeholder.appendChild(inner);
    galleryGrid.appendChild(placeholder);
  }

  if(galleryGrid.children.length === 0){
    galleryGrid.innerHTML = hardcodedFallback.galleryHtml ?? galleryGrid.innerHTML;
  }
}

function renderReviews(data){
  const reviewsGrid = document.getElementById('reviewsGrid');
  if(!reviewsGrid) return;

  const reviews = data && Array.isArray(data.reviews) ? data.reviews : [];

  if(reviews.length === 0){
    reviewsGrid.innerHTML = hardcodedFallback.reviewsHtml ?? reviewsGrid.innerHTML;
    return;
  }

  reviewsGrid.innerHTML = '';

  reviews.slice(0, 6).forEach(review => {
    const rating = Math.max(1, Math.min(5, Number(review.rating || 5)));

    const card = document.createElement('div');
    card.className = 'review-card';

    const stars = document.createElement('div');
    stars.className = 'stars';
    stars.textContent = '★'.repeat(rating);

    const quote = document.createElement('blockquote');
    quote.textContent = safeText(review.review_text);

    const name = document.createElement('p');
    name.className = 'review-name';
    name.textContent = safeText(review.customer_name);

    card.appendChild(stars);
    card.appendChild(quote);
    card.appendChild(name);

    if(review.event_type){
      const eventType = document.createElement('p');
      eventType.textContent = safeText(review.event_type);
      card.appendChild(eventType);
    }

    reviewsGrid.appendChild(card);
  });
}

async function initFromCMS(){
  try{
    const eventsData = await fetchJSON('/api/events');

    if(eventsData && Array.isArray(eventsData.events)){
      events = eventsData.events.map(event => ({
        title: event.title || '',
        date: event.event_date || '',
        time: 'TBD',
        area: event.location || '',
        type: 'Public Event',
        details: event.description || ''
      }));
    }
  }catch(e){
    // Keep fallback events.
  }

  renderEvents();

  try{
    const aboutData = await fetchJSON('/api/about');
    if(aboutData) renderAbout(aboutData);
  }catch(e){
    if(hardcodedFallback.aboutHtml !== null) {
      document.getElementById('aboutText').innerHTML = hardcodedFallback.aboutHtml;
    }
  }

  try{
    const menuData = await fetchJSON('/api/menu');
    if(menuData) renderMenu(menuData);
  }catch(e){
    if(hardcodedFallback.menuHtml !== null) {
      document.getElementById('menuGrid').innerHTML = hardcodedFallback.menuHtml;
    }
  }

  try{
    const galleryData = await fetchJSON('/api/gallery');
    if(galleryData) renderGallery(galleryData);
  }catch(e){
    if(hardcodedFallback.galleryHtml !== null) {
      document.getElementById('galleryGrid').innerHTML = hardcodedFallback.galleryHtml;
    }
  }

  try{
    const reviewsData = await fetchJSON('/api/reviews');
    if(reviewsData) renderReviews(reviewsData);
  }catch(e){
    if(hardcodedFallback.reviewsHtml !== null) {
      document.getElementById('reviewsGrid').innerHTML = hardcodedFallback.reviewsHtml;
    }
  }
}

function initNavigation(){
  const searchEl = document.getElementById('eventSearch');
  const filterEl = document.getElementById('eventFilter');
  const hambEl = document.getElementById('hamb');
  const linksEl = document.getElementById('links');
  const yearEl = document.getElementById('year');

  if(searchEl) searchEl.addEventListener('input', renderEvents);
  if(filterEl) filterEl.addEventListener('change', renderEvents);

  if(hambEl && linksEl){
    hambEl.addEventListener('click', () => {
      const isOpen = linksEl.classList.toggle('open');
      hambEl.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if(yearEl) yearEl.textContent = new Date().getFullYear();
}

function initQuoteForm(){
  const form = document.getElementById('quoteForm');
  if(!form) return;

  const successEl = document.getElementById('quoteSuccess');
  let lockedUntil = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const now = Date.now();
    if(now < lockedUntil) return;
    lockedUntil = now + 8000;

    const formData = new FormData(form);

    try{
      const res = await fetch('/api/quote', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if(!res.ok) throw new Error('Request failed: ' + res.status);

      window.location.href = '/thank-you.html';
    }catch(err){
      if(successEl){
        successEl.style.display = 'block';
        successEl.textContent = 'Sorry—something went wrong submitting your request. Please try again.';
      }

      lockedUntil = Date.now();
    }
  });
}

renderEvents();
initNavigation();
initFromCMS();
initQuoteForm();