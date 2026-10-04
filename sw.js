/* Service worker: arifa + kufanya app ifunguke hata mtandao ukiwa dhaifu */

const CACHE = "ifm-choir-v2";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./image4.jpg",
  "./image5.jpg"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );

});

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );

});

self.addEventListener("fetch", event => {

  const req = event.request;

  /* Usiguse Firebase, YouTube, fonts n.k. (nje ya website yako) */
  if(req.method !== "GET" || new URL(req.url).origin !== self.location.origin){
    return;
  }

  /* Mtandao kwanza, cache ikiwa mtandao umeshindwa */
  event.respondWith(
    fetch(req)
      .then(res => {

        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});

        return res;

      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );

});

self.addEventListener("notificationclick", event => {

  event.notification.close();

  const data = event.notification.data || {};
  const id = data.id || "";

  /* Link ya moja kwa moja kwenye tangazo husika */
  const target = new URL(
    id ? "./?ann=" + encodeURIComponent(id) : "./",
    self.registration.scope
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {

      /* App ikiwa wazi: ilete mbele na uiambie ifungue tangazo */
      for(const client of list){

        if("focus" in client){

          if(id){
            client.postMessage({ type: "open-announcement", id: id });
          }

          return client.focus();

        }

      }

      /* App imefungwa: ifungue moja kwa moja kwenye tangazo */
      if(self.clients.openWindow){
        return self.clients.openWindow(target);
      }

    })
  );

});
