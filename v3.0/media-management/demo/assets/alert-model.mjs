// Synthetic fixtures for the product prototype. No platform requests.
export const DEMO_DATE = '2026-10-29';
export const kindNames = {risk:'异常', opportunity:'机会', volume:'起量', system:'数据提醒'};
export const templates = [
  { key:'waste', name:'消耗未产生转化', kind:'risk', metric:'消耗 ≥', threshold:300, unit:'元', description:'已有消耗，等待回传后仍未产生目标转化。', guard:'等待回传至少 2 小时；目标转化数 = 0' },
  { key:'cpa', name:'转化成本偏高', kind:'risk', metric:'转化成本 >', threshold:80, unit:'元', description:'消耗和转化数达到门槛，再判断成本是否超标。', guard:'目标转化数 ≥ 10；消耗 ≥ 300 元' },
  { key:'roi', name:'支付 ROI 偏低', kind:'risk', metric:'支付 ROI <', threshold:1.5, unit:'', description:'按支付金额与消耗汇总计算，关注回收不足。', guard:'支付订单数 ≥ 10；消耗 ≥ 300 元' },
  { key:'winner', name:'优质素材发现', kind:'opportunity', metric:'支付 ROI ≥', threshold:2.5, unit:'', description:'发现值得继续观察与复用的内容。', guard:'支付订单数 ≥ 20；消耗 ≥ 500 元' },
  { key:'volume_start', name:'开始起量', kind:'volume', metric:'近 2 小时消耗 ≥', threshold:200, unit:'元', description:'前一时段未达门槛，本时段跨过起量线。', guard:'完整 4 小时；前 2 小时消耗低于当前门槛' },
  { key:'volume_growth', name:'持续放量', kind:'volume', metric:'近 2 小时消耗增幅 ≥', threshold:50, unit:'%', description:'已有一定量级，继续关注消耗增长及同期效果。', guard:'完整 4 小时；前 2 小时 ≥ 100 元；近 2 小时 ≥ 200 元' },
  { key:'volume_stalled', name:'尚未起量', kind:'volume', metric:'近 2 小时消耗 <', threshold:100, unit:'元', description:'投放一段时间后仍未达到观察量级，提醒业务核查。', guard:'已连续投放 ≥ 6 小时；历史 2 小时窗口均未达 200 元' },
  { key:'volume_drop', name:'量级回落', kind:'volume', metric:'近 2 小时消耗降幅 ≥', threshold:30, unit:'%', description:'已有量级明显下降，结合效果与投放设置检查。', guard:'完整 4 小时；前 2 小时消耗 ≥ 200 元' },
];
export const materials = [
  { id:'MAT-1001', name:'轻盈防晒 · 场景讲解版', account:'星河主账户', advertiser:'AD-DEMO-01', spend:680, conversions:0, orders:0, revenue:0, hours:3, fresh:true, color:'sand', duration:'00:28' },
  { id:'MAT-1002', name:'夏日防晒 · 产品对比版', account:'星河主账户', advertiser:'AD-DEMO-01', spend:1360, conversions:12, orders:12, revenue:1224, hours:4, fresh:true, color:'blue', duration:'00:32' },
  { id:'MAT-1003', name:'通勤防晒 · 体验分享版', account:'星河测试账户', advertiser:'AD-DEMO-02', spend:1680, conversions:20, orders:20, revenue:1848, hours:4, fresh:true, color:'olive', duration:'00:25' },
  { id:'MAT-1004', name:'轻盈防晒 · 真人试用版', account:'星河主账户', advertiser:'AD-DEMO-01', spend:960, conversions:32, orders:32, revenue:3168, hours:4, fresh:true, color:'rose', duration:'00:36' },
  { id:'MAT-1005', name:'户外防晒 · 三秒开场版', account:'星河测试账户', advertiser:'AD-DEMO-02', spend:80, conversions:1, orders:1, revenue:99, hours:1, fresh:true, color:'sand', duration:'00:19' },
  { id:'MAT-1006', name:'防晒清单 · 多场景版', account:'星河测试账户', advertiser:'AD-DEMO-02', spend:520, conversions:null, orders:null, revenue:null, hours:3, fresh:false, color:'blue', duration:'00:30' },
];
// Hourly spend is synthetic and totals to each material's spend. Only closed
// windows are compared: 09:00–11:00 and 11:00–13:00 (Asia/Shanghai).
const volumeFixtures = [
  [60,80,100,120,160,160], [200,220,240,260,220,220],
  [400,420,280,260,160,160], [40,60,100,160,260,340],
  [0,0,0,10,20,50], [100,120,160,140,null,null],
];
materials.forEach((m,i)=>Object.assign(m,{hourly:volumeFixtures[i],liveHours:6,project:'防晒新品创作',creator:i%2?'成员 B':'成员 C'}));
materials.push(
  {id:'MAT-1007',name:'轻盈防晒 · 户外实测版',account:'星河主账户',advertiser:'AD-DEMO-01',spend:420,conversions:10,orders:10,revenue:798,hours:3,fresh:true,color:'olive',duration:'00:27',hourly:[20,30,40,50,130,150],liveHours:6,project:'防晒新品创作',creator:'成员 B'},
  {id:'MAT-1008',name:'新品防晒 · 通勤开场版',account:'星河测试账户',advertiser:'AD-DEMO-02',spend:80,conversions:null,orders:null,revenue:null,hours:0,fresh:true,color:'rose',duration:'00:22',hourly:[null,null,null,null,30,50],liveHours:2,project:null,creator:null},
);
export function volumeFacts(m){
  const values=m.hourly||[];
  const valid=x=>Number.isFinite(x)&&x>=0;
  if(!m.fresh)return {ready:false,reason:'数据延迟',state:'数据延迟'};
  if(!Number.isFinite(m.liveHours)||m.liveHours<0)return {ready:false,reason:'缺少有效投放时长',state:'暂不判断'};
  if(m.liveHours<4)return {ready:false,reason:'投放不足 4 小时',state:'观察中'};
  if(values.length<4||!values.slice(-4).every(valid))return {ready:false,reason:'小时数据不完整',state:'暂不判断'};
  const recent=values.slice(-2).reduce((a,b)=>a+b,0),previous=values.slice(-4,-2).reduce((a,b)=>a+b,0);
  const delta=previous>0?(recent-previous)/previous*100:null;
  const windows=values.slice(1).map((v,i)=>valid(v)&&valid(values[i])?v+values[i]:null).filter(valid);
  const peak=values.length>=m.liveHours&&values.every(valid)?Math.max(...windows,0):null;
  const state=recent>=200&&previous<200?'开始起量':previous>=200&&delta<=-30?'量级回落':previous>=100&&recent>=200&&delta>=50?'持续放量':m.liveHours>=6&&peak!==null&&peak<200&&recent<100?'尚未起量':'持续投放';
  return {ready:true,recent,previous,delta,peak,state};
}
export function matchesVolume(key,threshold,m){
  const x=volumeFacts(m);
  if(!x.ready)return false;
  if(key==='volume_start')return x.recent>=threshold&&x.previous<threshold;
  if(key==='volume_growth')return x.previous>=100&&x.recent>=200&&x.delta>=threshold;
  if(key==='volume_stalled')return m.liveHours>=6&&x.peak!==null&&x.peak<200&&x.recent<threshold;
  if(key==='volume_drop')return x.previous>=200&&x.delta!==null&&-x.delta>=threshold;
  return false;
}

