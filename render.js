// Sayfadaki {{...}} yer tutucularını Supabase'teki içerikle doldurur, sonra app.js'i yükler.
(function(){
var lst=CMS.lst,sl=CMS.sl;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var b=function(x,k){return'data-en="'+esc(x.en[k])+'">'+esc(x.tr[k])};
var im=function(x){return x.image?'<img src="'+esc(x.image)+'" alt="" loading="lazy" onerror="this.remove()">':''};
var pills=function(t,e,c){var a=lst(t),z=lst(e);return a.length?'<div class="pills'+(c||'')+'">'+a.map(function(v,i){return'<span data-en="'+esc(z[i]||v)+'">'+esc(v)+'</span>'}).join('')+'</div>':''};
var row=function(p){return'<div class="row"><figure class="ph">'+im(p)+'</figure><div><h3 '+b(p,'title')+'</h3><p class="mu" '+b(p,'desc')+'</p>'+pills(p.tr.tags,p.en.tags)+'</div></div>'};
var keys=function(p){return lst(p.tr.cats).map(function(c,i){return sl(lst(p.en.cats)[i]||c)})};
var post=function(p){return'<article class="post" data-k="'+keys(p).join(' ')+'"><h2 '+b(p,'title')+'</h2>'+pills(p.tr.cats,p.en.cats)+pills(p.tr.tags,p.en.tags,' t')+'<p class="body" '+b(p,'body')+'</p></article>'};
function fill(h,c){
var f={};c.posts.forEach(function(p){lst(p.tr.cats).forEach(function(t,i){var e=lst(p.en.cats)[i]||t;f[sl(e)]=[t,e]})});
var fe=c.projects.filter(function(p){return p.featured});
var rep={FEATURED:(fe.length?fe:c.projects).slice(0,3).map(row).join(''),
PROJECTS:c.projects.map(row).join(''),
GALLERY6:c.gallery.slice(0,6).map(function(g){return'<a class="ph" href="gallery.html">'+im(g)+'<span class="fc" '+b(g,'title')+'</span></a>'}).join(''),
GALLERYALL:c.gallery.map(function(g){return'<figure class="ph">'+im(g)+'<figcaption><b '+b(g,'title')+'</b><span '+b(g,'cap')+'</span></figcaption></figure>'}).join(''),
LATEST:c.posts.slice(0,3).map(function(p){var c0=lst(p.tr.cats)[0];return'<a href="blog.html"><span '+b(p,'title')+'</span>'+(c0?'<span class="tag" data-en="'+esc(lst(p.en.cats)[0]||'')+'">'+esc(c0)+'</span>':'')+'</a>'}).join(''),
FILTERS:Object.keys(f).map(function(k){return'<button class="tag f" data-f="'+k+'" data-en="'+esc(f[k][1])+'">'+esc(f[k][0])+'</button>'}).join(''),
POSTS:c.posts.map(post).join('\n')};
for(var k in rep)h=h.split('{{'+k+'}}').join(rep[k]);
return h.replace(/\{\{(\w+?)_(tr|en)\}\}/g,function(m,k,l){return c.site[k]?esc(c.site[k][l]):''})}
function done(){document.documentElement.classList.remove('ld');var s=document.createElement('script');s.src='app.js';document.body.appendChild(s)}
var main=document.querySelector('main');
if(!main||main.innerHTML.indexOf('{{')<0)return done();
CMS.load().then(function(c){c.posts=c.posts.filter(function(x){return x.published!==false});main.innerHTML=fill(main.innerHTML,c)})
.catch(function(e){console.error(e);main.innerHTML=main.innerHTML.replace(/\{\{\w+\}\}/g,'')})
.then(done);
})();
