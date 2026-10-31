import{p as xt}from"./chunk-JWPE2WC7-DDTAgREo.js";import{s as gt,g as $t,q as bt,p as wt,a as Ct,b as vt,_ as i,l as Y,G as Dt,d as kt,r as At,D as U,A as Q,E as Tt,X as at}from"./GenerateV2-IeKCoVSQ.js";import{p as Bt}from"./cynefin-OW5HDTMX-CrUCxUMJ.js";import"./index-oddxqlpg.js";import"./useModelCatalog-B0IM83K2.js";import"./SubtitleEraseRegionEditor-CA6oFeLT.js";import"./LibraryTagSelect-BUs4zczq.js";import"./index-DwN6T0ua.js";import"./index-MpGi2zBZ.js";import"./index-BimUeNvz.js";import"./ThumbnailImage.vue_vue_type_script_setup_true_lang-Do_jjyRd.js";import"./index-DoFbz81q.js";import"./index-rh5KYXC1.js";import"./index-Bu0z6IBm.js";import"./index-By9cA9N9.js";import"./index-DjP61au1.js";import"./DropdownMenuTrigger.vue_vue_type_script_setup_true_lang-Dc0tab6O.js";import"./projectHistory-jZAY0SbR.js";import"./index-BTpY9ASI.js";import"./BriefEditor.vue_vue_type_script_setup_true_lang-DZdtvzXm.js";import"./index-BuUZhfGn.js";import"./index-BhCBnESl.js";import"./PromptSaveButton-BvrUzWiz.js";import"./assetHandoffKeys-aYuruvgj.js";import"./x-B5CjJ-cg.js";import"./MaterialVideoPreview-Ct9NY8xz.js";import"./promptReferenceLabels-CqmB6YqT.js";import"./index-JIkwgIq_.js";import"./index-Dg0KXnT0.js";import"./index-B49_tFz_.js";import"./index-Dqz4KFJE.js";import"./index-CvpH7K3Y.js";import"./creationCollectionAccess-DTiNvzSy.js";import"./index-DEmpmmgN.js";import"./index-CCN6z4Zj.js";var rt=i(()=>({domains:new Map,transitions:[]}),"createDefaultData"),G=rt(),St=i(()=>G.domains,"getDomains"),Mt=i(()=>G.transitions,"getTransitions"),zt=i(t=>{if(t)for(const e of t){const n=e.domain,o=(e.items??[]).map(c=>({label:c.label}));G.domains.set(n,{name:n,items:o})}},"setDomains"),Lt=i(t=>{t&&(G.transitions=t.filter(e=>e.from===e.to?(Y.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},"setTransitions"),Nt=i(()=>U({...Tt.cynefin,...Q().cynefin}),"getConfig"),Pt=i(()=>{At(),G=rt()},"clear"),X={getDomains:St,getTransitions:Mt,setDomains:zt,setTransitions:Lt,getConfig:Nt,clear:Pt,setAccTitle:vt,getAccTitle:Ct,setDiagramTitle:wt,getDiagramTitle:bt,getAccDescription:$t,setAccDescription:gt},It=i(t=>{xt(t,X),X.setDomains(t.domains),X.setTransitions(t.transitions)},"populate"),Wt={parse:i(async t=>{const e=await Bt("cynefin",t);Y.debug(e),It(e)},"parse")};function V(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}i(V,"seededRandom");function it(t){let e=0;for(let n=0;n<t.length;n++){const o=t.charCodeAt(n);e=(e<<5)-e+o,e|=0}return e}i(it,"hashString");function st(t,e){return typeof t=="number"&&Number.isFinite(t)&&t!==0?t:it(e)}i(st,"resolveSeed");function ct(t,e,n,o){const c=t/2,f=o??t*.015,v=7,W=e/v,d=[];for(let a=0;a<=v;a++){const p=V(n+a*17)*f*2-f;d.push({x:c+p,y:a*W})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){const p=d[a],s=d[a+1],m=(p.y+s.y)/2,b=a%2===0?1:-1,h=f*1.5*b*V(n+a*31+7),R=p.x+h,_=m,E=s.x-h;D+=` C${R},${_} ${E},${m} ${s.x},${s.y}`}return D}i(ct,"generateFoldPath");function lt(t,e,n,o){const c=e/2,f=o??e*.015,v=7,W=t/v,d=[];for(let a=0;a<=v;a++){const p=V(n+a*23)*f*2-f;d.push({x:a*W,y:c+p})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){const p=d[a],s=d[a+1],m=(p.x+s.x)/2,b=a%2===0?1:-1,h=f*1.5*b*V(n+a*37+11),R=m,_=p.y+h,E=m,z=s.y-h;D+=` C${R},${_} ${E},${z} ${s.x},${s.y}`}return D}i(lt,"generateHorizontalBoundary");function dt(t,e){const n=t/2,o=e*.5,c=e,f=t*.03;return[`M${n},${o}`,`C${n+f},${o+(c-o)*.2}`,`${n-f*1.5},${o+(c-o)*.55}`,`${n+f*.5},${o+(c-o)*.75}`,`C${n-f},${o+(c-o)*.85}`,`${n+f*.3},${o+(c-o)*.95}`,`${n},${c}`].join(" ")}i(dt,"generateCliffPath");function mt(t,e,n,o){return[`M${t-n},${e}`,`A${n},${o} 0 1,1 ${t+n},${e}`,`A${n},${o} 0 1,1 ${t-n},${e}`,"Z"].join(" ")}i(mt,"generateConfusionPath");var ot={complex:{model:"Probe → Sense → Respond",practice:"Emergent Practices"},complicated:{model:"Sense → Analyse → Respond",practice:"Good Practices"},clear:{model:"Sense → Categorise → Respond",practice:"Best Practices"},chaotic:{model:"Act → Sense → Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},Rt=i((t,e)=>{const n=t/2,o=e/2;return{complex:{cx:n/2,cy:o/2,x:0,y:0,w:n,h:o},complicated:{cx:n+n/2,cy:o/2,x:n,y:0,w:n,h:o},chaotic:{cx:n/2,cy:o+o/2,x:0,y:o,w:n,h:o},clear:{cx:n+n/2,cy:o+o/2,x:n,y:o,w:n,h:o},confusion:{cx:n,cy:o,x:n*.7,y:o*.7,w:n*.6,h:o*.6}}},"getDomainLayouts"),_t=i(()=>{const t=at(),e=Q();return U(t,e.themeVariables).cynefin},"getCynefinDomainColors"),q=3,Et=i((t,e,n,o)=>{const c=o.db,f=c.getDomains(),v=c.getTransitions(),W=c.getDiagramTitle(),d=c.getAccTitle(),D=c.getAccDescription(),a=c.getConfig(),p=_t();Y.debug("Rendering Cynefin diagram");const s=a.width,m=a.height,b=a.padding,h=a.showDomainDescriptions,R=a.boundaryAmplitude,_=s+b*2,E=m+b*2,z={complex:p.complexBg,complicated:p.complicatedBg,clear:p.clearBg,chaotic:p.chaoticBg,confusion:p.confusionBg},k=Dt(e);kt(k,E,_,a.useMaxWidth??!0),k.attr("viewBox",`0 0 ${_} ${E}`),d&&k.append("title").text(d),D&&k.append("desc").text(D);const A=k.append("g").attr("transform",`translate(${b}, ${b})`),F=Rt(s,m),Z=st(a.seed,e),ft=A.append("g").attr("class","cynefin-backgrounds"),O=["complex","complicated","chaotic","clear"];for(const l of O){const r=F[l];ft.append("rect").attr("class","cynefinDomain").attr("x",r.x).attr("y",r.y).attr("width",r.w).attr("height",r.h).attr("fill",z[l]).attr("fill-opacity",.4).attr("stroke","none")}const j=A.append("g").attr("class","cynefin-boundaries");j.append("path").attr("class","cynefinBoundary").attr("d",ct(s,m,Z,R)).attr("fill","none"),j.append("path").attr("class","cynefinBoundary").attr("d",lt(s,m,Z+100,R)).attr("fill","none"),j.append("path").attr("class","cynefinCliff").attr("d",dt(s,m)).attr("fill","none");const pt=s*.15,yt=m*.15;A.append("path").attr("class","cynefinConfusion").attr("d",mt(s/2,m/2,pt,yt)).attr("fill",z.confusion).attr("fill-opacity",.5);const J=A.append("g").attr("class","cynefin-labels");for(const l of O){const r=F[l];J.append("text").attr("class","cynefinDomainLabel").attr("x",r.cx).attr("y",h?r.cy-30:r.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(l.charAt(0).toUpperCase()+l.slice(1))}if(J.append("text").attr("class","cynefinDomainLabel").attr("x",s/2).attr("y",h?m/2-10:m/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),h){const l=A.append("g").attr("class","cynefin-subtitles");for(const r of O){const u=F[r],y=ot[r];l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.model),l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.practice)}l.append("text").attr("class","cynefinSubtitle").attr("x",s/2).attr("y",m/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(ot.confusion.practice)}const K=A.append("g").attr("class","cynefin-items"),T=26,tt=10,ut=["complex","complicated","chaotic","clear","confusion"];for(const l of ut){const r=f.get(l);if(!r||r.items.length===0)continue;const u=F[l],y=l==="confusion";let L=r.items,N=0;y&&r.items.length>q&&(N=r.items.length-q,L=r.items.slice(0,q));let B;if(y){const g=h?22:14;B=u.cy+g}else B=u.cy+(h?25:15);if([...L].forEach((g,S)=>{const w=B+S*(T+4),M=K.append("g"),P=M.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",T/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(g.label);let $=g.label.length*7;const x=P.node();if(x&&typeof x.getBBox=="function"){const H=x.getBBox();H.width>0&&($=H.width)}const C=$+tt*2,I=u.cx-C/2;M.attr("transform",`translate(${I}, ${w})`),M.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",C).attr("height",T).attr("rx",4).attr("ry",4).attr("fill",z[l]).attr("fill-opacity",.95),P.attr("x",C/2).attr("y",T/2)}),N>0){const g=B+L.length*(T+4),S=`+${N} more`,w=K.append("g"),M=w.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",T/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(S);let P=S.length*7;const $=M.node();if($&&typeof $.getBBox=="function"){const I=$.getBBox();I.width>0&&(P=I.width)}const x=P+tt*2,C=u.cx-x/2;w.attr("transform",`translate(${C}, ${g})`),w.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",x).attr("height",T).attr("rx",4).attr("ry",4).attr("fill",z[l]).attr("fill-opacity",.6),M.attr("x",x/2).attr("y",T/2)}}if(v.length>0){const l=k.select("defs").empty()?k.append("defs"):k.select("defs"),r=`cynefin-arrow-${e}`;l.append("marker").attr("id",r).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");const u=A.append("g").attr("class","cynefin-arrows");v.forEach(y=>{const L=F[y.from],N=F[y.to];if(!L||!N)return;if(y.from===y.to){Y.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}const B=L.cx,g=L.cy,S=N.cx,w=N.cy,M=(B+S)/2,P=(g+w)/2,$=S-B,x=w-g,C=Math.sqrt($*$+x*x),I=C*.15,H=-x/C,ht=$/C,et=M+H*I,nt=P+ht*I;u.append("path").attr("class","cynefinArrowLine").attr("d",`M${B},${g} Q${et},${nt} ${S},${w}`).attr("fill","none").attr("marker-end",`url(#${r})`),y.label&&u.append("text").attr("class","cynefinArrowLabel").attr("x",et).attr("y",nt-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(y.label)})}W&&A.append("text").attr("class","cynefinTitle").attr("x",s/2).attr("y",-b/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(W)},"draw"),Ft={draw:Et},Vt=i(()=>{const t=at(),e=Q();return U(t,e.themeVariables).cynefin},"getCynefinTheme"),Gt=i(()=>{const t=Vt();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${t.domainFontSize}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${t.itemFontSize}px;
		fill: ${t.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${t.boundaryColor};
		stroke-width: ${t.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${t.cliffColor};
		stroke-width: ${t.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${t.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${t.arrowColor};
		stroke-width: ${t.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${t.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
	}
	.cynefinTitle {
		font-size: ${t.domainFontSize+2}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	`},"styles"),Ht=Gt,ke={parser:Wt,db:X,renderer:Ft,styles:Ht};export{ke as diagram};
