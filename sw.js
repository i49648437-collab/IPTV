const CACHE_NAME = 'iptv-player-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json'
  // Если бы стили или скрипты были вынесены отдельно, их нужно добавить сюда
];

// Установка: кэшируем основные файлы оболочки
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Файлы закэшированы');
        return cache.addAll(urlsToCache);
      })
  );
});

// Стратегия "сначала из кэша, иначе из сети"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша или делаем запрос в сеть
        return response || fetch(event.request).then(fetchResponse => {
          // Кэшируем новые запросы динамически (для будущего офлайна)
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Офлайн-заглушка для навигации (можно вернуть index.html)
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Удаление старых кэшей при обновлении версии
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
