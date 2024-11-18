// imports
importScripts('js/libs/dexie.js');
importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v2';

const APP_SHELL = [
  // '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js',
  'js/sw-utils.js',
  'js/sw-db.js',
  'js/libs/mdtoast.min.js',
  'js/libs/mdtoast.min.css',
];

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'css/animate.css',
  'js/libs/font-awesome.css',
  'js/libs/jquery.js',
  'js/libs/dexie.js',
];

self.addEventListener('install', (e) => {
  const cacheStatic = caches.open(STATIC_CACHE).then((cache) => {
    cache.addAll(APP_SHELL);
  });

  const cacheInmutable = caches.open(INMUTABLE_CACHE).then((cache) => {
    cache.addAll(APP_SHELL_INMUTABLE);
  });

  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes('static')) {
        return caches.delete(key);
      }

      if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
        return caches.delete(key);
      }
    });
  });

  e.waitUntil(respuesta);
});

self.addEventListener('fetch', (e) => {
  if(e.request.url.startsWith('chrome-extension://')) return;
  let resp;

  if(e.request.url.includes('/api')) {
    resp = handleApiMessages(DYNAMIC_CACHE, e.request);
  } else {
    resp = caches.match(e.request).then((res) => {
      if (res) {
        updateStaticCache(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
        return res;
      }
  
      return fetch(e.request).then((newRes) => {
        return updateDynamicCache(DYNAMIC_CACHE, e.request, newRes);
      });
    });
  }

  e.respondWith(resp);
});

self.addEventListener('sync', (e) => {
  console.log('SW: Sync', e);
  if (e.tag === 'new-message') {
  
    const resp = postMessages();
    e.waitUntil(resp);
  }
});