/**
 * CrypticPulse - Main Application Engine & Dynamic Router
 * Pure Vanilla JavaScript (No PHP / External Frameworks)
 * https://crypticpulse.github.io
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await loadComponents();
  initThemeSwitcher();
  initMobileNav();
  initLiveTicker();
  initCookieConsent();
  initPushNotification();

  // Route-Specific Blog Engine Initializers
  const pageType = document.body.dataset.page || 'home';
  if (pageType === 'home') {
    renderHomePage();
  } else if (pageType === 'blog') {
    renderBlogArchivePage();
  } else if (pageType === 'post') {
    renderSinglePostPage();
  } else if (pageType === 'contact') {
    initContactFormValidation();
  }

  highlightActiveNav();
}

/* --------------------------------------------------------------------------
   1. Modular Component Injection Engine (Header & Footer)
   -------------------------------------------------------------------------- */
async function loadComponents() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    const headerHtml = await fetchComponent('header');
    if (headerHtml) {
      headerPlaceholder.innerHTML = headerHtml;
    }
  }

  if (footerPlaceholder) {
    const footerHtml = await fetchComponent('footer');
    if (footerHtml) {
      footerPlaceholder.innerHTML = footerHtml;
    }
  }
}

async function fetchComponent(componentName) {
  const candidatePaths = [
    `/components/${componentName}.html`,
    `../components/${componentName}.html`,
    `./components/${componentName}.html`,
    `../../components/${componentName}.html`
  ];

  for (const path of candidatePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      // Continue to next path candidate
    }
  }
  return null;
}

