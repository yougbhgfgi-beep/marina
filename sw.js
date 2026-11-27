/* ذاكرة تطبيق عيد مارينا */
var CACHE='marina-birthday-v9';
var CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./icon-maskable-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  e.respondWith(
    caches.match(req).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res && res.status===200){
          var copy=res.clone();
          caches.open(CACHE).then(function(c){ c.put(req,copy); });
        }
        return res;
      }).catch(function(){
        return hit || (req.mode==='navigate' ? caches.match('./index.html') : Response.error());
      });
      return hit || net;
    })
  );
});
