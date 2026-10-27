// Educational qualitative model, NOT a calibrated predictor of extraction yield.
export const ids=['salt','soap','ethanol','cylinder','mix','mortar','result'];
export const volume=v=>v.salt+v.soap+v.ethanol;
const empty=()=>({salt:0,soap:0,ethanol:0,tissue:0,cut:0,ground:0,mixed:0,shear:0,dna:0,released:0,filtered:false,layer:0,age:0,cold:1});
export function createLab(blank=false){
 const v=Object.fromEntries(ids.map(id=>[id,empty()]));
 Object.assign(v.salt,{salt:150});Object.assign(v.soap,{soap:150});Object.assign(v.ethanol,{ethanol:150});
 v.mortar.tissue=blank?0:30;
 return {v,blank,events:[],spilled:0};
}
export const capacities={salt:150,soap:150,ethanol:150,cylinder:50,mix:100,mortar:120,result:200};
export function transfer(lab,from,to,ml,{speed=1,wall=true,filter=false}={}){
 if(!Number.isFinite(ml)||from===to||!lab.v[from]||!lab.v[to]||['salt','soap','ethanol'].includes(to)) return 0;
 const a=lab.v[from],b=lab.v[to],av=volume(a);
 const n=Math.max(0,Math.min(ml,av,capacities[to]-volume(b)));if(!n)return 0;
 const f=n/av, ethanol=a.ethanol*f, old=volume(b), tissueBefore=b.tissue;
 for(const k of ['salt','soap','ethanol','dna']){const x=a[k]*f;a[k]-=x;b[k]+=x;}
 if(!filter){const t=a.tissue*f;a.tissue-=t;b.tissue+=t;const released=a.released*f;a.released-=released;b.released+=released;}
 b.cut=Math.max(b.cut,a.cut);b.ground=Math.max(b.ground,a.ground);b.mixed=Math.max(b.mixed,a.mixed);b.shear=Math.max(b.shear,a.shear);
 b.cold=old? (b.cold*old+a.cold*n)/(old+n):a.cold;
 if(filter){b.filtered=tissueBefore===0&&(old===0||b.filtered);a.filtered=false;}else if(a.tissue>0||!a.filtered&&ethanol<n*.99)b.filtered=false;
 if(ethanol>0&&old>0){b.layer=Math.max(0,Math.min(1,b.layer+ethanol/(old+n)*(wall&&speed<3?2:.2)));b.age=0;}
 if(speed>3&&b.dna>0){b.shear=Math.min(1,b.shear+n*.003);b.layer*=.97;}
 return n;
}
export function work(lab,id,kind,dt,intensity=1){
 const v=lab.v[id];if(!v)return;
 if(kind==='cut'&&v.tissue>0)v.cut=Math.min(1,v.cut+dt*.15);
 if(kind==='grind'&&v.tissue>0){v.ground=Math.min(1,v.ground+dt*.12*(.45+.55*v.cut));if(volume(v)>0)v.shear=Math.min(1,v.shear+dt*.04);}
 if(kind==='stir'&&volume(v)>0){v.mixed=Math.min(1,v.mixed+dt*.15);if(intensity>1){v.shear=Math.min(1,v.shear+dt*.07);v.layer*=Math.exp(-dt*.8);} }
 release(v,dt);
}
function release(v,dt){
 if(v.tissue<=0||volume(v)<=0)return;
 const extraction=(.08+.92*v.ground)*(.06+.94*Math.min(1,v.soap/10))*(.2+.8*v.mixed);
 const target=v.tissue*extraction;
 const amount=Math.max(0,target-v.released)*(1-Math.exp(-dt*.35));
 v.dna+=amount;v.released+=amount;
}
export function tick(lab,dt){for(const v of Object.values(lab.v)){release(v,dt);if(v.ethanol>0){v.age+=dt;v.layer*=Math.exp(-dt*.0015);}}}
export function observation(v){
 const vol=volume(v), e=vol?v.ethanol/vol:0;
 const salt=Math.min(1,v.salt/8);
 const precip=v.dna*(.2+.8*salt)*Math.min(1,e/.35)*(.75+.25*v.cold)*(1-Math.exp(-v.age/5));
 return {precip,filaments:precip*(1-.65*v.shear),layer:v.layer,visible:precip>.8};
}
export function describe(v){const o=observation(v);if(!volume(v))return '液体はまだ入っていません。';if(!v.ethanol)return v.filtered?'緑色のろ液。目でDNAの有無は判定できません。':'液体と試料の状態を観察しましょう。';if(!o.visible)return '目立つ白い析出物はまだ見えません。DNAがないとは断定できません。';return `${v.layer>.2?'上部のエタノールが多い領域・境界付近':'混ざった液中'}に白い${v.shear>.4?'細かな':'糸状・綿状の'}析出物。純粋なDNAとは断定できません。`;}
// Optional teacher reference, explicitly labelled: simulated protocol, not measured data.
export function referenceExperiment(blank=false){
 const lab=createLab(blank);transfer(lab,'salt','cylinder',15);transfer(lab,'cylinder','mix',15);transfer(lab,'soap','cylinder',15);transfer(lab,'cylinder','mix',15);
 for(let i=0;i<100;i++)work(lab,'mix','stir',.1);
 for(let i=0;i<80;i++)work(lab,'mortar','cut',.1);
 for(let i=0;i<120;i++)work(lab,'mortar','grind',.1);
 transfer(lab,'mix','mortar',30);for(let i=0;i<200;i++)work(lab,'mortar','stir',.1);
 transfer(lab,'mortar','result',30,{filter:true,speed:1});transfer(lab,'ethanol','cylinder',20);transfer(lab,'cylinder','result',20,{wall:true,speed:1});for(let i=0;i<150;i++)tick(lab,.1);
 lab.completed=[true,!blank,!blank,true,true,!blank];
 lab.events=['教員用参考結果：操作時間を省略して標準条件をモデルで再現（実測値ではない）','食塩水15 mL＋希釈洗剤15 mLを混合','花蕾30 gを切断・破砕（対照では試料なし）','抽出液30 mLを添加し、穏やかに混合','茶こしで30 mLろ過','冷却99％エタノール20 mLを壁面に沿わせてゆっくり添加','静置して観察'];return lab;
}