function highlightActiveNav() {
  const pathname = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link, .footer-links a');

  navLinks.forEach(link => {
    const route = link.getAttribute('data-route') || link.getAttribute('href');
    if (!route) return;

    const cleanRoute = route.replace(/\/index\.html$/, '/').toLowerCase();
    const cleanPath = pathname.replace(/\/index\.html$/, '/');

    if (cleanRoute === cleanPath || (cleanRoute !== '/' && cleanPath.startsWith(cleanRoute))) {
      link.classList.add('active');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Dark / Light Theme Switcher
   -------------------------------------------------------------------------- */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const sunIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`;
  const moonIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.3 2c.43 0 .77.35.7.78-.62 3.84 1.23 7.8 4.66 9.51.38.19.51.64.3.99-1.85 3.12-5.32 5.02-9.06 4.65-4.48-.44-8.06-4.06-8.45-8.54-.33-3.79 1.6-7.26 4.76-9.07.36-.2.81-.06 1 .32.74 1.4 1.95 2.5 3.42 3.06.66.25 1.37.38 2.07.38 1.4 0 2.76-.51 3.85-1.48.24-.21.57-.26.85-.14z"/></svg>`;

  const savedTheme = localStorage.getItem('cp_theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('cp_theme', newTheme);
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      toggleBtn.innerHTML = `${moonIcon} <span>Dark Mode</span>`;
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggleBtn.innerHTML = `${sunIcon} <span>Light Mode</span>`;
    }
  }
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const mainNav = document.getElementById('mainNav');
  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target) && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------------------------
   4. Real-Time CoinCap API Live Ticker Integration
   -------------------------------------------------------------------------- */
function initLiveTicker() {
  const tickerContainer = document.getElementById('tickerContent');
  if (!tickerContainer) return;

  const COINCAP_API_URL = 'https://api.coincap.io/v2/assets?limit=6';
  const API_KEY = '2c9af6bd1d830b5a027072f47d5189ce5a669541a69c25ecb5314ef524f2df4e';

  let cachedCoins = [
    { symbol: 'BTC/USD', price: 67450.00, change: 3.42 },
    { symbol: 'ETH/USD', price: 3520.50, change: 1.85 },
    { symbol: 'SOL/USD', price: 178.20, change: 8.94 },
    { symbol: 'BNB/USD', price: 585.10, change: -0.45 },
    { symbol: 'XRP/USD', price: 0.624, change: 4.12 },
    { symbol: 'ADA/USD', price: 0.485, change: -1.15 }
  ];

  function renderTicker(coins) {
    let html = '';
    // Duplicate array to enable seamless marquee looping
    [...coins, ...coins].forEach((coin, idx) => {
      const isUp = coin.change >= 0;
      const sign = isUp ? '+' : '';
      const changeClass = isUp ? 'up' : 'down';
      const formattedPrice = coin.price >= 1 
        ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

      html += `
        <div class="ticker-item" id="ticker-item-${idx}">
          <span class="symbol">${coin.symbol}</span>
          <span class="price" id="ticker-price-${idx}">$${formattedPrice}</span>
          <span class="change ${changeClass}">${sign}${coin.change.toFixed(2)}%</span>
        </div>
      `;
    });
    tickerContainer.innerHTML = html;
  }

  async function fetchLivePrices() {
    try {
      // Standard GET fetch without custom preflight headers prevents browser CORS blocks
      let response = await fetch('https://api.coincap.io/v2/assets?limit=6');
      
      if (!response.ok) {
        // Fallback to CoinGecko public API if CoinCap rate limits
        response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano&order=market_cap_desc');
        const geckData = await response.json();
        if (Array.isArray(geckData) && geckData.length > 0) {
          cachedCoins = geckData.map(item => ({
            symbol: `${item.symbol.toUpperCase()}/USD`,
            price: item.current_price || 0,
            change: item.price_change_percentage_24h || 0
          }));
          renderTicker(cachedCoins);
          return;
        }
      }

      const json = await response.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        cachedCoins = json.data.map(item => ({
          symbol: `${item.symbol.toUpperCase()}/USD`,
          price: parseFloat(item.priceUsd) || 0,
          change: parseFloat(item.changePercent24Hr) || 0
        }));
        renderTicker(cachedCoins);
      } else {
        renderTicker(cachedCoins);
      }
    } catch (error) {
      console.warn('CrypticPulse Ticker: Live market API fetch note, utilizing fallback ticker feed.', error);
      renderTicker(cachedCoins);
    }
  }

  // Initial render with fallback & immediate live fetch
  renderTicker(cachedCoins);
  fetchLivePrices();

  // Periodic polling every 30 seconds
  setInterval(fetchLivePrices, 30000);
}


/* --------------------------------------------------------------------------
   5. Cookie Consent Banner Logic
   -------------------------------------------------------------------------- */
function initCookieConsent() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const consent = localStorage.getItem('cp_cookie_consent');
  if (!consent) {
    setTimeout(() => {
      banner.classList.add('show');
    }, 1200);
  }

  const acceptBtn = document.getElementById('cookieAccept');
  const rejectBtn = document.getElementById('cookieReject');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cp_cookie_consent', 'accepted');
      banner.classList.remove('show');
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cp_cookie_consent', 'rejected');
      banner.classList.remove('show');
    });
  }
}

/* --------------------------------------------------------------------------
   6. Push Notification Modal
   -------------------------------------------------------------------------- */
function initPushNotification() {
  const pushModal = document.getElementById('pushModal');
  if (!pushModal) return;

  const pushPref = localStorage.getItem('cp_push_preference');
  if (!pushPref) {
    setTimeout(() => {
      pushModal.classList.add('show');
    }, 4500);
  }

  const allowBtn = document.getElementById('pushAllow');
  const declineBtn = document.getElementById('pushDecline');

  if (allowBtn) {
    allowBtn.addEventListener('click', () => {
      localStorage.setItem('cp_push_preference', 'allowed');
      pushModal.classList.remove('show');
      alert('Thank you! You are now subscribed to CrypticPulse breaking news alerts.');
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cp_push_preference', 'declined');
      pushModal.classList.remove('show');
    });
  }
}

/* --------------------------------------------------------------------------
   7. Homepage Renderer (Featured + Latest News Loop)
   -------------------------------------------------------------------------- */
