/* ذاكرة تطبيق عيد مارينا - النسخة الجديدة دايماً من الشبكة أولاً */
var CACHE='marina-birthday-v14';
var CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./icon-maskable-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function saveToCache(req,res){
  if(!res || res.status!==200)return;
  var copy=res.clone();
  caches.open(CACHE).then(function(c){ c.put(req,copy); });
}

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  /* الصفحة والملفات: الشبكة أولاً، والكاش احتياطي فقط لو مفيش نت */
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(function(res){ saveToCache('./index.html',res); return res; })
        .catch(function(){ return caches.match('./index.html') || caches.match(req); })
    );
    return;
  }
  e.respondWith(
    fetch(req).then(function(res){ saveToCache(req,res); return res; })
      .catch(function(){ return caches.match(req) || Response.error(); })
  );
});
