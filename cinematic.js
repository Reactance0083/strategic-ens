// Autonomous decorative sculpture. No wallet, network, storage or checkout operations.
(()=>{'use strict';
const cinematicRoot=document.body,motionButton=document.getElementById('cinematic-motion');
if(!document.getElementById('cin-sculpture')||!motionButton)return;
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=motionPreference.matches;
function setMotion(){cinematicRoot.classList.toggle('cinematic-paused',paused);motionButton.textContent=paused?'Play motion':'Pause motion';motionButton.setAttribute('aria-pressed',String(paused));}
setMotion();
motionButton.addEventListener('click',()=>{paused=!paused;setMotion();if(!paused)requestAnimationFrame(drawSculpture);});
motionPreference.addEventListener('change',event=>{paused=event.matches;setMotion();if(!paused)requestAnimationFrame(drawSculpture);});
const sculpture=cinematicRoot.querySelector('#cin-sculpture');
const ctx=sculpture.getContext('2d');
let width=710,height=640,lastFrame=0,rotation=0,internalPhase=0,sculptureVisible=true;
function sizeSculpture(){const box=sculpture.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);const dpr=Math.min(window.devicePixelRatio||1,2);sculpture.width=Math.round(width*dpr);sculpture.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);}
const sizeObserver=new ResizeObserver(()=>{sizeSculpture();if(paused)drawSculpture(0);});sizeObserver.observe(sculpture);
let animationFrame=0;
function drawSculpture(timestamp){
 if(!ctx||!cinematicRoot.isConnected)return;
 if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}
 if(!paused&&timestamp-lastFrame<32){animationFrame=requestAnimationFrame(drawSculpture);return;}
 lastFrame=timestamp||0;if(!paused){rotation+=.0038;internalPhase+=.018;}
 ctx.clearRect(0,0,width,height);
 const cx=width*.53,cy=height*.49,scale=Math.min(width,height)*.155;
 const ambient=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*2.9);ambient.addColorStop(0,'#8b41d83a');ambient.addColorStop(.65,'#6646bd20');ambient.addColorStop(1,'#18253a00');ctx.fillStyle=ambient;ctx.fillRect(0,0,width,height);
 // Layered light behind the form, with autonomous slow drift.
 const glowX=cx+Math.sin(internalPhase*.11)*width*.1,glowY=cy+Math.cos(internalPhase*.09)*height*.08;
 const halo=ctx.createRadialGradient(glowX,glowY,scale*.35,glowX,glowY,scale*3.2);halo.addColorStop(0,'#8c4bff24');halo.addColorStop(.45,'#5c43c52e');halo.addColorStop(1,'#080b1700');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let wave=0;wave<7;wave++){
  ctx.beginPath();
  for(let step=0;step<=100;step++){const x=step/100*width,y=height*.74+Math.sin(step*.039+internalPhase*.12+wave*.12)*height*.12+Math.sin(step*.083-internalPhase*.09)*height*.045+wave*8;step?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  ctx.strokeStyle=wave%2?'#7c54c519':'#4767bd1f';ctx.lineWidth=12-wave;ctx.shadowBlur=22;ctx.shadowColor='#8244eb';ctx.stroke();
 }
 ctx.restore();ctx.shadowBlur=0;
 function project(x,y,z){const a=.6+.10*Math.sin(internalPhase*.14),b=rotation;let y1=y*Math.cos(a)-z*Math.sin(a),z1=y*Math.sin(a)+z*Math.cos(a);let x2=x*Math.cos(b)+z1*Math.sin(b),z2=-x*Math.sin(b)+z1*Math.cos(b);const perspective=5/(5+z2);return {x:cx+x2*scale*perspective,y:cy+y1*scale*perspective,z:z2};}
 const bands=width<500?34:52,samples=width<500?170:240,lines=[];
 for(let band=0;band<bands;band++){const phase=band/bands*Math.PI*2,points=[];let depth=0;for(let k=0;k<=samples;k++){const t=k/samples*Math.PI*2,twist=phase+.36*Math.sin(4*t-internalPhase),pulse=.035*Math.sin(6*t-internalPhase*1.2),r=1.62+.48*Math.cos(3*t)+(.20+pulse)*Math.cos(twist);const point=project(r*Math.cos(2*t),r*Math.sin(2*t),.78*Math.sin(3*t)+(.20+pulse)*Math.sin(twist));points.push(point);depth+=point.z;}lines.push({points,depth:depth/points.length,phase});}
 // Render a solid sculpted surface beneath the fine moving filaments.
 const meshBands=width<500?18:26,meshSteps=width<500?110:160,mesh=[];
 function surface(t,phase){const twist=phase+.36*Math.sin(4*t-internalPhase),pulse=.035*Math.sin(6*t-internalPhase*1.2),r=1.62+.48*Math.cos(3*t)+(.20+pulse)*Math.cos(twist);return project(r*Math.cos(2*t),r*Math.sin(2*t),.78*Math.sin(3*t)+(.20+pulse)*Math.sin(twist));}
 for(let band=0;band<meshBands;band++){const row=[];for(let step=0;step<=meshSteps;step++)row.push(surface(step/meshSteps*Math.PI*2,band/meshBands*Math.PI*2));mesh.push(row);}
 const faces=[];
 for(let band=0;band<meshBands;band++)for(let step=0;step<meshSteps;step++){const points=[mesh[band][step],mesh[(band+1)%meshBands][step],mesh[(band+1)%meshBands][step+1],mesh[band][step+1]];faces.push({points,depth:points.reduce((n,p)=>n+p.z,0)/4,band,step});}
 faces.sort((a,b)=>b.depth-a.depth);
 for(const face of faces){const phase=face.band/meshBands*Math.PI*2,t=face.step/meshSteps*Math.PI*2,light=Math.pow(Math.max(0,Math.cos(phase-1.05+.35*Math.sin(t*3-internalPhase))),5),rim=Math.pow(Math.max(0,Math.sin(phase+.25)),12),brightness=13+light*49+rim*17,hue=240+19*Math.sin(t*2+phase*.4+internalPhase*.08);
  ctx.fillStyle=`hsl(${hue},${48+light*16}%,${brightness}%)`;ctx.beginPath();face.points.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();ctx.fill();
 }
 lines.sort((a,b)=>b.depth-a.depth);
 for(const line of lines){const tone=Math.round(245+22*Math.sin(line.phase+rotation)),alpha=Math.max(.045,.15-line.depth*.035);ctx.strokeStyle=`hsla(${tone},88%,${64+12*Math.cos(line.phase)}%,${alpha})`;ctx.lineWidth=.65;ctx.beginPath();line.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
 // Luminous packets travel within the woven form, independently of its outer rotation.
 for(let stream=0;stream<10;stream++){
  const phase=stream/10*Math.PI*2,head=(internalPhase*.24+stream*.63)%(Math.PI*2);
  for(let trail=20;trail>=0;trail--){const t=head-trail*.018,twist=phase+.36*Math.sin(4*t-internalPhase),pulse=.035*Math.sin(6*t-internalPhase*1.2),r=1.62+.48*Math.cos(3*t)+(.20+pulse)*Math.cos(twist),point=project(r*Math.cos(2*t),r*Math.sin(2*t),.78*Math.sin(3*t)+(.20+pulse)*Math.sin(twist));
   const alpha=(1-trail/21)*.9;ctx.fillStyle=stream%3?`rgba(185,147,255,${alpha})`:`rgba(176,211,255,${alpha})`;ctx.shadowColor=stream%3?'#ae78ff':'#9fcaff';ctx.shadowBlur=trail===0?11:3;ctx.beginPath();ctx.arc(point.x,point.y,trail===0?2.4:1.15,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.shadowBlur=0;
 // A quiet inner lattice counter-rotates through the center.
 for(let ring=0;ring<3;ring++){
  ctx.beginPath();ctx.strokeStyle=ring===1?'#a282ee55':'#9bbfff44';ctx.lineWidth=.9;
  for(let pointIndex=0;pointIndex<=100;pointIndex++){const t=pointIndex/100*Math.PI*2,tilt=ring*Math.PI/3-internalPhase*.16;const point=project(.78*Math.cos(t),.78*Math.sin(t)*Math.cos(tilt),.78*Math.sin(t)*Math.sin(tilt));pointIndex?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y);}ctx.stroke();
 }
 for(let i=0;i<30;i++){const t=i*.61803398875*Math.PI*2+rotation*.4,ring=2.8+(i%5)*.16,point=project(Math.cos(t)*ring,Math.sin(t)*ring*.75,Math.sin(t*2)*.6);ctx.fillStyle=i%3?'#a5baff70':'#e2d8ffb0';ctx.beginPath();ctx.arc(point.x,point.y,i%3?1:1.7,0,Math.PI*2);ctx.fill();}
 if(!paused&&sculptureVisible)animationFrame=requestAnimationFrame(drawSculpture);
}
const visibilityObserver=new IntersectionObserver(entries=>{sculptureVisible=entries[0].isIntersecting;if(sculptureVisible&&!paused&&!animationFrame)animationFrame=requestAnimationFrame(drawSculpture);else if(!sculptureVisible&&animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}},{threshold:.02});visibilityObserver.observe(sculpture);
sizeSculpture();drawSculpture(0);

})();