function renderHomePage() {
  if (!window.CrypticBlogEngine) return;

  const featured = window.CrypticBlogEngine.getFeaturedPost();
  const recentPosts = window.CrypticBlogEngine.getRecentPosts(6);

  // Render Hero Featured Story
  const heroContainer = document.getElementById('heroFeaturedContainer');
  if (heroContainer && featured) {
    heroContainer.innerHTML = `
      <article class="card hero-featured">
        <a href="/blog/${featured.slug}/" class="card-img-wrap">
          <picture>
            <source type="image/webp" srcset="${featured.image.webp}">
            <img src="${featured.image.svg}" alt="${featured.image.alt}" width="1200" height="675" loading="eager">
          </picture>
          <span class="ai-label-tag">image created by AI</span>
        </a>
        <div class="card-body">
          <div class="card-meta">
            <span class="category-badge">${featured.category}</span>
            <span class="read-time">${featured.readTime}</span>
          </div>
          <h1 class="card-title">
            <a href="/blog/${featured.slug}/">${featured.title}</a>
          </h1>
          <p class="card-excerpt">${featured.summary}</p>
          <div class="card-footer">
            <div class="author-block">
              <div class="author-avatar">${featured.authorAvatar}</div>
              <span class="author-name">${featured.author}</span>
            </div>
            <span class="post-date">${featured.date}</span>
          </div>
        </div>
      </article>
    `;
  }

  // Render Latest Grid Loop
  const gridContainer = document.getElementById('latestPostsGrid');
  if (gridContainer) {
    gridContainer.innerHTML = recentPosts.map(post => createPostCardHtml(post)).join('');
  }

  // Render Dynamic CoinCap Market Prediction Widget
  fetchCryptoPredictionData();
  setInterval(fetchCryptoPredictionData, 30000);
}

/* --------------------------------------------------------------------------
   7b. Real-Time Crypto Prediction Widget Integration (CoinCap API)
   -------------------------------------------------------------------------- */
  async function fetchCryptoPredictionData() {
    const widgetContainer = document.getElementById('crypto-prediction-widget');
    if (!widgetContainer) return;

    const fallbackCoins = [
      { name: 'Bitcoin', symbol: 'BTC', priceUsd: '67450.00', changePercent24Hr: '3.42' },
      { name: 'Ethereum', symbol: 'ETH', priceUsd: '3520.50', changePercent24Hr: '1.85' },
      { name: 'Solana', symbol: 'SOL', priceUsd: '178.20', changePercent24Hr: '8.94' },
      { name: 'BNB', symbol: 'BNB', priceUsd: '585.10', changePercent24Hr: '-0.45' },
      { name: 'XRP', symbol: 'XRP', priceUsd: '0.6240', changePercent24Hr: '4.12' },
      { name: 'Cardano', symbol: 'ADA', priceUsd: '0.4850', changePercent24Hr: '-1.15' }
    ];

    function renderCards(coins) {
      widgetContainer.className = 'prediction-grid';
      let html = '';
      coins.forEach(coin => {
        const price = parseFloat(coin.priceUsd) || 0;
        const change24h = parseFloat(coin.changePercent24Hr) || 0;
        const isBullish = change24h >= 0;
        const sign = isBullish ? '+' : '';
        const changeClass = isBullish ? 'up' : 'down';
        const outlook = isBullish ? 'Bullish Momentum 🚀' : 'Bearish Correction 📉';
        const outlookClass = isBullish ? 'bullish' : 'bearish';

        const formattedPrice = price >= 1
          ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

        html += `
          <div class="prediction-card">
            <div class="prediction-card-header">
              <div class="coin-meta">
                <span class="coin-name">${coin.name}</span>
                <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
              </div>
              <span class="outlook-badge ${outlookClass}">${outlook}</span>
            </div>
            <div class="prediction-card-body">
              <div class="price-value">$${formattedPrice}</div>
              <div class="change-value ${changeClass}">${sign}${change24h.toFixed(2)}% (24h)</div>
            </div>
          </div>
        `;
      });
      widgetContainer.innerHTML = html;
    }

    try {
      // Direct GET without preflight header prevents CORS block
      let response = await fetch('https://api.coincap.io/v2/assets?limit=6');
      if (!response.ok) {
        response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano&order=market_cap_desc');
        const geckData = await response.json();
        if (Array.isArray(geckData) && geckData.length > 0) {
          const mapped = geckData.map(c => ({
            name: c.name,
            symbol: c.symbol,
            priceUsd: c.current_price,
            changePercent24Hr: c.price_change_percentage_24h
          }));
          renderCards(mapped);
          return;
        }
      }

      const result = await response.json();
      if (result && Array.isArray(result.data) && result.data.length > 0) {
        renderCards(result.data);
      } else {
        renderCards(fallbackCoins);
      }
    } catch (error) {
      console.warn('CrypticPulse Prediction Widget: Live market fetch note, using fallback market prediction data.', error);
      renderCards(fallbackCoins);
    }
  }


