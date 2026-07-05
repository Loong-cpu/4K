// ===== API 配置 =====
const API_BASE = '/api';

// ===== 工具函数 =====
function fetchJSON(url) {
  return fetch(url).then(r => r.json()).catch(() => null);
}

// 类型映射
const TYPE_MAP = {
  1: { name: '电影', cls: 'tag-dianying' },
  2: { name: '美剧', cls: 'tag-meiju' },
  14: { name: '日剧', cls: 'tag-jvju' },
  15: { name: '国产剧', cls: 'tag-guochan' },
  16: { name: '韩剧', cls: 'tag-hanju' },
  21: { name: '纪录片', cls: 'tag-fenxiang' },
  22: { name: '番剧', cls: 'tag-guoman' },
  23: { name: '港剧', cls: 'tag-hanju' },
  24: { name: '剧场版', cls: 'tag-guoman' },
  25: { name: '综艺', cls: 'tag-zongyi' },
  35: { name: '短剧', cls: 'tag-duanju' },
};

function getTagInfo(item) {
  const typeCode = item.type || 1;
  const info = TYPE_MAP[typeCode] || { name: '其他', cls: 'tag-fenxiang' };
  return { name: info.name, cls: info.cls };
}

// ===== 生成卡片 HTML =====
function createCard(item) {
  const tag = getTagInfo(item);
  const rating = item.rating ? parseFloat(item.rating.average) : null;
  const year = item.year || '';
  const img = item.img || item.cover_url || '';

  const tagHTML = `<span class="card-tag ${tag.cls}">${tag.name}</span>`;
  const scoreHTML = rating ? `<span class="card-score">${rating.toFixed(1)}</span>` : '';
  const imgHTML = img
    ? `<img class="card-img" src="${img}" alt="${item.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="poster-placeholder" style="display:none;background:linear-gradient(145deg,#1a2a3a,#0d0d0d);"><i class="fas fa-film"></i></div>`
    : `<div class="poster-placeholder" style="background:linear-gradient(145deg,#1a2a3a,#0d0d0d);"><i class="fas fa-film"></i></div>`;

  return `
    <div class="movie-card" data-id="${item.id}" data-title="${item.title}" data-year="${year}" data-type="${item.type || 1}">
      <div class="card-poster">
        ${imgHTML}
        ${tagHTML}
        ${scoreHTML}
        <div class="card-update">${item.episode ? '更新至' + item.episode + '集' : year || 'HD'}</div>
      </div>
      <div class="card-info">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">${(item.directors || []).map(d => d.name).join(' / ') || year}</div>
      </div>
    </div>
  `;
}

// ===== 加载排行榜 =====
async function loadRank(sectionId, type = 11, start = 0, limit = 12) {
  const grid = document.getElementById(sectionId);
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  const data = await fetchJSON(`${API_BASE}/rank?type=${type}&start=${start}&limit=${limit}`);
  if (data && data.code === 0 && data.data.length > 0) {
    grid.innerHTML = data.data.map(createCard).join('');
    bindCardClick();
  } else {
    grid.innerHTML = '<p class="empty-msg">暂无数据</p>';
  }
}

// ===== 搜索 =====
async function doSearch(query) {
  if (!query.trim()) return;
  const data = await fetchJSON(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  const overlay = document.getElementById('searchOverlay');
  const results = document.getElementById('searchResults');

  if (data && data.data.length > 0) {
    overlay.classList.add('visible');
    results.innerHTML = data.data.slice(0, 10).map(item => `
      <div class="search-item" data-title="${item.title}">
        <img src="${item.img}" alt="" class="search-thumb" onerror="this.style.display='none'">
        <div class="search-info">
          <div class="search-name">${item.title}</div>
          <div class="search-year">${item.year || ''} · ${item.type === 'movie' ? '影视' : ''}</div>
        </div>
      </div>
    `).join('');

    results.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        openPlayer(el.dataset.title);
      });
    });
  } else {
    results.innerHTML = '<p class="empty-msg">没有找到相关结果</p>';
    overlay.classList.add('visible');
  }
}

// ===== 卡片点击 =====
function bindCardClick() {
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      openPlayer(
        card.dataset.title,
        card.dataset.year,
        card.dataset.type
      );
    });
  });
}