export function evaluate(templateKey, threshold, scope='all') {
  const t=templates.find(x=>x.key===templateKey);
  if (!t || !Number.isFinite(Number(threshold)) || Number(threshold)<=0) return {hits:[], excluded:[], error:'请输入大于 0 的阈值'};
  const eligible=materials.filter(m=>scope==='all'||m.advertiser===scope), hits=[], excluded=[];
  for(const m of eligible){
    if(t.kind==='volume'){
      const x=volumeFacts(m);
      if(!x.ready){excluded.push({id:m.id,reason:x.reason});continue;}
      if(matchesVolume(t.key,Number(threshold),m))hits.push(m.id);
      continue;
    }
    if(!m.fresh||m.conversions===null||m.revenue===null){excluded.push({id:m.id,reason:'数据延迟或字段缺失'});continue;}
    const cpa=m.conversions>0?m.spend/m.conversions:null, roi=m.spend>0?m.revenue/m.spend:null;
    const ready=t.key==='waste'?m.hours>=2:t.key==='winner'?m.orders>=20&&m.spend>=500:t.key==='roi'?m.orders>=10&&m.spend>=300:m.conversions>=10&&m.spend>=300;
    if(!ready){excluded.push({id:m.id,reason:'未达到样本或回传等待门槛'});continue;}
    const matched=t.key==='waste'?m.spend>=threshold&&m.conversions===0:t.key==='cpa'?cpa>threshold:t.key==='roi'?roi<threshold:roi>=threshold;
    if(matched)hits.push(m.id);
  }
  return {hits,excluded,error:null};
}
export function seedRules(){return templates.map((t,i)=>({id:`RULE-${i+1}`,template:t.key,name:t.name,threshold:t.threshold,scope:'all',enabled:true}));}
export function seedEvents(){const events=[
  {id:'ALT-001',materialId:'MAT-1001',template:'waste',ruleId:'RULE-1',condition:'消耗 ≥ ¥300 且目标转化数 = 0',value:'¥680 / 0 次',label:'消耗 / 目标转化',kind:'risk',level:'高',metricState:'异常',handling:'待处理',owner:'未分配',time:'13:05',logs:[]},
  {id:'ALT-002',materialId:'MAT-1002',template:'cpa',ruleId:'RULE-2',condition:'转化成本 > ¥80，目标转化数 ≥ 10',value:'¥113.33',label:'目标转化成本',kind:'risk',level:'高',metricState:'异常',handling:'待处理',owner:'未分配',time:'13:05',logs:[]},
  {id:'ALT-003',materialId:'MAT-1003',template:'roi',ruleId:'RULE-3',condition:'支付 ROI < 1.50，支付订单数 ≥ 10',value:'1.10',label:'支付 ROI',kind:'risk',level:'中',metricState:'异常',handling:'处理中',owner:'用户 A',time:'12:05',logs:[{time:'12:16',text:'用户 A 领取处理，待检查投放设置与素材。'}]},
  {id:'ALT-004',materialId:'MAT-1004',template:'winner',ruleId:'RULE-4',condition:'支付 ROI ≥ 2.50，支付订单数 ≥ 20',value:'3.30',label:'支付 ROI',kind:'opportunity',level:'机会',metricState:'达标',handling:'待处理',owner:'未分配',time:'13:05',logs:[]},
  {id:'ALT-005',materialId:'MAT-1006',template:'data',ruleId:null,condition:'应到数据超过 2 小时未更新',value:'3 小时',label:'数据延迟',kind:'system',level:'数据',metricState:'无法判断',handling:'待处理',owner:'未分配',time:'13:05',logs:[]},
];
for(const [i,key,id,owner] of [[6,'volume_start','MAT-1007','未分配'],[7,'volume_growth','MAT-1004','成员 B'],[8,'volume_stalled','MAT-1005','未分配'],[9,'volume_drop','MAT-1003','成员 C']]){
  const m=materials.find(x=>x.id===id),t=templates.find(x=>x.key===key),x=volumeFacts(m);
  events.push({id:`ALT-00${i}`,materialId:id,template:key,ruleId:`RULE-${templates.indexOf(t)+1}`,condition:`${t.metric} ${t.threshold} ${t.unit}；${t.guard}`,value:key==='volume_growth'||key==='volume_drop'?`${x.delta>0?'+':''}${x.delta.toFixed(1)}%`:`¥${x.recent}`,label:key==='volume_growth'||key==='volume_drop'?'近 2 小时较前 2 小时':'11:00–13:00 消耗',kind:'volume',level:'业务关注',metricState:x.state,handling:'待处理',owner,time:'13:05',logs:[]});
}
return events.map(e=>({...e,owner:e.owner==='用户 A'?'成员 A':e.owner,logs:e.logs.map(l=>({...l,text:l.text.replace('用户 A','成员 A')}))}));}
