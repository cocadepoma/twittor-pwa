function updateDynamicCache(dynamicCache, req, res) {
  if (res.ok) {
    return caches.open(dynamicCache).then(cache => {
      cache.put(req, res.clone());
      return res.clone();
    });
  } else {
    return res;
  }
}

function updateStaticCache(staticCache, req, APP_SHELL_INMUTABLE) {
  if (APP_SHELL_INMUTABLE.includes(req.url)) {
    return;
  } else {
    return fetch(req).then(res => {
      return updateDynamicCache(staticCache, req, res);
    });
  }
} 

function handleApiMessages(cacheName, req) {

  if (req.clone().method === 'POST') {
    
    if (self?.registration?.sync) {
      return req.clone().text().then(body => {
        const bodyObj = JSON.parse(body);
        return saveMessage(bodyObj);
      });
    } else {
      console.log('No hay sync')
      return fetch(req);
    }
  } else {
    return fetch(req).then(res => {
      if (res.ok) {
        updateDynamicCache(cacheName, req, res.clone());
        return res.clone();
      } else {
        return caches.match(req);
      }
    }).catch(err => {
      return caches.match(req);
    });
  }

}