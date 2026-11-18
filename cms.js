// Supabase veri katmanı: sunucu (server.js) yerine doğrudan tarayıcıdan çalışır.
// Site sayfaları ve yönetim paneli bu dosyayı kullanır.
(function(){
var SB=String(window.SUPABASE_URL||'').trim().replace(/\/+$/,'').replace(/\/rest\/v1$/,''),PK=String(window.SUPABASE_KEY||'').trim(),BK='images',SKEY='emin-cms-session';
var UU=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function kh(tok){var h={apikey:PK};if(tok)h.Authorization='Bearer '+tok;else if(/^eyJ/.test(PK))h.Authorization='Bearer '+PK;return h}
function req(method,p,body,extra,tok){var isBin=body instanceof Blob,h=Object.assign(kh(tok),body!==undefined&&!isBin?{'Content-Type':'application/json'}:{},extra||{});
return fetch(SB+p,{method:method,headers:h,body:body===undefined?undefined:isBin?body:JSON.stringify(body)}).then(function(r){return r.text().then(function(t){if(!r.ok){var e=new Error('Supabase '+r.status+': '+t.slice(0,300));e.status=r.status;throw e}return t?JSON.parse(t):null})})}
function rest(m,t,q,b,x,tok){return req(m,'/rest/v1/'+t+(q?'?'+q:''),b,x,tok)}
var lst=function(s){return String(s||'').split(',').map(function(x){return x.trim()}).filter(Boolean)};
var sl=function(s){return String(s).toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')};
var MAP={
projects:{q:'select=*&order=sort.asc,created_at.asc',from:function(r){return{id:r.id,image:r.image_url||'',featured:!!r.featured,tr:{title:r.title_tr||'',desc:r.desc_tr||'',tags:r.tags_tr||''},en:{title:r.title_en||'',desc:r.desc_en||'',tags:r.tags_en||''}}},
 to:function(x,i){return{image_url:x.image||null,featured:!!x.featured,title_tr:x.tr.title||'',title_en:x.en.title||'',desc_tr:x.tr.desc||'',desc_en:x.en.desc||'',tags_tr:x.tr.tags||'',tags_en:x.en.tags||'',sort:i}}},
gallery:{q:'select=*&order=sort.asc,created_at.asc',from:function(r){return{id:r.id,image:r.image_url||'',tr:{title:r.title_tr||'',cap:r.desc_tr||''},en:{title:r.title_en||'',cap:r.desc_en||''}}},
 to:function(x,i){return{image_url:x.image||null,title_tr:x.tr.title||'',title_en:x.en.title||'',desc_tr:x.tr.cap||'',desc_en:x.en.cap||'',sort:i}}},
posts:{q:'select=*&order=sort.asc,created_at.desc',from:function(r){return{id:r.id,published:r.published!==false,tr:{title:r.title_tr||'',body:r.body_tr||'',cats:r.cats_tr||'',tags:r.tags_tr||''},en:{title:r.title_en||'',body:r.body_en||'',cats:r.cats_en||'',tags:r.tags_en||''}}},
 to:function(x,i){return{title_tr:x.tr.title||'',title_en:x.en.title||'',body_tr:x.tr.body||'',body_en:x.en.body||'',cats_tr:x.tr.cats||'',cats_en:x.en.cats||'',tags_tr:x.tr.tags||'',tags_en:x.en.tags||'',published:x.published!==false,sort:i}}}};
function load(tok){return Promise.all([rest('GET','site_settings','select=*',undefined,null,tok),rest('GET','projects',MAP.projects.q,undefined,null,tok),rest('GET','gallery',MAP.gallery.q,undefined,null,tok),rest('GET','posts',MAP.posts.q,undefined,null,tok)]).then(function(a){
var site={};a[0].forEach(function(r){site[r.key]={tr:r.tr||'',en:r.en||''}});
return{site:site,projects:a[1].map(MAP.projects.from),gallery:a[2].map(MAP.gallery.from),posts:a[3].map(MAP.posts.from)}})}
function saveAll(j,tok){
return rest('POST','site_settings','on_conflict=key',Object.keys(j.site).map(function(k){return{key:k,tr:String(j.site[k].tr||''),en:String(j.site[k].en||'')}}),{Prefer:'resolution=merge-duplicates,return=minimal'},tok).then(function(){
return ['projects','gallery','posts'].reduce(function(pr,t){return pr.then(function(){
var a=j[t].map(function(x,i){return Object.assign({id:x.id},MAP[t].to(x,i))}),old=a.filter(function(x){return UU.test(x.id)}),neu=a.filter(function(x){return!UU.test(x.id)}).map(function(x){var y=Object.assign({},x);delete y.id;return y});
return rest('DELETE',t,old.length?'id=not.in.('+old.map(function(x){return x.id}).join(',')+')':'id=not.is.null',undefined,{Prefer:'return=minimal'},tok)
.then(function(){if(old.length)return rest('POST',t,'on_conflict=id',old,{Prefer:'resolution=merge-duplicates,return=minimal'},tok)})
.then(function(){if(neu.length)return rest('POST',t,'',neu,{Prefer:'return=minimal'},tok)})})},Promise.resolve())}).then(function(){return load(tok)})}
// ---- oturum (panel) ----
function getS(){try{return JSON.parse(localStorage.getItem(SKEY))}catch(e){return null}}
function setS(a){var s=a?{token:a.access_token,refresh:a.refresh_token,email:a.user&&a.user.email,exp:Date.now()+((a.expires_in||3600)-60)*1000}:null;try{s?localStorage.setItem(SKEY,JSON.stringify(s)):localStorage.removeItem(SKEY)}catch(e){}return s}
function auth(body,grant){return fetch(SB+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:PK,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.ok?r.json():null})}
function session(){var s=getS();if(!s)return Promise.reject(401);if(s.exp>Date.now())return Promise.resolve(s);
return auth({refresh_token:s.refresh},'refresh_token').then(function(a){if(!a||!a.access_token){setS(null);throw 401}return setS(a)})}
function login(email,password){return auth({email:email,password:password},'password').then(function(a){if(!a||!a.access_token)throw 401;return setS(a)})}
var pub=function(n){return SB+'/storage/v1/object/public/'+BK+'/uploads/'+encodeURIComponent(n)};
// Paneldeki eski "/api/..." çağrılarının tarayıcı karşılığı
function api(u,o){o=o||{};var m=(o.method||'GET').toUpperCase(),url=new URL(u,location.href),p=url.pathname.replace(/^.*\/api\//,'/api/');
if(p=='/api/logout'){setS(null);return Promise.resolve({ok:1})}
return session().then(function(s){var tok=s.token,bd=function(){return JSON.parse(o.body||'{}')};
var wrap=function(pr){return pr.catch(function(e){if(e&&e.status==401){setS(null);throw 401}throw e&&e.status||e})};
if(p=='/api/me')return{ok:1,email:s.email};
if(p=='/api/content'&&m=='GET')return wrap(load(tok));
if(p=='/api/content'&&m=='PUT')return wrap(saveAll(bd(),tok));
if(p=='/api/messages'&&m=='GET')return wrap(rest('GET','messages','select=*&order=created_at.desc',undefined,null,tok).then(function(a){return a.map(function(x){return{id:x.id,d:x.created_at,n:x.name,e:x.email,s:x.subject,m:x.message}})}));
if(p.indexOf('/api/messages/')==0&&m=='DELETE'){var id=p.split('/').pop();if(!UU.test(id))throw 400;return wrap(rest('DELETE','messages','id=eq.'+id,undefined,{Prefer:'return=minimal'},tok)).then(function(){return{ok:1}})}
if(p=='/api/password'&&m=='POST'){var j=bd();if(String(j.new||'').length<8)throw 400;
return auth({email:s.email,password:String(j.old||'')},'password').then(function(a){if(!a||!a.access_token)throw 400;
return fetch(SB+'/auth/v1/user',{method:'PUT',headers:{apikey:PK,Authorization:'Bearer '+a.access_token,'Content-Type':'application/json'},body:JSON.stringify({password:String(j.new)})}).then(function(r){if(!r.ok)throw 400;return{ok:1}})})}
if(p=='/api/upload'&&m=='POST'){var n=url.searchParams.get('name')||'foto.jpg',mm=/(\.[a-z0-9]+)$/i.exec(n),ext=(mm?mm[1]:'.jpg').toLowerCase();if(ext=='.jpeg')ext='.jpg';
if(['.jpg','.png','.webp','.gif'].indexOf(ext)<0)throw 400;
var fn=Date.now()+'-'+(sl(n.replace(/\.[^.]*$/,''))||'foto')+ext,ct={'.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif'}[ext];
return wrap(req('POST','/storage/v1/object/'+BK+'/uploads/'+encodeURIComponent(fn),o.body,{'Content-Type':ct,'x-upsert':'false'},tok)).then(function(){return{url:pub(fn)}})}
if(p=='/api/media'&&m=='GET')return wrap(req('POST','/storage/v1/object/list/'+BK,{prefix:'uploads',limit:1000,offset:0,sortBy:{column:'created_at',order:'desc'}},null,tok)).then(function(a){return(a||[]).filter(function(x){return x.name&&x.id&&x.name.charAt(0)!='.'}).map(function(x){return{name:x.name,url:pub(x.name)}})});
if(p.indexOf('/api/media/')==0&&m=='DELETE'){var nm=decodeURIComponent(p.split('/').pop());return wrap(req('DELETE','/storage/v1/object/'+BK,{prefixes:['uploads/'+nm]},null,tok)).then(function(){return{ok:1}})}
throw 404})}
// İletişim formu: ziyaretçi mesajı doğrudan Supabase'e yazar (RLS sadece eklemeye izin verir)
function contact(d){var g=function(k,n){return String(d[k]||'').trim().slice(0,n)};
if(!g('n',200)||!/^\S+@\S+\.\S+$/.test(g('e',200))||!g('m',4000))return Promise.reject(400);
var k='emin-cms-c',t=Date.now(),a=[];try{a=JSON.parse(localStorage.getItem(k)||'[]').filter(function(x){return t-x<6e5})}catch(e){}
if(a.length>=5)return Promise.reject('r');
return rest('POST','messages','',{name:g('n',200),email:g('e',200),subject:g('s',200),message:g('m',4000)},{Prefer:'return=minimal'}).then(function(){a.push(t);try{localStorage.setItem(k,JSON.stringify(a))}catch(e){}return{ok:1}})}
window.CMS={load:function(){return load(null)},api:api,login:login,contact:contact,lst:lst,sl:sl};
})();
