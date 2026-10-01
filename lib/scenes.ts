/* eslint-disable */
// Painted poster scenes (pure SVG), ported from the prototype's scene(type).
// Placeholders until real photos from the partner's trips exist.

export const SCENES = ["city","plane","valley","falls","ocean","atlas","ksar","balloon","stone","quad","palms","dunes","riad","kit","baby","henna","spa","tagine","luggage","night","nightkit","road","barber","camera","palace","garden"] as const;

function palm(x: number, y: number, s: number, c: string): string {return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-2 0 q4 -40 1 -80 l3 0 q4 40 0 80z"/><path d="M1 -80 q-26 -8 -40 6 q18 -14 40 -2z"/><path d="M1 -80 q26 -10 42 4 q-20 -12 -42 -1z"/><path d="M1 -80 q-18 -22 -36 -18 q20 -2 36 16z"/><path d="M1 -80 q18 -24 38 -20 q-22 0 -38 18z"/><path d="M1 -80 q-4 -24 -18 -34 q14 14 16 34z"/></g>`}
function camel(x: number, y: number, s: number, c: string): string {return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M0 -14 q3 -9 10 -10 q5 -10 12 -4 q6 -7 11 0 q3 -2 4 -8 q1 -6 5 -5 q4 1 3 5 l-4 8 q-3 7 -7 9 l0 19 h-2.5 l-1.5 -15 h-14 l-1.5 15 h-2.5 l0 -16 q-6 -1 -5 -6z"/></g>`}
export function sceneSvg(type: string, uid: string = type): string {
  const id = "g-" + uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const S=({
    city:["#f6b26b","#e0607e","#fff1c9"], plane:["#8ec5ff","#dff0ff","#fffbe6"], valley:["#bfe3f2","#f3f7e8","#fff6d6"],
    falls:["#a9d8f0","#e8f6f2","#fff6d6"], ocean:["#9ad0f5","#e9f6ff","#fffbe9"], atlas:["#7fb2e5","#dbeafc","#ffffff"],
    ksar:["#f3c27a","#f7e2b8","#fff4d6"], balloon:["#ffc9a8","#ffe9d2","#fff3dd"], stone:["#2b2a5c","#c9637a","#ffd27a"],
    quad:["#f5d7a1","#fbeed4","#fff6e3"], palms:["#f59e5b","#fbd38a","#fff0c2"], dunes:["#f7a441","#fbd6a0","#fff3cf"],
    henna:["#e39a72","#f8dcc6","#fff1e2"], spa:["#cfe3dc","#f5efe6","#fffaf0"], tagine:["#2a2447","#6b3f5e","#ffd27a"],
    luggage:["#bcd7ff","#eef5ff","#fffbe6"], night:["#15142e","#4a2c5a","#fff4d0"], nightkit:["#161433","#3d2a55","#fff4d0"], road:["#9fcbf2","#f3ecd9","#fff6d6"],
    barber:["#1f6f78","#cfe6e3","#fff4d6"], camera:["#f6b26b","#fbe3c4","#fff4d6"],
    palace:["#9fd0e8","#e9f4f6","#fff4d6"], garden:["#bfe3c8","#eef7e9","#fff6d6"]
  } as Record<string, string[]>)[type]||["#ddd","#eee","#fff"];
  let g=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S[0]}"/><stop offset="1" stop-color="${S[1]}"/></linearGradient></defs><rect width="400" height="250" fill="url(#${id})"/>`;
  const sun=(x: number, y: number, r: number)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${S[2]}"/>`;
  switch(type){
   case "city": g+=sun(300,120,34)+`<path d="M0 150 L60 110 L120 138 L190 96 L260 132 L330 104 L400 130 V250 H0z" fill="#c07aa6" opacity=".55"/>
     <rect x="0" y="172" width="400" height="78" fill="#b0503f"/>${Array.from({length:20},(_,i)=>`<rect x="${i*20+4}" y="164" width="10" height="9" fill="#b0503f"/>`).join("")}
     <rect x="176" y="92" width="26" height="82" fill="#8f3c30"/><rect x="183" y="78" width="12" height="15" fill="#8f3c30"/><circle cx="189" cy="73" r="4" fill="#ffd27a"/>
     <rect x="182" y="104" width="14" height="7" fill="#6e2b22"/>${palm(60,210,.9,"#3f2a2a")}${palm(330,214,1.05,"#3f2a2a")}${palm(360,220,.7,"#3f2a2a")}`;break;
   case "plane": g+=sun(320,60,22)+`<path d="M0 205 H400 V250 H0z" fill="#9aa7b4"/><path d="M0 210 H400" stroke="#fff" stroke-width="3" stroke-dasharray="24 18"/>
     <g transform="translate(150 90) rotate(-12)" fill="#1f3fbf"><path d="M0 8 L90 0 q14 0 14 6 q0 6 -14 6 L0 14z"/><path d="M40 6 L64 -30 L74 -30 L60 8z"/><path d="M40 12 L64 46 L74 46 L60 10z"/><path d="M4 8 L-4 -10 L6 -10 L14 8z"/></g>
     ${palm(40,210,.8,"#2f6d54")}${palm(372,212,.9,"#2f6d54")}`;break;
   case "valley": g+=sun(300,70,24)+`<path d="M0 140 L80 70 L150 120 L230 60 L320 115 L400 80 V250 H0z" fill="#7aa98a"/><path d="M0 170 L90 120 L180 160 L270 118 L400 165 V250 H0z" fill="#4e8a64"/>
     <path d="M180 250 q30 -40 -10 -70 q-30 -20 20 -50" stroke="#bfe6f5" stroke-width="12" fill="none"/><path d="M0 215 L400 205 V250 H0z" fill="#2f6b49"/>`;break;
   case "falls": g+=`<path d="M0 50 L150 40 L160 250 H0z" fill="#b5763f"/><path d="M400 40 L240 52 L232 250 H400z" fill="#9c6232"/>
     <path d="M150 42 L242 50 L236 200 L156 200z" fill="#e9f7ff"/>${[165,180,195,210,225].map(x=>`<path d="M${x} 48 V198" stroke="#bfe1f3" stroke-width="3"/>`).join("")}
     <ellipse cx="200" cy="212" rx="120" ry="26" fill="#6ec3c9"/><path d="M0 225 H400 V250 H0z" fill="#3f7a4f"/>${palm(40,240,.7,"#2c5a3a")}`;break;
   case "ocean": g+=sun(90,70,26)+`<path d="M0 150 H400 V250 H0z" fill="#2c7fb8"/><path d="M0 170 q50 -10 100 0 t100 0 t100 0 t100 0" stroke="#bfe4ff" stroke-width="3" fill="none"/>
     <path d="M0 200 q50 -10 100 0 t100 0 t100 0 t100 0" stroke="#bfe4ff" stroke-width="3" fill="none"/><rect x="230" y="110" width="170" height="80" fill="#e8d9bd"/>
     ${Array.from({length:9},(_,i)=>`<rect x="${232+i*19}" y="102" width="10" height="9" fill="#e8d9bd"/>`).join("")}<rect x="250" y="80" width="40" height="110" fill="#d9c5a0"/>${Array.from({length:3},(_,i)=>`<rect x="${252+i*14}" y="72" width="8" height="9" fill="#d9c5a0"/>`).join("")}
     <path d="M150 60 q6 -6 12 0 q6 -6 12 0" stroke="#2b3a55" stroke-width="2" fill="none"/><path d="M190 80 q5 -5 10 0 q5 -5 10 0" stroke="#2b3a55" stroke-width="2" fill="none"/>`;break;
   case "atlas": g+=`<path d="M0 170 L90 60 L150 120 L230 30 L320 120 L400 70 V250 H0z" fill="#6f7fa8"/><path d="M230 30 L262 70 L246 64 L232 76 L216 62 L200 66z" fill="#fff"/><path d="M90 60 L112 88 L98 82 L84 92 L70 84z" fill="#fff"/>
     <path d="M0 200 L110 140 L210 190 L310 145 L400 185 V250 H0z" fill="#4b6b5a"/><g fill="#c98b5a">${[60,86,112].map((x,i)=>`<rect x="${x}" y="${176-i*8}" width="22" height="18"/>`).join("")}</g>`;break;
   case "ksar": g+=sun(320,70,28)+`<path d="M0 190 q200 -40 400 0 V250 H0z" fill="#d9a066"/>
     <g fill="#c07a44">${[[90,120,50,80],[140,95,46,105],[186,110,56,90],[242,125,44,75],[130,70,24,40]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`+Array.from({length:Math.floor(w/10)},(_,i)=>`<rect x="${x+i*10+2}" y="${y-6}" width="6" height="7"/>`).join("")).join("")}</g>
     <g fill="#8a4f2a">${[[104,140],[156,120],[200,135],[252,145],[160,160]].map(([x,y])=>`<rect x="${x}" y="${y}" width="8" height="12"/>`).join("")}</g>${palm(40,225,.8,"#5b6b2f")}${palm(370,228,.9,"#5b6b2f")}`;break;
   case "balloon": g+=sun(200,190,40)+`${([[110,90,1,"#e0607e","#ffd27a"],[250,60,1.3,"#1f3fbf","#f6b26b"],[320,120,.8,"#f0a52b","#fff"]] as [number,number,number,string,string][]).map(([x,y,s,a,b])=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="22" ry="26" fill="${a}"/><path d="M-8 -25 q-6 25 3 45 M8 -25 q6 25 -3 45" stroke="${b}" stroke-width="4" fill="none"/><path d="M-7 22 L-4 34 M7 22 L4 34" stroke="#5a3a2a" stroke-width="1.5"/><rect x="-5" y="33" width="10" height="7" fill="#7a4a2a"/></g>`).join("")}
     <path d="M0 210 H400 V250 H0z" fill="#b87a4b"/>${palm(30,230,.9,"#4a3a2a")}${palm(80,236,.7,"#4a3a2a")}${palm(350,232,.9,"#4a3a2a")}`;break;
   case "stone": g+=`${Array.from({length:26},(_,i)=>`<circle cx="${(i*67)%400}" cy="${(i*37)%110+10}" r="${i%3?1:1.8}" fill="#fff" opacity=".85"/>`).join("")}<circle cx="320" cy="50" r="14" fill="#ffe7b0"/>
     <path d="M0 160 q60 -30 120 -10 q70 -30 140 0 q70 -25 140 5 V250 H0z" fill="#8a5a6e"/><path d="M0 195 q100 -20 200 0 t200 0 V250 H0z" fill="#5b3b54"/>
     <g fill="#f6e3c3"><path d="M150 196 L180 166 L210 196z"/><path d="M200 196 L226 172 L252 196z"/></g><circle cx="120" cy="198" r="6" fill="#ffb347"/><circle cx="120" cy="190" r="12" fill="#ffb347" opacity=".25"/>`;break;
   case "quad": g+=sun(80,60,22)+`<path d="M0 150 q80 -40 170 -10 q90 -30 230 10 V250 H0z" fill="#d6a978"/><path d="M0 200 q120 -30 240 -5 t160 0 V250 H0z" fill="#b98556"/>
     <g transform="translate(210 176)" fill="#2b2a3a"><rect x="0" y="0" width="46" height="12" rx="3"/><rect x="14" y="-12" width="12" height="12" rx="2"/><circle cx="6" cy="16" r="9"/><circle cx="42" cy="16" r="9"/></g>
     <path d="M200 196 q-40 -10 -80 4 q-20 6 -40 -2" stroke="#f4dcb8" stroke-width="10" fill="none" opacity=".7"/>`;break;
   case "palms": g+=sun(200,150,46)+`<path d="M0 195 H400 V250 H0z" fill="#8a4a2a"/>${palm(60,200,1.2,"#3a2320")}${palm(110,200,.9,"#3a2320")}${palm(320,200,1.3,"#3a2320")}${palm(370,200,.8,"#3a2320")}
     ${camel(170,196,1.1,"#3a2320")}${camel(220,196,.95,"#3a2320")}`;break;
   case "dunes": g+=sun(290,80,30)+`<path d="M0 150 q90 -60 200 0 q100 -50 200 -10 V250 H0z" fill="#e98a3a"/><path d="M0 190 q120 -50 250 -5 q90 -30 150 -5 V250 H0z" fill="#d06a24"/><path d="M200 150 q-30 30 -40 100" stroke="#f8b36a" stroke-width="2" fill="none"/>
     ${camel(80,168,.9,"#5a2a14")}${camel(118,166,.9,"#5a2a14")}${camel(156,164,.9,"#5a2a14")}`;break;
   case "riad": g=`<rect width="400" height="250" fill="#26264a"/>${Array.from({length:14},(_,i)=>`<circle cx="${(i*83)%400}" cy="${(i*29)%60+8}" r="1.3" fill="#fff" opacity=".8"/>`).join("")}
     <rect x="0" y="70" width="400" height="180" fill="#e7c9a0"/>${[30,150,270].map(x=>`<path d="M${x} 250 V140 q50 -70 100 0 V250z" fill="#b8744a"/><path d="M${x+14} 250 V146 q36 -52 72 0 V250z" fill="#f2b35e"/>`).join("")}
     <ellipse cx="200" cy="232" rx="70" ry="12" fill="#3f8f8a"/><ellipse cx="200" cy="228" rx="18" ry="5" fill="#9fd8d2"/>${[80,200,320].map(x=>`<circle cx="${x}" cy="118" r="6" fill="#ffd27a"/><circle cx="${x}" cy="118" r="14" fill="#ffd27a" opacity=".25"/>`).join("")}`;break;
   case "kit": g+=sun(310,60,24)+`<path d="M0 190 q100 -30 200 -5 t200 0 V250 H0z" fill="#c9965f"/><g transform="translate(150 70)"><rect x="0" y="20" width="100" height="120" rx="22" fill="#1f3fbf"/><rect x="18" y="0" width="64" height="40" rx="18" fill="none" stroke="#1f3fbf" stroke-width="10"/><rect x="18" y="70" width="64" height="48" rx="10" fill="#f0a52b"/><path d="M50 70 V118" stroke="#1f3fbf" stroke-width="4"/><rect x="10" y="40" width="80" height="12" rx="6" fill="#16308f"/></g>`;break;
   case "henna": g+=sun(330,56,26)+`<path d="M0 210 H400 V250 H0z" fill="#c9764f"/>
     <g transform="translate(150 44)"><rect x="8" y="78" width="96" height="112" rx="44" fill="#e2ab82"/>${[[10,24,70],[32,6,86],[54,0,92],[76,12,80]].map(([x,y,h])=>`<rect x="${x}" y="${y}" width="20" height="${h}" rx="10" fill="#e2ab82"/>`).join("")}<rect x="-26" y="104" width="22" height="64" rx="11" transform="rotate(-38 -15 136)" fill="#e2ab82"/>
     <g fill="none" stroke="#7a2e1a" stroke-width="2.2" stroke-linecap="round"><circle cx="56" cy="138" r="16"/><circle cx="56" cy="138" r="7"/><path d="M20 112 q36 -22 72 0"/>${[20,42,64,86].map(x=>`<path d="M${x} 50 q-5 8 0 16 q5 8 0 16"/>`).join("")}</g>
     <g fill="#7a2e1a">${Array.from({length:12},(_,i)=>`<circle cx="${56+26*Math.cos(i*Math.PI/6)}" cy="${138+26*Math.sin(i*Math.PI/6)}" r="2.4"/>`).join("")}${[20,42,64,86].map(x=>`<circle cx="${x}" cy="40" r="3"/>`).join("")}</g></g>
     <g transform="translate(300 150) rotate(28)"><path d="M0 0 L14 0 L7 60z" fill="#5a2a14"/><rect x="-2" y="-8" width="18" height="10" rx="3" fill="#f0a52b"/></g>`;break;
   case "spa": g+=`<path d="M0 170 H400 V250 H0z" fill="#e3d6c3"/><path d="M0 170 H400" stroke="#cdbda4" stroke-width="2"/>
     ${[[70,120,"#ffffff"],[70,96,"#f2e6d6"],[70,72,"#ffffff"]].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="120" height="26" rx="13" fill="${c}" stroke="#d8cab5" stroke-width="2"/><circle cx="${Number(x)+13}" cy="${Number(y)+13}" r="7" fill="none" stroke="#d8cab5" stroke-width="2"/>`).join("")}
     <ellipse cx="290" cy="166" rx="62" ry="14" fill="#c9a87f"/><path d="M228 150 q62 40 124 0z" fill="#b88f63"/>${[[262,146,"#d9536f"],[286,142,"#f08aa0"],[308,147,"#d9536f"],[276,152,"#f5b64a"],[300,153,"#f08aa0"]].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>`).join("")}
     <rect x="215" y="96" width="22" height="50" rx="4" fill="#fff8ec" stroke="#d8cab5" stroke-width="2"/><path d="M226 96 V88" stroke="#5a3a2a" stroke-width="2"/><path d="M226 72 q8 9 0 16 q-8 -7 0 -16z" fill="#f0a52b"/><circle cx="226" cy="82" r="14" fill="#ffd27a" opacity=".3"/>
     <path d="M340 70 q-40 10 -44 60 q40 -10 44 -60z" fill="#6f9e7d"/><path d="M340 70 q-26 30 -44 60" stroke="#4e7a5c" stroke-width="2" fill="none"/>`;break;
   case "tagine": g+=`${Array.from({length:18},(_,i)=>`<circle cx="${(i*71)%400}" cy="${(i*23)%70+8}" r="1.2" fill="#fff" opacity=".75"/>`).join("")}
     <path d="M60 0 V40" stroke="#c9a15a" stroke-width="2"/><g transform="translate(60 40)"><path d="M-12 0 h24 l6 26 h-36z" fill="#f0a52b"/><path d="M-18 26 h36 l-6 10 h-24z" fill="#c07a22"/><circle cx="0" cy="18" r="30" fill="#ffd27a" opacity=".22"/></g>
     <path d="M340 0 V30" stroke="#c9a15a" stroke-width="2"/><g transform="translate(340 30) scale(.8)"><path d="M-12 0 h24 l6 26 h-36z" fill="#f0a52b"/><path d="M-18 26 h36 l-6 10 h-24z" fill="#c07a22"/><circle cx="0" cy="18" r="30" fill="#ffd27a" opacity=".22"/></g>
     <path d="M0 196 H400 V250 H0z" fill="#8a4a2a"/><path d="M0 196 H400" stroke="#6b3620" stroke-width="3"/>
     <ellipse cx="200" cy="192" rx="112" ry="16" fill="#b0503f"/><ellipse cx="200" cy="186" rx="96" ry="12" fill="#d0673f"/>
     <path d="M126 184 Q200 40 274 184z" fill="#d9693a"/><path d="M150 184 Q200 70 250 184" fill="none" stroke="#f0a52b" stroke-width="3" opacity=".7"/><circle cx="200" cy="106" r="9" fill="#b0503f"/>
     <g fill="none" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linecap="round"><path d="M190 92 q-8 -12 0 -22 q8 -10 0 -22"/><path d="M210 92 q8 -12 0 -22 q-8 -10 0 -22"/></g>`;break;
   case "luggage": g+=sun(330,56,22)+`<path d="M0 200 H400 V250 H0z" fill="#7e8a97"/><path d="M0 222 H400" stroke="#fff" stroke-width="3" stroke-dasharray="24 18"/>
     <g transform="translate(70 104)"><path d="M0 30 q0 -30 30 -30 h150 q22 0 34 18 l26 36 v42 h-240z" fill="#1f3fbf"/><rect x="18" y="12" width="56" height="34" rx="6" fill="#cfe0ff"/><rect x="84" y="12" width="56" height="34" rx="6" fill="#cfe0ff"/><path d="M150 12 h40 l22 34 h-62z" fill="#cfe0ff"/>
     <circle cx="52" cy="96" r="18" fill="#16162a"/><circle cx="196" cy="96" r="18" fill="#16162a"/><circle cx="52" cy="96" r="7" fill="#9aa7b4"/><circle cx="196" cy="96" r="7" fill="#9aa7b4"/></g>
     <g transform="translate(250 44)"><rect x="0" y="16" width="56" height="74" rx="10" fill="#f0a52b"/><path d="M18 16 V4 h20 V16" fill="none" stroke="#c07a22" stroke-width="5"/><path d="M14 30 V78 M42 30 V78" stroke="#c07a22" stroke-width="4"/></g>
     <g transform="translate(318 70)"><rect x="0" y="10" width="40" height="52" rx="8" fill="#d9536f"/><path d="M12 10 V2 h16 V10" fill="none" stroke="#a83e55" stroke-width="4"/></g>`;break;
   case "night": g+=`<circle cx="320" cy="56" r="20" fill="${S[2]}"/><circle cx="330" cy="50" r="18" fill="#15142e"/>${Array.from({length:22},(_,i)=>`<circle cx="${(i*61)%400}" cy="${(i*19)%90+6}" r="1.2" fill="#fff" opacity=".8"/>`).join("")}
     <path d="M0 150 L60 120 L130 142 L200 112 L270 140 L340 118 L400 138 V250 H0z" fill="#2c2350"/>
     <rect x="176" y="80" width="26" height="100" fill="#3a2d5e"/><rect x="183" y="66" width="12" height="15" fill="#3a2d5e"/><circle cx="189" cy="61" r="4" fill="#ffd27a"/>
     <rect x="0" y="170" width="400" height="80" fill="#3a2d5e"/>${Array.from({length:14},(_,i)=>`<rect x="${14+i*28}" y="184" width="8" height="12" fill="#ffd27a" opacity="${i%3?0.9:0.35}"/>`).join("")}
     <path d="M0 150 q100 30 200 0 t200 0" stroke="#ffd27a" stroke-width="1.2" fill="none" opacity=".6"/>${Array.from({length:16},(_,i)=>`<circle cx="${i*26+8}" cy="${150+14*Math.sin((i*26+8)/400*Math.PI*2)}" r="2.6" fill="#ffd27a"/>`).join("")}
     <g transform="translate(110 206)"><rect x="0" y="6" width="120" height="26" rx="10" fill="#f0a52b"/><path d="M20 6 q10 -18 30 -18 h30 q18 0 26 18z" fill="#f0a52b"/><circle cx="26" cy="34" r="9" fill="#15142e"/><circle cx="96" cy="34" r="9" fill="#15142e"/><path d="M120 16 L190 8 L190 30z" fill="#fff4d0" opacity=".35"/></g>`;break;
   case "nightkit": g+=`${Array.from({length:30},(_,i)=>`<circle cx="${(i*53)%400}" cy="${(i*31)%120+6}" r="${i%4?1:1.8}" fill="#fff" opacity=".85"/>`).join("")}<circle cx="80" cy="54" r="16" fill="${S[2]}"/>
     <path d="M0 170 q100 -50 200 -10 q100 -40 200 0 V250 H0z" fill="#5b3b6e"/><path d="M0 205 q120 -30 240 -5 t160 0 V250 H0z" fill="#3d2a55"/>
     <g transform="translate(150 110)"><rect x="0" y="20" width="80" height="96" rx="18" fill="#1f3fbf"/><rect x="14" y="0" width="52" height="34" rx="15" fill="none" stroke="#1f3fbf" stroke-width="8"/><rect x="14" y="58" width="52" height="40" rx="8" fill="#f0a52b"/></g>
     <g transform="translate(270 132)"><path d="M10 0 h20 l6 10 h-32z" fill="#c07a22"/><rect x="6" y="10" width="28" height="40" rx="6" fill="#f5b64a"/><rect x="12" y="16" width="16" height="28" rx="4" fill="#fff4d0"/><circle cx="20" cy="30" r="34" fill="#ffd27a" opacity=".18"/></g>`;break;
   case "road": g+=sun(318,62,24)+`<path d="M0 150 L70 88 L130 128 L205 70 L285 124 L350 92 L400 118 V250 H0z" fill="#9aa8c4"/><path d="M205 70 L228 96 L214 92 L203 102 L190 92z" fill="#fff"/>
     <path d="M0 190 q100 -40 200 -10 t200 -8 V250 H0z" fill="#d7ad7c"/><path d="M-10 250 C 60 220, 150 212, 190 196 S 300 170, 410 176 L410 196 C 300 192, 250 206, 200 216 S 90 240, 60 250z" fill="#5d6470"/>
     <path d="M40 244 C 110 222, 170 214, 205 205 S 310 184, 400 186" stroke="#f5e6c8" stroke-width="2.5" stroke-dasharray="14 12" fill="none"/>
     <g transform="translate(212 150)"><path d="M0 22 q0 -22 22 -22 h70 q14 0 22 12 l14 18 v24 h-128z" fill="#1f3fbf"/><rect x="12" y="8" width="32" height="18" rx="4" fill="#cfe0ff"/><rect x="50" y="8" width="32" height="18" rx="4" fill="#cfe0ff"/><path d="M88 8 h14 l12 18 h-26z" fill="#cfe0ff"/>
     <circle cx="28" cy="54" r="10" fill="#16162a"/><circle cx="106" cy="54" r="10" fill="#16162a"/><circle cx="28" cy="54" r="4" fill="#9aa7b4"/><circle cx="106" cy="54" r="4" fill="#9aa7b4"/></g>
     ${palm(60,206,.8,"#5b6b2f")}${palm(372,196,.7,"#5b6b2f")}`;break;
   case "barber": g+=`<path d="M0 200 H400 V250 H0z" fill="#2c4f55"/>${Array.from({length:10},(_,i)=>`<path d="M${i*40} 200 l20 0 l-20 50z" fill="#24444a"/>`).join("")}
     <g transform="translate(70 40)"><rect x="0" y="0" width="34" height="150" rx="17" fill="#fff"/><clipPath id="${id}-p"><rect x="0" y="0" width="34" height="150" rx="17"/></clipPath><g clip-path="url(#${id}-p)">${Array.from({length:9},(_,i)=>`<path d="M-10 ${i*22-10} L44 ${i*22+14} L44 ${i*22+24} L-10 ${i*22}z" fill="${i%2?"#1f3fbf":"#d9536f"}"/>`).join("")}</g><rect x="-4" y="-10" width="42" height="14" rx="7" fill="#c9a24a"/><rect x="-4" y="146" width="42" height="14" rx="7" fill="#c9a24a"/></g>
     <g transform="translate(200 60)"><rect x="0" y="0" width="150" height="110" rx="55" fill="#ffffff" opacity=".85" stroke="#c9a24a" stroke-width="6"/>
     <g transform="translate(38 30) rotate(-20)"><rect x="0" y="0" width="70" height="12" rx="3" fill="#9aa7b4"/><rect x="0" y="12" width="70" height="10" rx="3" fill="#1c1b2e"/></g>
     <g transform="translate(60 62)"><circle cx="0" cy="0" r="10" fill="none" stroke="#1c1b2e" stroke-width="5"/><circle cx="30" cy="0" r="10" fill="none" stroke="#1c1b2e" stroke-width="5"/><path d="M8 -6 L46 -34 M22 -6 L-16 -34" stroke="#9aa7b4" stroke-width="5" stroke-linecap="round"/></g></g>`;break;
   case "camera": g+=sun(320,64,26)+`<path d="M0 170 L60 150 L60 110 L90 110 L90 140 L140 130 L140 90 L170 70 L200 90 L200 150 L260 140 L260 100 L290 100 L290 150 L400 160 V250 H0z" fill="#c07a44" opacity=".7"/><path d="M0 205 H400 V250 H0z" fill="#b0503f"/>
     <g transform="translate(130 96)"><rect x="0" y="16" width="140" height="92" rx="16" fill="#1c1b2e"/><rect x="18" y="4" width="40" height="18" rx="5" fill="#1c1b2e"/><rect x="104" y="26" width="18" height="10" rx="3" fill="#f0a52b"/>
     <circle cx="70" cy="62" r="34" fill="#3a3960"/><circle cx="70" cy="62" r="24" fill="#1f3fbf"/><circle cx="70" cy="62" r="12" fill="#0e0e22"/><circle cx="62" cy="54" r="5" fill="#fff" opacity=".7"/></g>
     ${palm(50,226,.8,"#5b6b2f")}${palm(360,230,.9,"#5b6b2f")}`;break;
   case "palace": g+=`<rect x="0" y="40" width="400" height="210" fill="#efe2c8"/>${Array.from({length:20},(_,i)=>`<rect x="${i*20}" y="210" width="20" height="40" fill="${i%2?"#1f6f78":"#2f8f8a"}"/><path d="M${i*20+10} 214 l8 8 l-8 8 l-8 -8z" fill="#f0c25a"/>`).join("")}
     <path d="M120 210 V120 q0 -70 80 -70 q80 0 80 70 V210z" fill="#c8a46a"/><path d="M136 210 V124 q0 -56 64 -56 q64 0 64 56 V210z" fill="#2a5a6a"/>
     <path d="M150 210 V128 q0 -44 50 -44 q50 0 50 44 V210z" fill="#8fd0d8"/><path d="M200 92 V210" stroke="#2a5a6a" stroke-width="2" opacity=".4"/>
     ${Array.from({length:7},(_,i)=>`<circle cx="${128+i*24}" cy="${50+Math.abs(3-i)*6}" r="4" fill="#1f6f78"/>`).join("")}<rect x="40" y="90" width="50" height="120" fill="#e3d2b0"/><rect x="310" y="90" width="50" height="120" fill="#e3d2b0"/>
     <path d="M48 210 V130 q0 -24 17 -24 q17 0 17 24 V210z" fill="#2a5a6a"/><path d="M318 210 V130 q0 -24 17 -24 q17 0 17 24 V210z" fill="#2a5a6a"/>`;break;
   case "garden": g+=sun(330,60,24)+`<rect x="0" y="150" width="400" height="100" fill="#d9b38c"/><rect x="160" y="80" width="80" height="120" fill="#1f3fbf"/><path d="M160 80 h80 l-10 -14 h-60z" fill="#163199"/>
     <rect x="180" y="120" width="40" height="80" rx="20" fill="#f0c25a"/><rect x="0" y="196" width="400" height="12" fill="#6ec3c9"/>
     ${palm(70,200,1.1,"#2f6d54")}${palm(110,205,.8,"#2f6d54")}${palm(320,200,1.05,"#2f6d54")}${[40,280,350].map(x=>`<g transform="translate(${x} 200)"><path d="M0 0 q-6 -30 0 -48 q6 18 0 48z" fill="#4e8a64"/><path d="M8 0 q-2 -26 8 -40 q0 20 -8 40z" fill="#4e8a64"/></g>`).join("")}`;break;
   case "baby": g+=`<path d="M0 200 H400 V250 H0z" fill="#f2c7b5"/>${sun(320,70,26)}<g transform="translate(120 80)"><path d="M0 60 q0 -60 70 -60 v60z" fill="#d9536f"/><path d="M0 60 h120 q0 40 -40 40 h-50 q-30 0 -30 -40z" fill="#1f3fbf"/><path d="M120 60 l30 -40" stroke="#1c1b2e" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="120" r="14" fill="#1c1b2e"/><circle cx="100" cy="120" r="14" fill="#1c1b2e"/><circle cx="20" cy="120" r="5" fill="#f0a52b"/><circle cx="100" cy="120" r="5" fill="#f0a52b"/></g>`;break;
  }
    return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%">${g}</svg>`;
}
