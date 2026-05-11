// 芳华漫创AI工作台 - Service Worker (PWA离线支持)
const CACHE_NAME = 'fanghua-v1';
const ASSETS = ['/index.html'];

// 安装时缓存核心资源
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (e) => {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// 网络优先策略：先尝试网络，失败时回退缓存
self.addEventListener('fetch', (e) => {
  // 只处理GET请求
  if (e.request.method !== 'GET') return;
  // 跳过API请求
  if (e.request.url.includes('/api') || e.request.url.includes('/chat') || e.request.url.includes('/generate')) return;
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // 成功时更新缓存
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // 失败时返回缓存
        return caches.match(e.request).then((cached) => cached || new Response('离线中，请检查网络');
      })
  );
});