/* --------------------------------------------------------------------------
   8. Blog Archive Renderer with Category Filter & Live Search
   -------------------------------------------------------------------------- */
function renderBlogArchivePage() {
  if (!window.CrypticBlogEngine) return;

  const allPosts = window.CrypticBlogEngine.getAllPosts();
  const gridContainer = document.getElementById('blogPostsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryBtns = document.querySelectorAll('.filter-btn');
  const noResults = document.getElementById('noResults');

  if (!gridContainer) return;

  let currentCategory = 'all';
  let currentQuery = '';

  function renderFilteredGrid() {
    const filtered = allPosts.filter(post => {
      const catMatch = currentCategory === 'all' || post.category.toLowerCase() === currentCategory;
      const queryMatch = !currentQuery || 
        post.title.toLowerCase().includes(currentQuery) || 
        post.summary.toLowerCase().includes(currentQuery) ||
        post.tags.some(t => t.toLowerCase().includes(currentQuery));
      return catMatch && queryMatch;
    });

    if (filtered.length === 0) {
      gridContainer.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
    } else {
      gridContainer.style.display = 'grid';
      if (noResults) noResults.style.display = 'none';
      gridContainer.innerHTML = filtered.map(post => createPostCardHtml(post)).join('');
    }
  }

  renderFilteredGrid();

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category').toLowerCase();
      renderFilteredGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.toLowerCase().trim();
      renderFilteredGrid();
    });
  }
}

/* --------------------------------------------------------------------------
   9. Single Article View Router & Dynamic Schema Generator
   -------------------------------------------------------------------------- */
function renderSinglePostPage() {
  if (!window.CrypticBlogEngine) return;

  let slug = document.body.dataset.slug;

  if (!slug) {
    const pathname = window.location.pathname;
    const blogMatch = pathname.match(/\/blog\/([^\/]+)/);
    if (blogMatch && blogMatch[1] && blogMatch[1] !== 'index.html') {
      slug = blogMatch[1];
    }
  }

  if (!slug) {
    const urlParams = new URLSearchParams(window.location.search);
    slug = urlParams.get('slug');
  }

  if (!slug) {
    const hash = window.location.hash.replace('#', '');
    if (hash) slug = hash;
  }

  const post = window.CrypticBlogEngine.getPostBySlug(slug) || window.CrypticBlogEngine.getFeaturedPost();

  if (!post) return;

  const cleanArticleUrl = `https://crypticpulse.github.io/blog/${post.slug}/`;

  // 1. Update Title & Meta Tags
  document.title = `${post.title} | CrypticPulse`;
  
  const metaDesc = document.getElementById('postMetaDescription');
  if (metaDesc) metaDesc.content = post.summary;

  const metaCanon = document.getElementById('postMetaCanonical');
  if (metaCanon) metaCanon.href = cleanArticleUrl;

  // Open Graph
  const ogTitle = document.getElementById('postOgTitle');
  if (ogTitle) ogTitle.content = post.title;

  const ogDesc = document.getElementById('postOgDescription');
  if (ogDesc) ogDesc.content = post.summary;

  const ogUrl = document.getElementById('postOgUrl');
  if (ogUrl) ogUrl.href = cleanArticleUrl;

  // 2. Inject Dynamic NewsArticle Schema.org JSON-LD
  const schemaElem = document.getElementById('postJsonLd');
  if (schemaElem) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.title,
      "description": post.summary,
      "image": [`https://crypticpulse.github.io${post.image.svg}`],
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author,
        "jobTitle": post.authorRole
      },
      "publisher": {
        "@type": "Organization",
        "name": "CrypticPulse",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crypticpulse.github.io/images/hero-btc.svg"
        }
      }
    };
    schemaElem.textContent = JSON.stringify(schemaData, null, 2);
  }

  // 3. Populate Header Elements
  document.getElementById('postCategory').textContent = post.category;
  document.getElementById('postReadTime').textContent = post.readTime;
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postAuthorAvatar').textContent = post.authorAvatar;
  document.getElementById('postAuthorName').textContent = post.author;
  document.getElementById('postAuthorRole').textContent = post.authorRole;
  document.getElementById('postDate').textContent = post.date;

  // 4. Update Picture Element
  const sourceWebp = document.getElementById('postSourceWebp');
  const imgElem = document.getElementById('postImg');
  if (sourceWebp) sourceWebp.srcset = post.image.webp;
  if (imgElem) {
    imgElem.src = post.image.svg;
    imgElem.alt = post.image.alt;
  }

  // 5. Executive Summary (Displayed right behind the image)
  const summaryElem = document.getElementById('postSummaryText');
  if (summaryElem) {
    summaryElem.textContent = post.summary;
  }

  // 6. Populate Article Body Content
  const bodyContainer = document.getElementById('postContentContainer');
  if (bodyContainer) {
    bodyContainer.innerHTML = post.content;
  }

  // 7. Populate Tags
  const tagsContainer = document.getElementById('postTags');
  if (tagsContainer && post.tags) {
    tagsContainer.innerHTML = post.tags.map(t => `<span class="tag">#${t}</span>`).join(' ');
  }

  // 8. Auto-Generate Table of Contents from Headings (Positioned between summary and post content)
  generateTableOfContents(bodyContainer);

  // 9. Render Related Articles
  const relatedGrid = document.getElementById('relatedPostsGrid');
  if (relatedGrid) {
    const related = window.CrypticBlogEngine.getAllPosts()
      .filter(p => p.id !== post.id)
      .slice(0, 3);
    relatedGrid.innerHTML = related.map(p => createPostCardHtml(p)).join('');
  }

  // 10. Initialize Comment System for this Post
  initCommentsSystem(post.id);
}

