// Only enabled after the owner approves the backend and updated privacy notice.
const flag=document.querySelector('meta[name="ens-analytics"][content="enabled"]');
if(flag&&!navigator.globalPrivacyControl&&navigator.doNotTrack!=='1'&&!new URLSearchParams(location.search).has('measurement_qa')){
 const page=flag.dataset.page;let source='direct';
 try{const h=document.referrer?new URL(document.referrer).hostname:'';if(h.includes('google.'))source='google';else if(h==='www.linkedin.com'||h==='linkedin.com')source='linkedin';else if(h==='www.youtube.com'||h==='youtube.com')source='youtube';else if(h.endsWith('-eth.netlify.app'))source='portfolio';else if(h)source='other';}catch{}
 if(['linkedin','youtube','outreach'].includes(new URLSearchParams(location.search).get('utm_source')))source=new URLSearchParams(location.search).get('utm_source');
 fetch('https://productpassport-eth.netlify.app/api/pageview',{method:'POST',mode:'no-cors',credentials:'omit',headers:{'Content-Type':'text/plain'},body:JSON.stringify({page,source}),keepalive:true}).catch(()=>{});
}