// ===== 在线播放 =====
function openPlayer(title, year, type) {
  const overlay = document.getElementById('playerOverlay');
  const playerTitle = document.getElementById('playerTitle');
  const playerYear = document.getElementById('playerYear');
  const playerIframe = document.getElementById('playerIframe');
  const sourceSelect = document.getElementById('sourceSelect');

  playerTitle.textContent = title || '未知';
  playerYear.textContent = year || '';

  // 构建播放 URL
  const encodedTitle = encodeURIComponent(title || '');
  const sources = [
    { name: '📺 第一源', url: `https://www.playm3u8.cn/player.html?url=https://www.ikanss.com/e/tools/dj.php?ca=${encodedTitle}` },
    { name: '📺 第二源', url: `https://jx.bozrc.com:4433/player/?url=https://www.ikanss.com/e/tools/dj.php?ca=${encodedTitle}&pad=1` },
    { name: '📺 第三源', url: `https://vip.vipuuvip.com/?url=https://www.ikanss.com/e/tools/dj.php?ca=${encodedTitle}` },
    { name: '📺 第四源', url: `https://www.ckplayer.vip/play/?url=https://www.ikanss.com/e/tools/dj.php?ca=${encodedTitle}` },
    { name: '🔍 豆瓣搜索', url: `https://movie.douban.com/subject_search?search_text=${encodedTitle}` },
  ];

  sourceSelect.innerHTML = sources.map((s, i) =>
    `<option value="${i}">${s.name}</option>`
  ).join('');

  // 默认第一源
  if (sources.length > 0) {
    playerIframe.src = sources[0].url;
  }

  sourceSelect.onchange = () => {
    const idx = parseInt(sourceSelect.value);
    if (sources[idx]) {
      playerIframe.src = sources[idx].url;
    }
  };

  overlay.classList.add('visible');
}

function closePlayer() {
  const overlay = document.getElementById('playerOverlay');
  const playerIframe = document.getElementById('playerIframe');
  overlay.classList.remove('visible');
  playerIframe.src = '';
}

// ===== 轮播 =====
let carouselItems = [];
let currentSlide = 0;
let autoPlayTimer;

function initCarousel(items) {
  const track = document.getElementById('carouselTrack');
  const indicators = document.getElementById('carouselIndicators');

  carouselItems = items.slice(0, 5);
  if (carouselItems.length === 0) return;

  track.innerHTML = carouselItems.map((item, i) => {
    const tag = getTagInfo(item);
    const rating = item.rating ? item.rating.average : '';
    const year = item.year || '';
    const directors = (item.directors || []).map(d => d.name).join(' / ');
    return `
      <div class="carousel-slide ${i === 0 ? 'active' : ''}">
        <div class="slide-bg" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);"></div>
        <div class="slide-content">
          <span class="slide-tag">${tag.name}</span>
          <h2>${item.title}</h2>
          <p class="slide-desc">${directors ? '主演：' + directors : (year ? year : '')}</p>
          <p class="slide-meta">${rating ? '豆瓣评分 ' + rating : ''} · ${item.episode ? '更新至' + item.episode + '集' : year}</p>
          <div class="slide-actions">
            <button class="btn-play" onclick="openPlayer('${item.title.replace(/'/g, "\\'")}','${item.year || ''}','${item.type || 1}')"><i class="fas fa-play"></i> 立即播放</button>
            <button class="btn-detail" onclick="openPlayer('${item.title.replace(/'/g, "\\'")}','${item.year || ''}','${item.type || 1}')"><i class="fas fa-info-circle"></i> 查看详情</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  indicators.innerHTML = carouselItems.map((_, i) =>
    `<button class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
  ).join('');

  document.querySelectorAll('.indicator').forEach(ind => {
    ind.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(parseInt(ind.dataset.index));
      startAutoPlay();
    });
  });

  document.getElementById('nextSlide').onclick = () => { stopAutoPlay(); nextSlide(); startAutoPlay(); };
  document.getElementById('prevSlide').onclick = () => { stopAutoPlay(); prevSlide(); startAutoPlay(); };

  startAutoPlay();
}

function goToSlide(index) {
  document.querySelectorAll('.carousel-slide').forEach((s, i) => s.classList.toggle('active', i === index));
  document.querySelectorAll('.indicator').forEach((s, i) => s.classList.toggle('active', i === index));
  currentSlide = index;
}

function nextSlide() { goToSlide((currentSlide + 1) % carouselItems.length); }
function prevSlide() { goToSlide((currentSlide - 1 + carouselItems.length) % carouselItems.length); }

function startAutoPlay() { clearInterval(autoPlayTimer); autoPlayTimer = setInterval(nextSlide, 5000); }
function stopAutoPlay() { clearInterval(autoPlayTimer); }

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
  // 加载轮播数据
  const carouselData = await fetchJSON(`${API_BASE}/carousel`);
  if (carouselData && carouselData.data) {
    initCarousel(carouselData.data);
  }

  // 加载热门（电影）
  loadRank('hotGrid', 1, 0, 12);
  // 加载最近更新（电视剧）
  loadRank('recentGrid', 11, 0, 12);

  // 搜索
  const searchInput = document.getElementById('searchInput');
  document.getElementById('searchBtn').addEventListener('click', () => doSearch(searchInput.value));
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(searchInput.value); });

  // 点击遮罩关闭搜索
  document.getElementById('searchOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('visible');
  });

  // 关闭播放器
  document.getElementById('closePlayer').addEventListener('click', closePlayer);
  document.getElementById('playerOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePlayer();
  });

  // ESC 关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('searchOverlay').classList.remove('visible');
      closePlayer();
    }
  });

  // 导航切换
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const type = link.dataset.type;
      if (type) loadRank('hotGrid', parseInt(type), 0, 12);
    });
  });

  // 分类标签
  document.querySelectorAll('.cat-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const type = tag.dataset.type;
      if (type) loadRank('hotGrid', parseInt(type), 0, 12);
    });
  });
});