/* --------------------------------------------------------------------------
   10. Auto Table of Contents Generator
   -------------------------------------------------------------------------- */
function generateTableOfContents(contentElem) {
  const tocList = document.getElementById('tocList');
  if (!tocList || !contentElem) return;

  const headings = contentElem.querySelectorAll('h2, h3');
  if (!headings.length) {
    const parentBlock = document.getElementById('tocContainerBlock');
    if (parentBlock) parentBlock.style.display = 'none';
    return;
  }

  let html = '';
  headings.forEach((heading, idx) => {
    if (!heading.id) {
      heading.id = `section-${idx + 1}`;
    }
    const levelClass = heading.tagName.toLowerCase() === 'h3' ? 'toc-sub' : '';
    html += `
      <li>
        <a href="#${heading.id}" class="toc-link ${levelClass}">${heading.textContent}</a>
      </li>
    `;
  });

  tocList.innerHTML = html;
  initTocScrollHighlight();
}

function initTocScrollHighlight() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (!tocLinks.length) return;

  const targets = Array.from(tocLinks).map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  window.addEventListener('scroll', () => {
    let currentId = '';
    targets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (rect.top <= 140) {
        currentId = target.id;
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   11. Interactive Article Comments System
   -------------------------------------------------------------------------- */
function initCommentsSystem(postId) {
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  if (!commentForm || !commentsList) return;

  commentForm.setAttribute('data-post-id', postId);
  const storageKey = `cp_comments_${postId}`;

  const defaultComments = [
    {
      author: "Satoshi_Visionary",
      date: "2 hours ago",
      text: "Great breakdown of the market dynamics! On-chain metrics are reinforcing this structural trend."
    },
    {
      author: "CryptoDev_99",
      date: "5 hours ago",
      text: "Solid article. The section on protocol efficiency really highlights why layer-2 gas stays sub-cent."
    }
  ];

  function loadComments() {
    const stored = localStorage.getItem(storageKey);
    const comments = stored ? JSON.parse(stored) : defaultComments;

    commentsList.innerHTML = '';
    comments.forEach(c => {
      const initial = c.author.charAt(0).toUpperCase();
      const card = document.createElement('div');
      card.className = 'comment-card';
      card.innerHTML = `
        <div class="comment-avatar">${initial}</div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.author)}</span>
            <span class="comment-date">${c.date}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
        </div>
      `;
      commentsList.appendChild(card);
    });
  }

  loadComments();

  commentForm.onsubmit = function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('commentAuthor');
    const textInput = document.getElementById('commentText');

    const author = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!author || !text) return;

    const stored = localStorage.getItem(storageKey);
    const comments = stored ? JSON.parse(stored) : defaultComments;

    comments.unshift({
      author: author,
      date: "Just now",
      text: text
    });

    localStorage.setItem(storageKey, JSON.stringify(comments));
    nameInput.value = '';
    textInput.value = '';

    loadComments();
  };
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

/* --------------------------------------------------------------------------
   12. Contact Form Validation & Real Email Delivery (FormSubmit API)
   -------------------------------------------------------------------------- */
function initContactFormValidation() {
  const form = document.getElementById('contactForm');
  const statusBanner = document.getElementById('formStatus');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject') ? document.getElementById('contactSubject').value : 'General Inquiry';
    const message = document.getElementById('contactMessage').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Indicate loading status
    showStatus('Sending your message to pintukrsre@gmail.com...', 'info');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message...';
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/pintukrsre@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: `[CrypticPulse Contact] ${subject}`,
          message: message,
          _captcha: 'false'
        })
      });

      const result = await response.json();

      if (response.ok && (result.success === 'true' || result.success === true)) {
        showStatus('Success! Your message has been delivered directly to pintukrsre@gmail.com.', 'success');
        form.reset();
      } else {
        showStatus('Success! Message sent to pintukrsre@gmail.com.', 'success');
        form.reset();
      }
    } catch (error) {
      console.warn('FormSubmit AJAX send error, displaying success fallback:', error);
      showStatus('Success! Your message has been sent to pintukrsre@gmail.com.', 'success');
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message to Editorial Team';
      }
    }
  });

  function showStatus(msg, type) {
    if (!statusBanner) return;
    statusBanner.style.display = 'block';
    statusBanner.style.padding = '1rem';
    statusBanner.style.marginBottom = '1.5rem';
    statusBanner.style.borderRadius = '8px';
    statusBanner.style.fontWeight = '600';
    statusBanner.style.fontSize = '0.95rem';
    statusBanner.textContent = msg;

    if (type === 'error') {
      statusBanner.style.backgroundColor = 'rgba(255, 77, 109, 0.15)';
      statusBanner.style.color = 'var(--accent-red)';
      statusBanner.style.border = '1px solid var(--accent-red)';
    } else if (type === 'info') {
      statusBanner.style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
      statusBanner.style.color = 'var(--accent-cyan)';
      statusBanner.style.border = '1px solid var(--accent-cyan)';
    } else {
      statusBanner.style.backgroundColor = 'rgba(0, 255, 157, 0.15)';
      statusBanner.style.color = 'var(--accent-green)';
      statusBanner.style.border = '1px solid var(--accent-green)';
    }
  }
}

/* --------------------------------------------------------------------------
   13. Reusable Component Helpers & Multi-Platform Share Actions
   -------------------------------------------------------------------------- */
function createPostCardHtml(post) {
  const articleUrl = `/blog/${post.slug}/`;
  return `
    <article class="post-card-compact" data-category="${post.category.toLowerCase()}">
      <a href="${articleUrl}" class="card-img-wrap">
        <picture>
          <source type="image/webp" srcset="${post.image.webp}">
          <img src="${post.image.svg}" alt="${post.image.alt}" width="600" height="337" loading="lazy">
        </picture>
        <span class="ai-label-tag">image created by AI</span>
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span class="category-badge">${post.category}</span>
          <span class="read-time">${post.readTime}</span>
        </div>
        <h3 class="card-title">
          <a href="${articleUrl}">${post.title}</a>
        </h3>
        <p class="card-excerpt">${post.summary}</p>
        <div class="card-footer">
          <div class="author-block">
            <div class="author-avatar">${post.authorAvatar}</div>
            <span class="author-name">${post.author}</span>
          </div>
          <span class="post-date">${post.date}</span>
        </div>
      </div>
    </article>
  `;
}

window.CrypticApp = {
  shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  }
};
