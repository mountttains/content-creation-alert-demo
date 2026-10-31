import{p as I}from"./chunk-JWPE2WC7-DDTAgREo.js";import{s as _,g as E,q as D,p as F,a as G,b as P,_ as c,G as z,r as B,D as w,A as C,E as W,l as b,X as V,d as H}from"./GenerateV2-IeKCoVSQ.js";import{p as X}from"./cynefin-OW5HDTMX-CrUCxUMJ.js";import"./index-oddxqlpg.js";import"./useModelCatalog-B0IM83K2.js";import"./SubtitleEraseRegionEditor-CA6oFeLT.js";import"./LibraryTagSelect-BUs4zczq.js";import"./index-DwN6T0ua.js";import"./index-MpGi2zBZ.js";import"./index-BimUeNvz.js";import"./ThumbnailImage.vue_vue_type_script_setup_true_lang-Do_jjyRd.js";import"./index-DoFbz81q.js";import"./index-rh5KYXC1.js";import"./index-Bu0z6IBm.js";import"./index-By9cA9N9.js";import"./index-DjP61au1.js";import"./DropdownMenuTrigger.vue_vue_type_script_setup_true_lang-Dc0tab6O.js";import"./projectHistory-jZAY0SbR.js";import"./index-BTpY9ASI.js";import"./BriefEditor.vue_vue_type_script_setup_true_lang-DZdtvzXm.js";import"./index-BuUZhfGn.js";import"./index-BhCBnESl.js";import"./PromptSaveButton-BvrUzWiz.js";import"./assetHandoffKeys-aYuruvgj.js";import"./x-B5CjJ-cg.js";import"./MaterialVideoPreview-Ct9NY8xz.js";import"./promptReferenceLabels-CqmB6YqT.js";import"./index-JIkwgIq_.js";import"./index-Dg0KXnT0.js";import"./index-B49_tFz_.js";import"./index-Dqz4KFJE.js";import"./index-CvpH7K3Y.js";import"./creationCollectionAccess-DTiNvzSy.js";import"./index-DEmpmmgN.js";import"./index-CCN6z4Zj.js";var x={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},y=32,A={axes:[],curves:[],options:x},g=structuredClone(A),j=W.radar,U=c(()=>w({...j,...C().radar}),"getConfig"),M=c(()=>g.axes,"getAxes"),q=c(()=>g.curves,"getCurves"),K=c(()=>g.options,"getOptions"),N=c(a=>{g.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),Y=c(a=>{g.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:Z(t.entries)}))},"setCurves"),Z=c(a=>{if(a[0].axis==null)return a.map(e=>e.value);const t=M();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const r=a.find(s=>{var o;return((o=s.axis)==null?void 0:o.$refText)===e.name});if(r===void 0)throw new Error("Missing entry for axis "+e.label);return r.value})},"computeCurveEntries"),J=c(a=>{var e,r,s,o,l;const t=a.reduce((n,i)=>(n[i.name]=i,n),{});g.options={showLegend:((e=t.showLegend)==null?void 0:e.value)??x.showLegend,ticks:((r=t.ticks)==null?void 0:r.value)??x.ticks,max:((s=t.max)==null?void 0:s.value)??x.max,min:((o=t.min)==null?void 0:o.value)??x.min,graticule:((l=t.graticule)==null?void 0:l.value)??x.graticule},g.options.ticks>y&&(b.warn(`Radar diagram ticks (${g.options.ticks}) exceeds maximum allowed (${y}). Using ${y} instead.`),g.options.ticks=y)},"setOptions"),Q=c(()=>{B(),g=structuredClone(A)},"clear"),$={getAxes:M,getCurves:q,getOptions:K,setAxes:N,setCurves:Y,setOptions:J,getConfig:U,clear:Q,setAccTitle:P,getAccTitle:G,setDiagramTitle:F,getDiagramTitle:D,getAccDescription:E,setAccDescription:_},tt=c(a=>{I(a,$);const{axes:t,curves:e,options:r}=a;$.setAxes(t),$.setCurves(e),$.setOptions(r)},"populate"),et={parse:c(async a=>{const t=await X("radar",a);b.debug(t),tt(t)},"parse")},at=c((a,t,e,r)=>{const s=r.db,o=s.getAxes(),l=s.getCurves(),n=s.getOptions(),i=s.getConfig(),p=s.getDiagramTitle(),m=z(t),d=rt(m,i),u=n.max??Math.max(...l.map(f=>Math.max(...f.entries))),h=n.min,v=Math.min(i.width,i.height)/2;st(d,o,v,n.ticks,n.graticule),ot(d,o,v,i),L(d,o,l,h,u,n.graticule,i),k(d,l,n.showLegend,i),d.append("text").attr("class","radarTitle").text(p).attr("x",0).attr("y",-i.height/2-i.marginTop)},"draw"),rt=c((a,t)=>{const e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,s={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return H(a,r,e,t.useMaxWidth??!0),a.attr("viewBox",`0 0 ${e} ${r}`).attr("overflow","visible"),a.append("g").attr("transform",`translate(${s.x}, ${s.y})`)},"drawFrame"),st=c((a,t,e,r,s)=>{if(s==="circle")for(let o=0;o<r;o++){const l=e*(o+1)/r;a.append("circle").attr("r",l).attr("class","radarGraticule")}else if(s==="polygon"){const o=t.length;for(let l=0;l<r;l++){const n=e*(l+1)/r,i=t.map((p,m)=>{const d=2*m*Math.PI/o-Math.PI/2,u=n*Math.cos(d),h=n*Math.sin(d);return`${u},${h}`}).join(" ");a.append("polygon").attr("points",i).attr("class","radarGraticule")}}},"drawGraticule"),ot=c((a,t,e,r)=>{const s=t.length;for(let o=0;o<s;o++){const l=t[o].label,n=2*o*Math.PI/s-Math.PI/2,i=Math.cos(n),p=Math.sin(n);a.append("line").attr("x1",0).attr("y1",0).attr("x2",e*r.axisScaleFactor*i).attr("y2",e*r.axisScaleFactor*p).attr("class","radarAxisLine");const m=i>.01?"start":i<-.01?"end":"middle",d=p>.01?"hanging":p<-.01?"auto":"central",u=4;a.append("text").text(l).attr("x",e*r.axisLabelFactor*i+u*i).attr("y",e*r.axisLabelFactor*p+u*p).attr("text-anchor",m).attr("dominant-baseline",d).attr("class","radarAxisLabel")}},"drawAxes");function L(a,t,e,r,s,o,l){const n=t.length,i=Math.min(l.width,l.height)/2;e.forEach((p,m)=>{if(p.entries.length!==n)return;const d=p.entries.map((u,h)=>{const v=2*Math.PI*h/n-Math.PI/2,f=T(u,r,s,i),O=f*Math.cos(v),R=f*Math.sin(v);return{x:O,y:R}});o==="circle"?a.append("path").attr("d",S(d,l.curveTension)).attr("class",`radarCurve-${m}`):o==="polygon"&&a.append("polygon").attr("points",d.map(u=>`${u.x},${u.y}`).join(" ")).attr("class",`radarCurve-${m}`)})}c(L,"drawCurves");function T(a,t,e,r){const s=Math.min(Math.max(a,t),e);return r*(s-t)/(e-t)}c(T,"relativeRadius");function S(a,t){const e=a.length;let r=`M${a[0].x},${a[0].y}`;for(let s=0;s<e;s++){const o=a[(s-1+e)%e],l=a[s],n=a[(s+1)%e],i=a[(s+2)%e],p={x:l.x+(n.x-o.x)*t,y:l.y+(n.y-o.y)*t},m={x:n.x-(i.x-l.x)*t,y:n.y-(i.y-l.y)*t};r+=` C${p.x},${p.y} ${m.x},${m.y} ${n.x},${n.y}`}return`${r} Z`}c(S,"closedRoundCurve");function k(a,t,e,r){if(!e)return;const s=(r.width/2+r.marginRight)*3/4,o=-(r.height/2+r.marginTop)*3/4,l=20;t.forEach((n,i)=>{const p=a.append("g").attr("transform",`translate(${s}, ${o+i*l})`);p.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${i}`),p.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(n.label)})}c(k,"drawLegend");var nt={draw:at},it=c((a,t)=>{let e="";for(let r=0;r<a.THEME_COLOR_LIMIT;r++){const s=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${s};
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
		}
		`}return e},"genIndexStyles"),lt=c(a=>{const t=V(),e=C(),r=w(t,e.themeVariables),s=w(r.radar,a);return{themeVariables:r,radarOptions:s}},"buildRadarStyleOptions"),ct=c(({radar:a}={})=>{const{themeVariables:t,radarOptions:e}=lt(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${it(t,e)}
	`},"styles"),jt={parser:et,db:$,renderer:nt,styles:ct};export{jt as diagram};
