import{p as at}from"./chunk-JWPE2WC7-DDTAgREo.js";import{L as T,O as P,b3 as nt,g as it,s as ot,a as st,b as lt,q as ct,p as pt,_ as g,l as B,c as ut,D as gt,G as dt,a2 as mt,d as ht,r as ft,E as vt}from"./GenerateV2-IeKCoVSQ.js";import{p as xt}from"./cynefin-OW5HDTMX-CrUCxUMJ.js";import{d as J}from"./arc-BCCcrJyZ.js";import{o as St}from"./ordinal-Cboi1Yqb.js";import"./index-oddxqlpg.js";import"./useModelCatalog-B0IM83K2.js";import"./SubtitleEraseRegionEditor-CA6oFeLT.js";import"./LibraryTagSelect-BUs4zczq.js";import"./index-DwN6T0ua.js";import"./index-MpGi2zBZ.js";import"./index-BimUeNvz.js";import"./ThumbnailImage.vue_vue_type_script_setup_true_lang-Do_jjyRd.js";import"./index-DoFbz81q.js";import"./index-rh5KYXC1.js";import"./index-Bu0z6IBm.js";import"./index-By9cA9N9.js";import"./index-DjP61au1.js";import"./DropdownMenuTrigger.vue_vue_type_script_setup_true_lang-Dc0tab6O.js";import"./projectHistory-jZAY0SbR.js";import"./index-BTpY9ASI.js";import"./BriefEditor.vue_vue_type_script_setup_true_lang-DZdtvzXm.js";import"./index-BuUZhfGn.js";import"./index-BhCBnESl.js";import"./PromptSaveButton-BvrUzWiz.js";import"./assetHandoffKeys-aYuruvgj.js";import"./x-B5CjJ-cg.js";import"./MaterialVideoPreview-Ct9NY8xz.js";import"./promptReferenceLabels-CqmB6YqT.js";import"./index-JIkwgIq_.js";import"./index-Dg0KXnT0.js";import"./index-B49_tFz_.js";import"./index-Dqz4KFJE.js";import"./index-CvpH7K3Y.js";import"./creationCollectionAccess-DTiNvzSy.js";import"./index-DEmpmmgN.js";import"./index-CCN6z4Zj.js";import"./init-Gi6I4Gst.js";function yt(t,n){return n<t?-1:n>t?1:n>=t?0:NaN}function wt(t){return t}function At(){var t=wt,n=yt,y=null,b=T(0),l=T(P),d=T(0);function i(e){var a,s=(e=nt(e)).length,m,w,$=0,h=new Array(s),o=new Array(s),D=+b.apply(this,arguments),z=Math.min(P,Math.max(-P,l.apply(this,arguments)-D)),k,R=Math.min(Math.abs(z)/s,d.apply(this,arguments)),p=R*(z<0?-1:1),A;for(a=0;a<s;++a)(A=o[h[a]=a]=+t(e[a],a,e))>0&&($+=A);for(n!=null?h.sort(function(M,f){return n(o[M],o[f])}):y!=null&&h.sort(function(M,f){return y(e[M],e[f])}),a=0,w=$?(z-s*p)/$:0;a<s;++a,D=k)m=h[a],A=o[m],k=D+(A>0?A*w:0)+p,o[m]={data:e[m],index:a,value:A,startAngle:D,endAngle:k,padAngle:R};return o}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:T(+e),i):t},i.sortValues=function(e){return arguments.length?(n=e,y=null,i):n},i.sort=function(e){return arguments.length?(y=e,n=null,i):y},i.startAngle=function(e){return arguments.length?(b=typeof e=="function"?e:T(+e),i):b},i.endAngle=function(e){return arguments.length?(l=typeof e=="function"?e:T(+e),i):l},i.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:T(+e),i):d},i}var Ct=vt.pie,I={sections:new Map,showData:!1},_=I.sections,V=I.showData,$t=structuredClone(Ct),Dt=g(()=>structuredClone($t),"getConfig"),Tt=g(()=>{_=new Map,V=I.showData,ft()},"clear"),bt=g(({label:t,value:n})=>{if(n<0)throw new Error(`"${t}" has invalid value: ${n}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);_.has(t)||(_.set(t,n),B.debug(`added new section: ${t}, with value: ${n}`))},"addSection"),kt=g(()=>_,"getSections"),Et=g(t=>{V=t},"setShowData"),zt=g(()=>V,"getShowData"),K={getConfig:Dt,clear:Tt,setDiagramTitle:pt,getDiagramTitle:ct,setAccTitle:lt,getAccTitle:st,setAccDescription:ot,getAccDescription:it,addSection:bt,getSections:kt,setShowData:Et,getShowData:zt},Mt=g((t,n)=>{at(t,n),n.setShowData(t.showData),t.sections.map(n.addSection)},"populateDb"),Lt={parse:g(async t=>{const n=await xt("pie",t);B.debug(n),Mt(n,K)},"parse")},Rt=g(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),Ot=Rt,Wt=g(t=>{const n=[...t.values()].reduce((l,d)=>l+d,0),y=[...t.entries()].map(([l,d])=>({label:l,value:d})).filter(l=>l.value/n*100>=1);return At().value(l=>l.value).sort(null)(y)},"createPieArcs"),_t=g((t,n,y,b)=>{var Z;B.debug(`rendering pie chart
`+t);const l=b.db,d=ut(),i=gt(l.getConfig(),d.pie),e=40,a=18,s=4,m=450,w=m,$=dt(n),h=$.append("g");h.attr("transform","translate("+w/2+","+m/2+")");const{themeVariables:o}=d;let[D]=mt(o.pieOuterStrokeWidth);D??(D=2);const z=i.legendPosition,k=i.textPosition,R=i.donutHole>0&&i.donutHole<=.9?i.donutHole:0,p=Math.min(w,m)/2-e,A=J().innerRadius(R*p).outerRadius(p),M=J().innerRadius(p*k).outerRadius(p*k),f=h.append("g");f.append("circle").attr("cx",0).attr("cy",0).attr("r",p+D/2).attr("class","pieOuterCircle");const O=l.getSections(),Q=Wt(O),Y=[o.pie1,o.pie2,o.pie3,o.pie4,o.pie5,o.pie6,o.pie7,o.pie8,o.pie9,o.pie10,o.pie11,o.pie12];let F=0;O.forEach(r=>{F+=r});const U=Q.filter(r=>(r.data.value/F*100).toFixed(0)!=="0"),G=St(Y).domain([...O.keys()]);f.selectAll("mySlices").data(U).enter().append("path").attr("d",A).attr("fill",r=>G(r.data.label)).attr("class",r=>{let c="pieCircle";return i.highlightSlice==="hover"?c+=" highlightedOnHover":i.highlightSlice===r.data.label&&(c+=" highlighted"),c}),f.selectAll("mySlices").data(U).enter().append("text").text(r=>(r.data.value/F*100).toFixed(0)+"%").attr("transform",r=>"translate("+M.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const tt=h.append("text").text(l.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),L=[...O.entries()].map(([r,c])=>({label:r,value:c})),C=h.selectAll(".legend").data(L).enter().append("g").attr("class","legend");C.append("rect").attr("width",a).attr("height",a).style("fill",r=>G(r.label)).style("stroke",r=>G(r.label)),C.append("text").attr("x",a+s).attr("y",a-s).text(r=>l.getShowData()?`${r.label} [${r.value}]`:r.label);const E=Math.max(...C.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0));let W=m,H=w+e;const u=a+s,N=L.length*u;switch(z){case"center":C.attr("transform",(r,c)=>{const v=u*L.length/2,x=-E/2-(a+s),S=c*u-v;return"translate("+x+","+S+")"});break;case"top":W+=N,C.attr("transform",(r,c)=>{const v=p,x=-E/2-(a+s),S=c*u-v;return`translate(${x}, ${S})`}),f.attr("transform",()=>`translate(0, ${N+u})`);break;case"bottom":W+=N,C.attr("transform",(r,c)=>{const v=-p-u,x=-E/2-(a+s),S=c*u-v;return"translate("+x+","+S+")"});break;case"left":H+=a+s+E,C.attr("transform",(r,c)=>{const v=u*L.length/2,x=-p-(a+s),S=c*u-v;return"translate("+x+","+S+")"}),f.attr("transform",()=>`translate(${E+a+s}, 0)`);break;case"right":default:H+=a+s+E,C.attr("transform",(r,c)=>{const v=u*L.length/2,x=12*a,S=c*u-v;return"translate("+x+","+S+")"});break}const j=((Z=tt.node())==null?void 0:Z.getBoundingClientRect().width)??0,et=w/2-j/2,rt=w/2+j/2,q=Math.min(0,et),X=Math.max(H,rt)-q;$.attr("viewBox",`${q} 0 ${X} ${W}`),ht($,W,X,i.useMaxWidth)},"draw"),Ft={draw:_t},Ce={parser:Lt,db:K,renderer:Ft,styles:Ot};export{Ce as diagram};
