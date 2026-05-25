import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import {
  LayoutDashboard, Users, UserPlus, MessageSquare, Tag, CalendarClock,
  Building2, BarChart3, Settings, Phone, CreditCard, Calendar, Package,
  Plus, Trash2, Check, X, ArrowLeft, Search, Clipboard, Sparkles,
  TrendingUp, Wallet, Gift, ChevronDown, ChevronUp, Info, Receipt,
  User, Send, Copy, MapPin, Award, ChevronRight, Layers, DollarSign,
  Download, RefreshCw, FileText, Pencil
} from "lucide-react";

const FONT = `'Be Vietnam Pro','Segoe UI',system-ui,sans-serif`;
const T = 1e6;
const C = { bg:"#04111e", card:"#071e35", line:"#0d3058", inputBg:"#030e1a", accent:"#1f995a", text:"#eaf4ff", sub:"#8fb0cc", dim:"#5e84a3" };
const inp = { boxSizing:"border-box",width:"100%",padding:"12px 13px",borderRadius:11,border:`1.5px solid ${C.line}`,background:C.inputBg,color:C.text,fontSize:15,fontFamily:FONT,outline:"none" };
const box = { background:C.card,border:`1.5px solid ${C.line}`,borderRadius:14,padding:16,marginBottom:14 };

const PHAN_CAP = {
  caocap:{ten:"Cao cấp",luong:15}, cap1:{ten:"Cấp 1",luong:13},
  cap2:{ten:"Cấp 2",luong:11}, cap3:{ten:"Cấp 3",luong:9}, cap4:{ten:"Cấp 4",luong:7},
};
const LOAI_DV = {
  le:{ten:"Khách lẻ"}, doan:{ten:"Khách đoàn"}, thaisan:{ten:"Thai sản"},
  vaccine:{ten:"Vaccine"}, covid:{ten:"Xét nghiệm Covid"}, ivf:{ten:"IVF"},
  mau:{ten:"Lưu trữ máu cuống rốn"}, shira:{ten:"Shira"},
  asahi:{ten:"Asahi (không HH)"}, baohiem:{ten:"Thẻ bảo hiểm (không HH)"},
};
const THUONG_NAM=[{tu:0,pct:0},{tu:100,pct:0.2},{tu:150,pct:0.35},{tu:200,pct:0.45},{tu:250,pct:0.5}];
const TRANG_THAI = {
  tiemNang:{ten:"Tiềm năng",mau:"#7da2c0"}, dangTuVan:{ten:"Đang tư vấn",mau:"#f0b429"},
  daChot:{ten:"Đã chốt",mau:"#1f995a"}, daKham:{ten:"Đã khám",mau:"#4ea8de"},
};
const BAC_LE = [{tu:0,den:10,pct:0},{tu:10,den:200,pct:1.5},{tu:200,den:500,pct:2.5},{tu:500,den:700,pct:3.5},{tu:700,den:Infinity,pct:5}];
const THUONG_TH = [{tu:0,pct:0},{tu:100,pct:0.5},{tu:150,pct:0.7},{tu:200,pct:1},{tu:250,pct:1.2}];

const uid = (p="") => p+Date.now()+Math.random().toString(36).slice(2,5);
const fmt = (v) => Math.round(v||0).toLocaleString("vi-VN")+"đ";
const fmtTr = (t) => (Number(t)||0).toLocaleString("vi-VN")+"tr";
const luyTien = (v,bac) => { let s=0; for(const b of bac) if(v>b.tu) s+=(Math.min(v,b.den)-b.tu)*b.pct/100; return s; };
const pctMoc = (v,bac) => { let p=0; for(const b of bac) if(v>=b.tu) p=b.pct; return p; };
function lcThucHuong(lc,p){ if(p<=30)return lc*(p/100); if(p<=50)return lc*.5; if(p<=80)return lc*.8; if(p<=100)return lc; return lc*(p/100); }
function hhTSGoi(n){ let s=0; s+=Math.min(n,30)*1e5; s+=Math.min(Math.max(n-30,0),20)*2.5e5; s+=Math.max(n-50,0)*5e5; return s; }
function tinhDTT(k){ if(k.dungTat) return Number(k.dttTat)||0; const g=Number(k.doanhThuGop)||0; return Math.max(g-(Number(k.cpThuoc)||0)-(Number(k.cpBacSi)||0)-(Number(k.cpRuiRo)||0)-(Number(k.cpKhac)||0),0); }
function hhKhach(k){
  const d=tinhDTT(k); const L=k.loai;
  if(L==="le") return luyTien(d,BAC_LE)*T;
  if(L==="doan") return d*(k.doanGiamCao?.5:1)/100*T;
  if(L==="vaccine"||L==="shira") return d*.03*T;
  if(L==="covid") return d*.02*T;
  if(L==="ivf") return (Number(k.soIcsi)||0)*3*T;
  if(L==="thaisan") return hhTSGoi(Number(k.soGoiThuong)||0)+(Number(k.soBabymoon)||0)*1e6+(Number(k.soBabymoonVip)||0)*1.5e6;
  if(L==="mau") return (Number(k.soMauNgan)||0)*5e5+(Number(k.soMauDai)||0)*1e6;
  return 0;
}
function dttXLC(k){ if(["asahi","baohiem","shira"].includes(k.loai))return 0; let d=tinhDTT(k); if(k.tuCtv)d*=.5; return d; }

const LS="hosp_crm_v2";
const DEF = {
  caiDat:{cap:"cap4",chiTieu:300},
  goiKham:[{id:"g1",ten:"Cơ bản",gia:1.5},{id:"g2",ten:"Tiêu chuẩn",gia:3.5},{id:"g3",ten:"Nâng cao",gia:7},{id:"g4",ten:"Tổng quát",gia:10},{id:"g5",ten:"Luxury",gia:20}],
  khach:[
    {id:"k1",ten:"Nguyễn Văn An",sdt:"0912000111",loai:"le",trangThai:"daKham",doanhThuGop:80,cpThuoc:12,cpBacSi:0,cpRuiRo:0,cpKhac:3,ngay:"2026-05-12",ghiChu:"Khách thân thiết"},
    {id:"k2",ten:"Cty TNHH Minh Anh",sdt:"0987654321",loai:"doan",trangThai:"daChot",doanhThuGop:200,cpThuoc:20,cpBacSi:10,cpRuiRo:0,cpKhac:5,doanGiamCao:false,ngay:"2026-05-15",soNguoi:40},
    {id:"k3",ten:"Chị Lê Thu Hà",sdt:"0905111222",loai:"thaisan",trangThai:"dangTuVan",soGoiThuong:5,soBabymoon:1,soBabymoonVip:0,ngay:"2026-05-18",ghiChu:"Cần tư vấn thêm gói VIP"},
  ],
  lienHe:[
    {id:"l1",khachId:"k1",ngay:"2026-05-12",loai:"goi",noiDung:"Tư vấn gói khám, khách đồng ý"},
    {id:"l2",khachId:"k3",ngay:"2026-05-18",loai:"zalo",noiDung:"Gửi báo giá gói thai sản Babymoon"},
  ],
  mauTin:[
    {id:"m1",ten:"Chào mừng",noiDung:"Chào anh/chị {ten}, em là CBKD BV Phương Đông, rất vui được hỗ trợ ạ 🌸"},
    {id:"m2",ten:"Nhắc lịch",noiDung:"Dạ anh/chị {ten} ơi, em nhắc lịch khám ngày {ngay} tại BV Phương Đông ạ!"},
    {id:"m3",ten:"Cảm ơn sau khám",noiDung:"Chào anh/chị {ten}, cảm ơn đã tin tưởng BV Phương Đông! Có gì cần hỗ trợ anh/chị cứ nhắn em nhé ạ 🙏"},
  ],
  uuDai:[
    {id:"u1",ten:"Giảm 20% gói Tổng quát",hieuLuc:"Đến 30/06/2026",moTa:"Áp dụng khách lẻ và đoàn"},
    {id:"u2",ten:"Tặng xét nghiệm máu đoàn >30 người",hieuLuc:"Tháng 5-6/2026",moTa:"Liên hệ CBKD để biết thêm"},
  ],
};
function loadState(){ try{ const s=localStorage.getItem(LS); if(s) return {...DEF,...JSON.parse(s)}; }catch(e){} return DEF; }

const Store = createContext(null);
const useStore = () => useContext(Store);
function StoreProvider({children}){
  const [st,setSt] = useState(loadState);
  useEffect(()=>{ try{ localStorage.setItem(LS,JSON.stringify(st)); }catch(e){} },[st]);
  const api = useMemo(()=>({
    state:st,
    setCaiDat:(p)=>setSt((s)=>({...s,caiDat:{...s.caiDat,...p}})),
    setGoi:(g)=>setSt((s)=>({...s,goiKham:g})),
    addKhach:(k)=>setSt((s)=>({...s,khach:[{...k,id:uid("k")},...s.khach]})),
    updateKhach:(id,p)=>setSt((s)=>({...s,khach:s.khach.map((k)=>k.id===id?{...k,...p}:k)})),
    delKhach:(id)=>setSt((s)=>({...s,khach:s.khach.filter((k)=>k.id!==id),lienHe:s.lienHe.filter((l)=>l.khachId!==id)})),
    addLienHe:(l)=>setSt((s)=>({...s,lienHe:[{...l,id:uid("l")},...s.lienHe]})),
    setMauTin:(m)=>setSt((s)=>({...s,mauTin:m})),
    setUuDai:(u)=>setSt((s)=>({...s,uuDai:u})),
  }),[st]);
  return <Store.Provider value={api}>{children}</Store.Provider>;
}

function useLuong(){
  const {state:st} = useStore();
  return useMemo(()=>{
    const {cap,chiTieu}=st.caiDat; const lc=PHAN_CAP[cap].luong; const dttKhoan=chiTieu*.8;
    const w=(k)=>(k.trangThai==="daChot"||k.trangThai==="daKham")?1:0;
    let dtLC=0,tongHH=0; const theoLoai={};
    st.khach.forEach((k)=>{ const hh=hhKhach(k); tongHH+=hh; const ln=LOAI_DV[k.loai]?.ten||k.loai; theoLoai[ln]=(theoLoai[ln]||0)+hh; dtLC+=dttXLC(k)*w(k); });
    const pctDat=dttKhoan>0?dtLC/dttKhoan*100:0;
    const luongCung=lcThucHuong(lc,pctDat)*T;
    const thuong=Math.max(dtLC-dttKhoan,0)*pctMoc(pctDat,THUONG_TH)/100*T;
    // Thưởng năm (tính trên DTT vượt khoán năm, ước tính x12)
    const dtNam=dtLC*12; const chiTieuNam=st.caiDat.chiTieu*12*0.8;
    const pctDatNam=chiTieuNam>0?dtNam/chiTieuNam*100:0;
    const thuongNam=Math.max(dtNam-chiTieuNam,0)*pctMoc(pctDatNam,THUONG_NAM)/100*T;
    return {lc,dttKhoan,dtLC,pctDat,luongCung,tongHH,thuong,thuongNam,pctDatNam,tong:luongCung+tongHH+thuong,theoLoai};
  },[st]);
}
/* ===== UI PRIMITIVES ===== */
function Num({value,onChange,suffix="tr",style}){
  return <div style={{position:"relative",...style}}>
    <input value={value??0} inputMode="numeric" onChange={(e)=>onChange(Number(e.target.value.replace(/[^\d.]/g,""))||0)} style={{...inp,textAlign:"right",paddingRight:34}}/>
    <span style={{position:"absolute",right:12,top:13,color:C.dim,fontSize:13}}>{suffix}</span>
  </div>;
}
function Field({label,children,hint}){
  return <label style={{display:"block",marginBottom:13}}>
    <span style={{display:"block",fontSize:12.5,fontWeight:600,color:C.sub,marginBottom:6}}>{label}</span>
    {children}
    {hint&&<span style={{display:"block",fontSize:11.5,color:C.dim,marginTop:4}}>{hint}</span>}
  </label>;
}
function Btn({children,onClick,primary,danger,small,style={}}){
  return <button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer",fontFamily:FONT,fontWeight:700,border:"none",borderRadius:small?10:13,padding:small?"9px 14px":"14px 0",fontSize:small?13:15,background:primary?"linear-gradient(135deg,#1f995a,#157a46)":danger?"#2a0e0e":C.card,color:primary?"#011508":danger?"#e26d6d":C.sub,width:small?"auto":"100%",boxShadow:primary?"0 8px 22px #1f995a33":"none",...style}}>{children}</button>;
}
function Header({title,sub,onBack}){
  return <div style={{display:"flex",alignItems:"center",gap:12,padding:"18px 0 14px"}}>
    {onBack&&<button onClick={onBack} style={{background:"#0f2942",border:"none",borderRadius:11,width:38,height:38,color:C.sub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowLeft size={19}/></button>}
    <div>
      <div style={{fontSize:19,fontWeight:800,color:C.text,lineHeight:1.1}}>{title}</div>
      {sub&&<div style={{fontSize:12.5,color:C.dim,marginTop:2}}>{sub}</div>}
    </div>
  </div>;
}
function Badge({children,mau}){ return <span style={{fontSize:11,fontWeight:700,color:mau,background:mau+"22",padding:"3px 9px",borderRadius:20}}>{children}</span>; }
function Checkbox({checked,onChange,label}){
  return <button onClick={()=>onChange(!checked)} style={{display:"flex",alignItems:"center",gap:9,background:checked?"#0e3a52":"#030e1a",border:checked?"1.5px solid #1f995a":`1.5px solid ${C.line}`,borderRadius:10,padding:"10px 13px",cursor:"pointer",fontFamily:FONT,width:"100%",marginBottom:8}}>
    <div style={{width:18,height:18,borderRadius:5,background:checked?C.accent:"transparent",border:checked?"none":`2px solid ${C.dim}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{checked&&<Check size={12} color="#011508"/>}</div>
    <span style={{fontSize:13,color:C.sub}}>{label}</span>
  </button>;
}

/* ===== DASHBOARD ===== */
function useWeather(){
  const [weather,setWeather]=useState(null);
  useEffect(()=>{
    if(!navigator.geolocation)return;
    navigator.geolocation.getCurrentPosition((pos)=>{
      const {latitude:lat,longitude:lon}=pos.coords;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`)
        .then(r=>r.json())
        .then(d=>{
          const c=d.current; const code=c.weathercode;
          const icon=code<=1?"☀️":code<=3?"⛅":code<=51?"🌦️":code<=67?"🌧️":code<=77?"❄️":code<=82?"🌧️":code<=99?"⛈️":"🌡️";
          setWeather({temp:Math.round(c.temperature_2m),icon,wind:Math.round(c.windspeed_10m)});
        }).catch(()=>{});
    },()=>{},{timeout:8000});
  },[]);
  return weather;
}

function getGreeting(){
  const h=new Date().getHours();
  if(h<6)return"Đêm muộn rồi 🌙";
  if(h<11)return"Chào buổi sáng ☀️";
  if(h<13)return"Chào buổi trưa 🌤️";
  if(h<18)return"Chào buổi chiều 👋";
  return"Chào buổi tối 🌆";
}

function Dashboard({go,userName}){
  const {state:st}=useStore(); const L=useLuong();
  const pct=Math.min(L.pctDat,100);
  const fu=st.khach.filter((k)=>k.trangThai==="dangTuVan"||k.trangThai==="tiemNang").slice(0,4);
  const weather=useWeather();
  const greeting=getGreeting();
  const displayName=userName?userName.replace(/^(Vợ - |Admin \/ )/,""):"";
  return <div>
    {/* Lời chào + thời tiết */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0 12px"}}>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <img src="/logo.png" alt=""
            style={{height:32,width:32,objectFit:"contain",borderRadius:8,background:"#071e35",padding:3,flexShrink:0}}
            onError={(e)=>{ e.target.parentNode.style.display="none"; }}
          />
          <span style={{fontSize:12,fontWeight:700,color:"#5e84a3",letterSpacing:.3}}>BV PHƯƠNG ĐÔNG</span>
        </div>
        <div style={{fontSize:13,color:C.dim}}>{greeting}</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,marginTop:1,lineHeight:1.1}}>{displayName||"Xin chào!"}</div>
        <div style={{fontSize:12,color:C.dim,marginTop:2}}>{PHAN_CAP[st.caiDat.cap].ten} · Khoán {fmtTr(st.caiDat.chiTieu)}/tháng</div>
      </div>
      {weather?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",background:C.card,border:`1.5px solid ${C.line}`,borderRadius:14,padding:"10px 14px",minWidth:72}}>
          <span style={{fontSize:26,lineHeight:1}}>{weather.icon}</span>
          <span style={{fontSize:20,fontWeight:800,color:C.text,marginTop:4}}>{weather.temp}°</span>
          <span style={{fontSize:10,color:C.dim,marginTop:1}}>{weather.wind} km/h</span>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",background:C.card,border:`1.5px solid ${C.line}`,borderRadius:14,padding:"10px 14px",minWidth:72,opacity:.4}}>
          <span style={{fontSize:26}}>🌡️</span>
          <span style={{fontSize:11,color:C.dim,marginTop:4}}>Đang tải</span>
        </div>
      )}
    </div>
    <div style={{...box,display:"flex",alignItems:"center",gap:18}}>
      <div style={{position:"relative",width:96,height:96,flexShrink:0}}>
        <svg width="96" height="96" style={{transform:"rotate(-90deg)"}}>
          <circle cx="48" cy="48" r="40" fill="none" stroke={C.line} strokeWidth="10"/>
          <circle cx="48" cy="48" r="40" fill="none" stroke={C.accent} strokeWidth="10" strokeLinecap="round" strokeDasharray={2*Math.PI*40} strokeDashoffset={2*Math.PI*40*(1-pct/100)}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:21,fontWeight:800,color:C.text}}>{L.pctDat.toFixed(0)}%</span>
          <span style={{fontSize:10,color:C.dim}}>khoán</span>
        </div>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:C.sub}}>DTT ghi nhận tháng này</div>
        <div style={{fontSize:26,fontWeight:800,color:C.accent}}>{fmtTr(L.dtLC.toFixed(1))}</div>
        <div style={{fontSize:11.5,color:C.dim,marginTop:2}}>khoán DTT: {fmtTr(L.dttKhoan)} (80% chỉ tiêu)</div>
      </div>
    </div>
    <div style={{background:"linear-gradient(135deg,#1f995a,#157a46)",borderRadius:16,padding:"18px 16px",marginBottom:14,boxShadow:"0 10px 26px #1f995a33"}}>
      <div style={{fontSize:12,color:"#011508",fontWeight:700,opacity:.8}}>THU NHẬP DỰ KIẾN THÁNG</div>
      <div style={{fontSize:30,fontWeight:900,color:"#010f06",marginTop:3}}>{fmt(L.tong)}</div>
      <div style={{display:"flex",gap:12,marginTop:12}}>
        {[["Lương cứng",L.luongCung],["Hoa hồng",L.tongHH],["Thưởng",L.thuong]].map(([t,v])=>(
          <div key={t} style={{flex:1}}>
            <div style={{fontSize:10,color:"#011508",opacity:.75,fontWeight:600}}>{t}</div>
            <div style={{fontSize:12.5,color:"#010f06",fontWeight:800,marginTop:2}}>{fmt(v)}</div>
          </div>
        ))}
      </div>
    </div>
    {Object.keys(L.theoLoai).length>0&&<div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:10}}>Hoa hồng theo dịch vụ</div>
      {Object.entries(L.theoLoai).filter(([,v])=>v>0).map(([k,v])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:7,color:C.sub}}>
          <span>{k}</span><span style={{color:C.text,fontWeight:600}}>{fmt(v)}</span>
        </div>
      ))}
    </div>}
    <div style={box}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13.5,fontWeight:800,color:C.text}}>Cần follow-up hôm nay</span>
        <button onClick={()=>go("followup")} style={{fontSize:12,color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:FONT}}>Tất cả</button>
      </div>
      {fu.length===0&&<div style={{fontSize:13,color:C.dim}}>Không có ai.</div>}
      {fu.map((k)=>(
        <button key={k.id} onClick={()=>go("chitiet",k.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:C.inputBg,border:"none",borderRadius:10,padding:"11px 13px",marginBottom:7,cursor:"pointer",fontFamily:FONT}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,color:C.text,fontWeight:600}}>{k.ten}</div>
            <div style={{fontSize:11.5,color:C.dim}}>{LOAI_DV[k.loai]?.ten} · {TRANG_THAI[k.trangThai]?.ten}</div>
          </div>
          <ChevronRight size={17} color={C.dim}/>
        </button>
      ))}
    </div>
  </div>;
}
/* ===== FORM NHẬP KHÁCH (cá nhân + đoàn, nhập chi phí/DTT) ===== */
function KhachForm({khachEdit,onSave,onBack,goiKham}){
  const blank = {ten:"",sdt:"",cccd:"",loai:"le",trangThai:"tiemNang",ngay:new Date().toISOString().slice(0,10),doanhThuGop:0,cpThuoc:0,cpBacSi:0,cpRuiRo:0,cpKhac:0,dungTat:false,dttTat:0,doanGiamCao:false,soNguoi:1,soGoiThuong:0,soBabymoon:0,soBabymoonVip:0,soIcsi:0,soMauNgan:0,soMauDai:0,tuCtv:false,ghiChu:""};
  const [f,setF]=useState(khachEdit?{...blank,...khachEdit}:blank);
  const set=(k,v)=>setF((x)=>({...x,[k]:v}));
  const dtt=tinhDTT(f); const hh=hhKhach(f);
  const isDoan=f.loai==="doan"; const isSoGoi=["thaisan","ivf","mau"].includes(f.loai);
  const hasCP=["le","doan","vaccine","covid","shira"].includes(f.loai);

  return <div>
    <Header title={khachEdit?"Sửa khách":"Thêm khách mới"} sub="BV Phương Đông" onBack={onBack}/>
    <div style={{...box}}>
      <Field label="Loại dịch vụ">
        <select style={inp} value={f.loai} onChange={(e)=>set("loai",e.target.value)}>
          {Object.entries(LOAI_DV).map(([k,v])=><option key={k} value={k}>{v.ten}</option>)}
        </select>
      </Field>
      <Field label={isDoan?"Tên đoàn / công ty":"Họ tên khách"}>
        <input style={inp} value={f.ten} onChange={(e)=>set("ten",e.target.value)} placeholder="Nhập tên..."/>
      </Field>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><Field label="SĐT"><input style={inp} value={f.sdt} onChange={(e)=>set("sdt",e.target.value)} inputMode="tel" placeholder="09xx"/></Field></div>
        <div style={{flex:1}}><Field label="Ngày"><input type="date" style={inp} value={f.ngay} onChange={(e)=>set("ngay",e.target.value)}/></Field></div>
      </div>
      {isDoan&&<Field label="Số người"><Num value={f.soNguoi} onChange={(v)=>set("soNguoi",v)} suffix="ng"/></Field>}
      <Field label="Trạng thái">
        <select style={inp} value={f.trangThai} onChange={(e)=>set("trangThai",e.target.value)}>
          {Object.entries(TRANG_THAI).map(([k,v])=><option key={k} value={k}>{v.ten}</option>)}
        </select>
      </Field>
    </div>

    {/* Doanh thu & chi phí */}
    {hasCP&&<div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:12}}>Doanh thu & Chi phí</div>
      <Checkbox checked={f.dungTat} onChange={(v)=>set("dungTat",v)} label="Nhập tắt DTT (đã tính sẵn)"/>
      {f.dungTat
        ?<Field label="DTT (triệu)"><Num value={f.dttTat} onChange={(v)=>set("dttTat",v)}/></Field>
        :<div>
          <Field label="Doanh thu gộp (triệu)"><Num value={f.doanhThuGop} onChange={(v)=>set("doanhThuGop",v)}/></Field>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Field label="Thuốc + Vật tư"><Num value={f.cpThuoc} onChange={(v)=>set("cpThuoc",v)}/></Field></div>
            <div style={{flex:1}}><Field label="Thuê BS ngoài"><Num value={f.cpBacSi} onChange={(v)=>set("cpBacSi",v)}/></Field></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Field label="Đền bù rủi ro"><Num value={f.cpRuiRo} onChange={(v)=>set("cpRuiRo",v)}/></Field></div>
            <div style={{flex:1}}><Field label="Chi phí khác"><Num value={f.cpKhac} onChange={(v)=>set("cpKhac",v)}/></Field></div>
          </div>
        </div>}
      {isDoan&&<Checkbox checked={f.doanGiamCao} onChange={(v)=>set("doanGiamCao",v)} label="Giảm giá >30% (HH 0.5% thay vì 1%)"/>}
      <Checkbox checked={f.tuCtv} onChange={(v)=>set("tuCtv",v)} label="Khách do CTV đưa về (ghi nhận 50% DT)"/>
      <div style={{marginTop:12,background:C.inputBg,borderRadius:12,padding:"13px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:C.sub}}><span>DTT thuần</span><span style={{color:C.text,fontWeight:700}}>{fmtTr(dtt.toFixed(1))}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:C.accent,fontWeight:800}}><span>Hoa hồng dự kiến</span><span>{fmt(hh)}</span></div>
      </div>
    </div>}

    {/* Thai sản */}
    {f.loai==="thaisan"&&<div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:12}}>Số gói thai sản</div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><Field label="Gói thường" hint="Lũy tiến 100-500k/gói"><Num value={f.soGoiThuong} onChange={(v)=>set("soGoiThuong",v)} suffix="gói"/></Field></div>
        <div style={{flex:1}}><Field label="Babymoon" hint="1tr/gói"><Num value={f.soBabymoon} onChange={(v)=>set("soBabymoon",v)} suffix="gói"/></Field></div>
        <div style={{flex:1}}><Field label="BM VIP+" hint="1.5tr/gói"><Num value={f.soBabymoonVip} onChange={(v)=>set("soBabymoonVip",v)} suffix="gói"/></Field></div>
      </div>
      <div style={{textAlign:"right",fontSize:14,color:C.accent,fontWeight:800}}>HH: {fmt(hhKhach(f))}</div>
    </div>}
    {f.loai==="ivf"&&<div style={box}>
      <Field label="Số khách hoàn thành ICSI" hint="3tr/khách"><Num value={f.soIcsi} onChange={(v)=>set("soIcsi",v)} suffix="kh"/></Field>
      <div style={{textAlign:"right",fontSize:14,color:C.accent,fontWeight:800}}>HH: {fmt(hhKhach(f))}</div>
    </div>}
    {f.loai==="mau"&&<div style={box}>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><Field label="Gói 1-5 năm" hint="500k/gói"><Num value={f.soMauNgan} onChange={(v)=>set("soMauNgan",v)} suffix="gói"/></Field></div>
        <div style={{flex:1}}><Field label="Gói 10-30 năm" hint="1tr/gói"><Num value={f.soMauDai} onChange={(v)=>set("soMauDai",v)} suffix="gói"/></Field></div>
      </div>
      <div style={{textAlign:"right",fontSize:14,color:C.accent,fontWeight:800}}>HH: {fmt(hhKhach(f))}</div>
    </div>}

    <div style={box}>
      <Field label="Ghi chú">
        <textarea style={{...inp,resize:"vertical",fontSize:14}} rows={3} value={f.ghiChu} onChange={(e)=>set("ghiChu",e.target.value)} placeholder="Ghi chú thêm..."/>
      </Field>
    </div>
    <Btn primary onClick={()=>onSave(f)}><Check size={19}/>{khachEdit?"Lưu thay đổi":"Lưu khách"}</Btn>
  </div>;
}

/* ===== DANH SÁCH KHÁCH ===== */
function DanhSachKhach({go}){
  const {state:st,delKhach}=useStore();
  const [q,setQ]=useState(""); const [loaiF,setLoaiF]=useState("tat_ca"); const [ttF,setTtF]=useState("tat_ca");
  const ds=st.khach.filter((k)=>{
    const matchQ=k.ten.toLowerCase().includes(q.toLowerCase())||k.sdt.includes(q);
    const matchL=loaiF==="tat_ca"||k.loai===loaiF;
    const matchT=ttF==="tat_ca"||k.trangThai===ttF;
    return matchQ&&matchL&&matchT;
  });
  return <div>
    <Header title="Danh sách khách" sub={`${st.khach.length} khách`}/>
    <div style={{position:"relative",marginBottom:10}}>
      <Search size={16} style={{position:"absolute",left:13,top:14,color:C.dim}}/>
      <input style={{...inp,paddingLeft:38}} placeholder="Tìm tên, SĐT..." value={q} onChange={(e)=>setQ(e.target.value)}/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
      <FilterBtn v="tat_ca" cur={loaiF} set={setLoaiF} label="Tất cả"/>
      {Object.entries(LOAI_DV).slice(0,6).map(([k,v])=><FilterBtn key={k} v={k} cur={loaiF} set={setLoaiF} label={v.ten}/>)}
    </div>
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      {Object.entries(TRANG_THAI).map(([k,v])=>(
        <button key={k} onClick={()=>setTtF(ttF===k?"tat_ca":k)} style={{fontSize:11.5,fontWeight:600,color:ttF===k?v.mau:C.dim,background:ttF===k?v.mau+"22":"transparent",border:`1px solid ${ttF===k?v.mau:C.line}`,borderRadius:20,padding:"5px 11px",cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"}}>{v.ten}</button>
      ))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {ds.length===0&&<div style={{textAlign:"center",color:C.dim,padding:"30px 0",fontSize:14}}>Không tìm thấy khách nào.</div>}
      {ds.map((k)=>{
        const tt=TRANG_THAI[k.trangThai]||{}; const dtt=tinhDTT(k); const hh=hhKhach(k);
        return <button key={k.id} onClick={()=>go("chitiet",k.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:C.card,border:`1.5px solid ${C.line}`,borderRadius:13,padding:"13px 15px",cursor:"pointer",fontFamily:FONT,textAlign:"left"}}>
          <div>
            <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:3}}>{k.ten}</div>
            <div style={{fontSize:12,color:C.dim}}>{LOAI_DV[k.loai]?.ten} · {k.sdt}</div>
            <div style={{fontSize:12,color:C.dim}}>DTT: {fmtTr(dtt.toFixed(1))} · HH: {fmt(hh)}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <Badge mau={tt.mau||C.dim}>{tt.ten||k.trangThai}</Badge>
            <ChevronRight size={16} color={C.dim}/>
          </div>
        </button>;
      })}
    </div>
  </div>;
}
function FilterBtn({v,cur,set,label}){
  const a=cur===v;
  return <button onClick={()=>set(v)} style={{fontSize:12,fontWeight:600,color:a?C.accent:C.dim,background:a?C.accent+"22":"transparent",border:`1px solid ${a?C.accent:C.line}`,borderRadius:20,padding:"6px 13px",cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"}}>{label}</button>;
}

/* ===== CHI TIẾT KHÁCH ===== */
function ChiTietKhach({id,go}){
  const {state:st,updateKhach,delKhach,addLienHe}=useStore();
  const k=st.khach.find((x)=>x.id===id);
  const [suaMode,setSuaMode]=useState(false);
  const [noiDungLH,setNoiDungLH]=useState(""); const [loaiLH,setLoaiLH]=useState("goi");
  if(!k) return <div style={{color:C.dim,padding:40,textAlign:"center"}}>Không tìm thấy.</div>;
  if(suaMode) return <KhachForm khachEdit={k} goiKham={st.goiKham} onBack={()=>setSuaMode(false)} onSave={(f)=>{updateKhach(id,f);setSuaMode(false);}}/>;
  const lh=st.lienHe.filter((l)=>l.khachId===id);
  const dtt=tinhDTT(k); const hh=hhKhach(k); const tt=TRANG_THAI[k.trangThai]||{};
  return <div>
    <Header title={k.ten} sub={LOAI_DV[k.loai]?.ten} onBack={()=>go("danh_sach")}/>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <Badge mau={tt.mau||C.dim}>{tt.ten}</Badge>
      <button onClick={()=>setSuaMode(true)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:C.accent,background:C.accent+"11",border:`1px solid ${C.accent}44`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontFamily:FONT}}><Pencil size={13}/>Sửa</button>
    </div>
    <div style={box}>
      <Row label="SĐT" v={k.sdt}/><Row label="Ngày" v={k.ngay}/>
      <Row label="Ghi chú" v={k.ghiChu||"—"}/>
      {k.soNguoi>1&&<Row label="Số người" v={k.soNguoi+" người"}/>}
    </div>
    <div style={{...box,background:"linear-gradient(135deg,#0a2a4a,#061830)",border:`1.5px solid ${C.accent}33`}}>
      <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:10}}>Tài chính</div>
      {!k.dungTat&&<><Row label="DT gộp" v={fmtTr(k.doanhThuGop)}/><Row label="Thuốc+VT" v={fmtTr(k.cpThuoc)}/>{k.cpBacSi>0&&<Row label="Thuê BS" v={fmtTr(k.cpBacSi)}/>}{k.cpRuiRo>0&&<Row label="Đền bù RR" v={fmtTr(k.cpRuiRo)}/>}{k.cpKhac>0&&<Row label="CP khác" v={fmtTr(k.cpKhac)}/>}</>}
      <Row label="DTT" v={fmtTr(dtt.toFixed(1))}/>
      <div style={{height:1,background:C.line,margin:"10px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13.5,color:C.accent,fontWeight:700}}>Hoa hồng</span><span style={{fontSize:20,color:C.accent,fontWeight:900}}>{fmt(hh)}</span></div>
    </div>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:12}}>Timeline liên hệ</div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <select style={{...inp,flex:.8,fontSize:13,padding:"10px 12px"}} value={loaiLH} onChange={(e)=>setLoaiLH(e.target.value)}>
          <option value="goi">Gọi ĐT</option><option value="zalo">Zalo</option><option value="gap">Gặp trực tiếp</option><option value="note">Ghi chú</option>
        </select>
        <input style={{...inp,flex:2,fontSize:13,padding:"10px 12px"}} value={noiDungLH} onChange={(e)=>setNoiDungLH(e.target.value)} placeholder="Nội dung liên hệ..."/>
        <button onClick={()=>{if(!noiDungLH.trim())return;addLienHe({khachId:id,ngay:new Date().toISOString().slice(0,10),loai:loaiLH,noiDung:noiDungLH});setNoiDungLH("");}} style={{background:C.accent,border:"none",borderRadius:10,padding:"0 14px",cursor:"pointer",color:"#011508"}}><Send size={17}/></button>
      </div>
      {lh.length===0&&<div style={{fontSize:13,color:C.dim}}>Chưa có liên hệ nào.</div>}
      {lh.map((l)=>(
        <div key={l.id} style={{display:"flex",gap:10,paddingBottom:12,borderBottom:`1px solid ${C.line}`,marginBottom:12}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.accent,marginTop:5,flexShrink:0}}/>
          <div>
            <div style={{fontSize:11.5,color:C.dim,marginBottom:2}}>{l.ngay} · {l.loai}</div>
            <div style={{fontSize:13.5,color:C.text}}>{l.noiDung}</div>
          </div>
        </div>
      ))}
    </div>
    <Btn danger onClick={()=>{delKhach(id);go("danh_sach");}} style={{marginTop:8}}><Trash2 size={17}/>Xoá khách</Btn>
  </div>;
}
function Row({label,v}){ return <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:7,color:C.sub}}><span>{label}</span><span style={{color:C.text,fontWeight:600,maxWidth:"60%",textAlign:"right"}}>{v}</span></div>; }
/* ===== MẪU TIN NHẮN ===== */
function MauTin(){
  const {state:st,setMauTin}=useStore();
  const [copy,setCopy]=useState("");
  function upd(id,f,v){ setMauTin(st.mauTin.map((m)=>m.id===id?{...m,[f]:v}:m)); }
  return <div>
    <Header title="Mẫu tin nhắn"/>
    {st.mauTin.map((m)=>(
      <div key={m.id} style={{...box}}>
        <input style={{...inp,marginBottom:8,fontSize:14,fontWeight:600}} value={m.ten} onChange={(e)=>upd(m.id,"ten",e.target.value)}/>
        <textarea style={{...inp,resize:"vertical",fontSize:13.5}} rows={3} value={m.noiDung} onChange={(e)=>upd(m.id,"noiDung",e.target.value)}/>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button onClick={()=>{navigator.clipboard?.writeText(m.noiDung);setCopy(m.id);setTimeout(()=>setCopy(""),2000);}} style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,fontWeight:600,color:copy===m.id?C.accent:C.sub,background:C.inputBg,border:`1px solid ${C.line}`,borderRadius:9,padding:"8px 13px",cursor:"pointer",fontFamily:FONT}}>
            {copy===m.id?<><Check size={14}/>Đã copy!</>:<><Copy size={14}/>Copy</>}
          </button>
          <button onClick={()=>setMauTin(st.mauTin.filter((x)=>x.id!==m.id))} style={{display:"flex",alignItems:"center",gap:5,fontSize:12.5,color:"#e26d6d",background:"transparent",border:"none",cursor:"pointer",fontFamily:FONT}}><Trash2 size={14}/>Xoá</button>
        </div>
      </div>
    ))}
    <button onClick={()=>setMauTin([...st.mauTin,{id:uid("m"),ten:"Mẫu mới",noiDung:""}])} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px 0",borderRadius:12,border:`1.5px dashed ${C.line}`,background:"transparent",color:C.sub,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:FONT}}>
      <Plus size={17}/>Thêm mẫu
    </button>
  </div>;
}

/* ===== ƯU ĐÃI ===== */
function UuDai(){
  const {state:st,setUuDai}=useStore();
  function upd(id,f,v){ setUuDai(st.uuDai.map((u)=>u.id===id?{...u,[f]:v}:u)); }
  return <div>
    <Header title="Ưu đãi hiện hành"/>
    {st.uuDai.map((u)=>(
      <div key={u.id} style={{...box,border:`1.5px solid ${C.accent}33`}}>
        <input style={{...inp,fontSize:15,fontWeight:700,marginBottom:8}} value={u.ten} onChange={(e)=>upd(u.id,"ten",e.target.value)}/>
        <input style={{...inp,fontSize:13}} value={u.hieuLuc} onChange={(e)=>upd(u.id,"hieuLuc",e.target.value)} placeholder="Hiệu lực..."/>
        <input style={{...inp,fontSize:13,marginTop:8}} value={u.moTa||""} onChange={(e)=>upd(u.id,"moTa",e.target.value)} placeholder="Mô tả thêm..."/>
        <button onClick={()=>setUuDai(st.uuDai.filter((x)=>x.id!==u.id))} style={{marginTop:8,fontSize:12,color:"#e26d6d",background:"transparent",border:"none",cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:5}}><Trash2 size={13}/>Xoá</button>
      </div>
    ))}
    <button onClick={()=>setUuDai([...st.uuDai,{id:uid("u"),ten:"Ưu đãi mới",hieuLuc:"",moTa:""}])} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px 0",borderRadius:12,border:`1.5px dashed ${C.line}`,background:"transparent",color:C.sub,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:FONT}}>
      <Plus size={17}/>Thêm ưu đãi
    </button>
  </div>;
}

/* ===== FOLLOW-UP ===== */
function FollowUp({go}){
  const {state:st}=useStore();
  const ds=st.khach.filter((k)=>k.trangThai==="dangTuVan"||k.trangThai==="tiemNang");
  return <div>
    <Header title="Follow-up hôm nay" sub={`${ds.length} khách cần liên hệ`}/>
    {ds.length===0&&<div style={{textAlign:"center",color:C.dim,padding:"40px 0",fontSize:14}}>Không có khách cần follow-up!</div>}
    {ds.map((k)=>{
      const tt=TRANG_THAI[k.trangThai]||{};
      return <button key={k.id} onClick={()=>go("chitiet",k.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:C.card,border:`1.5px solid ${C.line}`,borderRadius:13,padding:"14px 15px",marginBottom:10,cursor:"pointer",fontFamily:FONT,textAlign:"left"}}>
        <div>
          <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:4}}>{k.ten}</div>
          <div style={{fontSize:12.5,color:C.dim}}>{k.sdt} · {LOAI_DV[k.loai]?.ten}</div>
          {k.ghiChu&&<div style={{fontSize:12.5,color:C.sub,marginTop:3}}>📝 {k.ghiChu}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <Badge mau={tt.mau}>{tt.ten}</Badge>
          <ChevronRight size={16} color={C.dim}/>
        </div>
      </button>;
    })}
  </div>;
}

/* ===== MAP BỆNH VIỆN ===== */
function MapBV(){
  const [toa,setToa]=useState("A"); const [tang,setTang]=useState(1);
  const floors={
    A:{1:"Khoa Nội tổng hợp",2:"Tim mạch",3:"Hô hấp",4:"Tiêu hoá",5:"Thần kinh",6:"Nội tiết",7:"Khám tổng quát lẻ",8:"Khám đoàn tầng 8",9:"XN & CĐHA",10:"Trung tâm Shira"},
    B:{1:"Khoa Ngoại tổng hợp",2:"Ngoại tiêu hoá",3:"Ngoại tiết niệu",4:"Cơ-Xương-Khớp",5:"Sản - Phụ khoa",6:"Thai sản",7:"Nhi khoa",8:"Phẫu thuật tầng 8",9:"ICU - Hồi sức",10:"Phòng mổ"},
  };
  return <div>
    <Header title="Map Bệnh viện" sub="BV Đa khoa Phương Đông"/>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {["A","B"].map((t)=>(
        <button key={t} onClick={()=>setToa(t)} style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",fontFamily:FONT,fontSize:15,fontWeight:700,cursor:"pointer",background:toa===t?"linear-gradient(135deg,#1f995a,#157a46)":C.card,color:toa===t?"#011508":C.sub}}>
          Tòa {t} · {t==="A"?"Nội khoa":"Ngoại khoa"}
        </button>
      ))}
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
      {Array.from({length:30},(_,i)=>i+1).map((t)=>(
        <button key={t} onClick={()=>setTang(t)} style={{width:52,height:40,borderRadius:10,border:"none",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer",background:tang===t?C.accent:C.card,color:tang===t?"#011508":floors[toa][t]?C.sub:C.dim}}>
          {t}F
        </button>
      ))}
    </div>
    <div style={{...box,border:`1.5px solid ${C.accent}44`}}>
      <div style={{fontSize:12,color:C.accent,fontWeight:700,marginBottom:6}}>Tòa {toa} · Tầng {tang}</div>
      <div style={{fontSize:17,color:C.text,fontWeight:800}}>{floors[toa][tang]||`Tầng ${tang} — phòng khám thông thường`}</div>
    </div>
  </div>;
}
/* ===== BÁO CÁO ===== */
function BaoCao(){
  const {state:st}=useStore(); const L=useLuong();
  const [ky,setKy]=useState("thang");
  const [exportMsg,setExportMsg]=useState("");

  function xuatBaoCao(){
    const lines=[
      "BÁO CÁO CBKD - BV ĐA KHOA PHƯƠNG ĐÔNG",
      "=".repeat(40),
      `Kỳ: ${ky==="thang"?"Tháng này":"Dự kiến năm"} | Phân cấp: ${PHAN_CAP[st.caiDat.cap].ten} | Chỉ tiêu: ${fmtTr(st.caiDat.chiTieu)}/tháng`,
      "",
      "CHỈ TIÊU & DOANH THU",
      `DTT ghi nhận: ${fmtTr(L.dtLC.toFixed(1))}  |  Khoán: ${fmtTr(L.dttKhoan)}  |  Đạt: ${L.pctDat.toFixed(1)}%`,
      "",
      "THU NHẬP DỰ KIẾN",
      `Lương cứng: ${fmt(L.luongCung)}`,
      `Hoa hồng:   ${fmt(L.tongHH)}`,
      `Thưởng tháng: ${fmt(L.thuong)}`,
      `Thưởng năm (ước): ${fmt(L.thuongNam/12)}`,
      "-".repeat(40),
      `TỔNG THÁNG: ${fmt(L.tong)}`,
      "",
      "HOA HỒNG THEO DỊCH VỤ",
      ...Object.entries(L.theoLoai).filter(([,v])=>v>0).map(([k,v])=>`  ${k}: ${fmt(v)}`),
      "",
      "KHÁCH HÀNG ĐÃ CHỐT/KHÁM",
      ...st.khach.filter((k)=>k.trangThai==="daChot"||k.trangThai==="daKham")
        .map((k)=>`  ${k.ten} | ${LOAI_DV[k.loai]?.ten} | DTT: ${fmtTr(tinhDTT(k).toFixed(1))} | HH: ${fmt(hhKhach(k))}`),
      "",
      `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`,
    ];
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url;
    a.download=`BaoCao_CBKD_${new Date().toISOString().slice(0,10)}.txt`;
    a.click(); URL.revokeObjectURL(url);
    setExportMsg("Đã xuất báo cáo!"); setTimeout(()=>setExportMsg(""),3000);
  }

  return <div>
    <Header title="Báo cáo" sub="CBKD · BV Phương Đông"/>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {[["thang","Tháng này"],["nam","Dự kiến năm"]].map(([k,l])=>(
        <button key={k} onClick={()=>setKy(k)} style={{flex:1,padding:"10px 0",borderRadius:11,border:"none",fontFamily:FONT,fontSize:13.5,fontWeight:700,cursor:"pointer",background:ky===k?"linear-gradient(135deg,#1f995a,#157a46)":C.card,color:ky===k?"#011508":C.sub}}>{l}</button>
      ))}
    </div>
    <div style={box}>
      <Row label="Tổng khách" v={st.khach.length+" khách"}/>
      <Row label="Đã chốt/khám" v={st.khach.filter((k)=>k.trangThai==="daChot"||k.trangThai==="daKham").length+" khách"}/>
      <Row label="DTT ghi nhận" v={fmtTr(L.dtLC.toFixed(1))}/>
      <Row label="% đạt khoán tháng" v={L.pctDat.toFixed(1)+"%"}/>
      {ky==="nam"&&<Row label="% đạt khoán năm (ước)" v={L.pctDatNam.toFixed(1)+"%"}/>}
    </div>
    <div style={{...box,background:"linear-gradient(135deg,#0a2a4a,#061830)",border:`1.5px solid ${C.accent}33`}}>
      <Row label="Lương cứng" v={fmt(L.luongCung)}/>
      <Row label="Tổng hoa hồng" v={fmt(L.tongHH)}/>
      <Row label="Thưởng tháng" v={fmt(L.thuong)}/>
      <Row label="Thưởng năm (ước/tháng)" v={fmt(L.thuongNam/12)}/>
      <div style={{height:1,background:C.line,margin:"10px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:14,color:C.accent,fontWeight:700}}>TỔNG THÁNG</span>
        <span style={{fontSize:24,color:C.accent,fontWeight:900}}>{fmt(L.tong)}</span>
      </div>
      {ky==="nam"&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
        <span style={{fontSize:13,color:"#ffd479",fontWeight:700}}>TỔNG NĂM (ước)</span>
        <span style={{fontSize:18,color:"#ffd479",fontWeight:900}}>{fmt((L.tong+L.thuongNam/12)*12)}</span>
      </div>}
    </div>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:12}}>Hoa hồng theo dịch vụ</div>
      {Object.entries(L.theoLoai).filter(([,v])=>v>0).length===0&&<div style={{color:C.dim,fontSize:13}}>Chưa có hoa hồng.</div>}
      {Object.entries(L.theoLoai).filter(([,v])=>v>0).map(([k,v])=>{
        const tong=L.tongHH||1; const w=v/tong;
        return <div key={k} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5,color:C.sub}}><span>{k}</span><span style={{color:C.text,fontWeight:600}}>{fmt(v)}</span></div>
          <div style={{height:6,background:C.inputBg,borderRadius:10}}><div style={{height:6,background:C.accent,borderRadius:10,width:`${w*100}%`,transition:"width .4s"}}/></div>
        </div>;
      })}
    </div>
    <div style={box}>
      {Object.entries(TRANG_THAI).map(([k,v])=>{
        const n=st.khach.filter((x)=>x.trangThai===k).length;
        return <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8,color:C.sub}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:v.mau}}/>{v.ten}</div>
          <span style={{color:C.text,fontWeight:600}}>{n} khách</span>
        </div>;
      })}
    </div>
    <button onClick={xuatBaoCao} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 0",borderRadius:13,border:"none",background:"linear-gradient(135deg,#1f995a,#157a46)",color:"#011508",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:FONT,boxShadow:"0 8px 22px #1f995a33"}}>
      <Download size={18}/> Xuất báo cáo (.txt)
    </button>
    {exportMsg&&<div style={{textAlign:"center",color:C.accent,fontSize:13,marginTop:8}}>{exportMsg}</div>}
  </div>;
}

/* ===== CÀI ĐẶT ===== */
function CaiDat(){
  const {state:st,setCaiDat,setGoi}=useStore(); const L=useLuong();
  const [draft,setDraft]=useState(()=>st.goiKham.map((g)=>({...g})));
  function editGoi(id,f,v){ setDraft((d)=>d.map((g)=>g.id===id?{...g,[f]:f==="gia"?Number(String(v).replace(/[^\d.]/g,""))||0:v}:g)); }
  return <div>
    <Header title="Cài đặt" sub="Phân cấp, chỉ tiêu, gói khám"/>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:12}}>Phân cấp & Chỉ tiêu</div>
      <Field label="Phân cấp CBKD">
        <select style={inp} value={st.caiDat.cap} onChange={(e)=>setCaiDat({cap:e.target.value})}>
          {Object.entries(PHAN_CAP).map(([k,v])=><option key={k} value={k}>{v.ten} — {v.luong}tr lương cứng</option>)}
        </select>
      </Field>
      <Field label="Chỉ tiêu khoán tháng (triệu)" hint={`DTT khoán = 80% = ${(st.caiDat.chiTieu*.8).toLocaleString("vi-VN")}tr`}>
        <Num value={st.caiDat.chiTieu} onChange={(v)=>setCaiDat({chiTieu:v})}/>
      </Field>
      <div style={{background:C.inputBg,borderRadius:12,padding:"12px 14px",marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:C.sub}}><span>Lương cứng tiêu chuẩn</span><span style={{color:C.text,fontWeight:700}}>{PHAN_CAP[st.caiDat.cap].luong}tr</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.sub}}><span>% đạt khoán hiện tại</span><span style={{color:C.accent,fontWeight:700}}>{L.pctDat.toFixed(1)}%</span></div>
      </div>
    </div>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:10}}>Quản lý gói khám</div>
      <div style={{display:"flex",gap:6,padding:"0 2px 8px",fontSize:11,color:C.dim,fontWeight:600}}>
        <div style={{flex:2}}>Tên gói</div><div style={{width:80,textAlign:"center"}}>Giá (tr)</div><div style={{width:30}}/>
      </div>
      {draft.map((g)=>(
        <div key={g.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
          <input value={g.ten} onChange={(e)=>editGoi(g.id,"ten",e.target.value)} style={{...inp,flex:2,padding:"10px 12px",fontSize:14}}/>
          <input value={g.gia} onChange={(e)=>editGoi(g.id,"gia",e.target.value)} inputMode="numeric" style={{...inp,width:80,padding:"10px 12px",fontSize:14,textAlign:"center"}}/>
          <button onClick={()=>setDraft((d)=>d.filter((x)=>x.id!==g.id))} style={{width:30,height:40,border:"none",background:"transparent",color:"#e26d6d",cursor:"pointer"}}><Trash2 size={15}/></button>
        </div>
      ))}
      <button onClick={()=>setDraft((d)=>[...d,{id:uid("g"),ten:"",gia:0}])} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",borderRadius:10,border:`1.5px dashed ${C.line}`,background:"transparent",color:C.sub,fontWeight:600,fontSize:13.5,cursor:"pointer",fontFamily:FONT,marginBottom:10}}><Plus size={16}/>Thêm gói</button>
      <Btn primary onClick={()=>setGoi(draft.filter((g)=>g.ten.trim()))}><Check size={18}/>Lưu danh sách gói</Btn>
    </div>
    <div style={{...box,border:`1.5px solid ${C.accent}22`}}>
      <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>
        <div style={{fontWeight:700,color:C.sub,marginBottom:6}}>Quy chế tóm tắt</div>
        <div>Khách lẻ: lũy tiến 0% / 1.5% / 2.5% / 3.5% / 5%</div>
        <div>Khách đoàn: 1% (giảm giá ≤30%) hoặc 0.5% (&gt;30%)</div>
        <div>Vaccine & Shira: 3% · Covid đoàn: 2% · IVF: 3tr/ICSI</div>
        <div>Thai sản: lũy tiến 100k→250k→500k/gói thường</div>
        <div>Thưởng tháng (trên DTT vượt khoán): 0.5%→0.7%→1%→1.2%</div>
        <div>Asahi & Thẻ bảo hiểm: không tính HH</div>
      </div>
    </div>
  </div>;
}

/* ===== THANH ĐIỀU HƯỚNG ===== */
const TABS=[
  {id:"dashboard",icon:LayoutDashboard,label:"Tổng quan"},
  {id:"danh_sach",icon:Users,label:"Khách"},
  {id:"them_khach",icon:UserPlus,label:"Thêm"},
  {id:"bao_cao",icon:BarChart3,label:"Báo cáo"},
  {id:"cai_dat",icon:Settings,label:"Cài đặt"},
];

/* ===== BACKUP DATA ===== */
function BackupData(){
  const {state:st}=useStore();
  const [msg,setMsg]=useState("");
  const fileRef=React.useRef();

  function exportData(){
    const blob=new Blob([JSON.stringify(st,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url;
    a.download=`HospitalCRM_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setMsg("✅ Đã xuất file backup!"); setTimeout(()=>setMsg(""),3000);
  }

  function importData(e){
    const file=e.target.files[0]; if(!file)return;
    const r=new FileReader();
    r.onload=(ev)=>{
      try{
        const d=JSON.parse(ev.target.result);
        if(d.khach&&d.caiDat){
          localStorage.setItem("hosp_crm_v2",JSON.stringify(d));
          setMsg("✅ Đã nhập backup! Tải lại app để thấy dữ liệu."); 
          setTimeout(()=>window.location.reload(),2000);
        } else { setMsg("❌ File không đúng định dạng"); }
      }catch(ex){ setMsg("❌ File lỗi: "+ex.message); }
    };
    r.readAsText(file);
  }

  return <div>
    <Header title="Backup & Restore" sub="Sao lưu dữ liệu khách hàng"/>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:8}}>Thông tin hiện tại</div>
      <Row label="Số khách" v={st.khach.length+" khách"}/>
      <Row label="Lịch sử liên hệ" v={st.lienHe.length+" bản ghi"}/>
    </div>
    <div style={{...box,border:`1.5px solid ${C.accent}33`}}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:6}}>Xuất backup</div>
      <div style={{fontSize:12.5,color:C.dim,marginBottom:12,lineHeight:1.5}}>Tải toàn bộ dữ liệu về máy dạng file JSON. Lưu ở nơi an toàn để dùng khi đổi điện thoại.</div>
      <button onClick={exportData} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1f995a,#157a46)",color:"#011508",fontWeight:800,fontSize:14.5,cursor:"pointer",fontFamily:FONT}}>
        <Download size={17}/> Xuất file backup
      </button>
    </div>
    <div style={box}>
      <div style={{fontSize:13.5,fontWeight:800,color:C.text,marginBottom:6}}>Nhập backup</div>
      <div style={{fontSize:12.5,color:C.dim,marginBottom:12,lineHeight:1.5}}>⚠️ Sẽ ghi đè toàn bộ dữ liệu hiện tại. Chỉ dùng khi chuyển máy hoặc khôi phục sau sự cố.</div>
      <input type="file" accept=".json" ref={fileRef} onChange={importData} style={{display:"none"}}/>
      <button onClick={()=>fileRef.current?.click()} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 0",borderRadius:12,border:`1.5px solid ${C.line}`,background:C.card,color:C.sub,fontWeight:700,fontSize:14.5,cursor:"pointer",fontFamily:FONT}}>
        <RefreshCw size={17}/> Nhập từ file backup
      </button>
    </div>
    {msg&&<div style={{textAlign:"center",color:msg.startsWith("✅")?C.accent:"#e26d6d",fontSize:13.5,fontWeight:600,padding:"10px 0"}}>{msg}</div>}
  </div>;
}

/* ===== GIÁ DỊCH VỤ ===== */
const NHOM_ICON={"Khám bệnh":"🏥","Xét nghiệm":"🧪","Siêu âm":"🔊","X-quang":"📷","CT/MRI":"🧲","Nội soi":"🔬","Phẫu thuật":"🔪","Giường bệnh":"🛏️","Thai sản":"🤱","Vaccine":"💉","Thủ thuật":"🩺","Chỉnh hình":"🦴"};
const fmtGia=(v)=>Number(v).toLocaleString("vi-VN")+"đ";

function GiaDichVu(){
  const [giaData,setGiaData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [q,setQ]=useState("");
  const [nhomSel,setNhomSel]=useState("Tất cả");
  const [copied,setCopied]=useState("");
  const inputRef=React.useRef();

  useEffect(()=>{
    fetch("/gia_dv.json?t="+Date.now())
      .then((r)=>r.json())
      .then((d)=>{setGiaData(d);setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  const nhomList=useMemo(()=>giaData?["Tất cả",...Object.keys(giaData).sort()]:[]  ,[giaData]);

  const allItems=useMemo(()=>{
    if(!giaData)return[];
    const arr=[];
    Object.entries(giaData).forEach(([nhom,items])=>items.forEach((item)=>arr.push({...item,nhom})));
    return arr;
  },[giaData]);

  // Kết quả tìm kiếm + dropdown
  const suggestions=useMemo(()=>{
    if(!q.trim()||q.length<2)return[];
    const kw=q.toLowerCase();
    return allItems.filter((i)=>i.ten.toLowerCase().includes(kw)||(i.ma&&i.ma.toLowerCase().includes(kw))).slice(0,30);
  },[allItems,q]);

  // Duyệt theo nhóm (khi không tìm kiếm)
  const byNhom=useMemo(()=>{
    if(!giaData)return{};
    if(nhomSel==="Tất cả")return giaData;
    return{[nhomSel]:giaData[nhomSel]||[]};
  },[giaData,nhomSel]);

  function copyItem(item){
    const text=`${item.ten}: ${fmtGia(item.gia)}`;
    navigator.clipboard?.writeText(text);
    setCopied(item.ma+item.ten); setTimeout(()=>setCopied(""),2000);
  }

  function selectSuggestion(item){
    // Bấm gợi ý: giữ từ khoá để hiện list lọc đầy đủ bên dưới
    setNhomSel("Tất cả");
    inputRef.current?.blur();
  }

  const showDropdown=q.length>=2&&suggestions.length>0;

  // Item card dùng chung
  function ItemCard({item}){
    const ck=item.ma+item.ten; const isCopied=copied===ck;
    return <div style={{background:C.card,border:`1.5px solid ${C.line}`,borderRadius:12,padding:"11px 13px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13.5,color:C.text,fontWeight:600,lineHeight:1.35,marginBottom:3}}>{item.ten}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
          {item.ma&&item.ma!=="nan"&&item.ma!=="undefined"&&<span style={{fontSize:11,color:C.dim,background:"#030e1a",padding:"1px 7px",borderRadius:7}}>{item.ma}</span>}
          <span style={{fontSize:11,color:C.accent+"cc",background:C.accent+"11",padding:"1px 7px",borderRadius:7}}>{NHOM_ICON[item.nhom]||"📋"} {item.nhom}</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
        <div style={{fontSize:15,fontWeight:800,color:"#ffd479",whiteSpace:"nowrap"}}>{fmtGia(item.gia)}</div>
        <button onClick={()=>copyItem(item)} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:isCopied?C.accent:C.dim,background:isCopied?C.accent+"22":"#030e1a",border:`1px solid ${isCopied?C.accent:C.line}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:FONT}}>
          {isCopied?<><Check size={11}/>Đã copy</>:<><Copy size={11}/>Copy</>}
        </button>
      </div>
    </div>;
  }

  return <div>
    <Header title="Giá dịch vụ" sub="BV Phương Đông · T03/2026"/>

    {/* Search với dropdown */}
    <div style={{position:"relative",marginBottom:12}}>
      <Search size={15} style={{position:"absolute",left:13,top:14,color:C.dim,zIndex:1}}/>
      <input ref={inputRef} style={{...inp,paddingLeft:40,paddingRight:36}}
        placeholder="Tìm nhanh tên dịch vụ..."
        value={q} onChange={(e)=>setQ(e.target.value)}
        onFocus={()=>{}}
      />
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:12,background:"none",border:"none",cursor:"pointer",color:C.dim}}><X size={16}/></button>}
      {/* Dropdown gợi ý khi đang gõ */}
      {showDropdown&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#061830",border:`1.5px solid ${C.line}`,borderRadius:12,zIndex:200,maxHeight:260,overflowY:"auto",marginTop:4,boxShadow:"0 8px 24px #00000088"}}>
          {suggestions.map((item,i)=>(
            <div key={i} onClick={()=>selectSuggestion(item)}
              style={{padding:"10px 14px",cursor:"pointer",borderBottom:i<suggestions.length-1?`1px solid ${C.line}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.5,color:C.text,fontWeight:500,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{item.ten}</div>
                <div style={{fontSize:11,color:C.dim,marginTop:2}}>{NHOM_ICON[item.nhom]||"📋"} {item.nhom}</div>
              </div>
              <div style={{fontSize:14,color:"#ffd479",fontWeight:800,whiteSpace:"nowrap",flexShrink:0}}>{fmtGia(item.gia)}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Chip nhóm cuộn ngang */}
    <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:14,scrollbarWidth:"none"}}>
      {nhomList.map((n)=>(
        <button key={n} onClick={()=>{setNhomSel(n);setQ("");}}
          style={{display:"flex",alignItems:"center",gap:5,fontSize:12.5,fontWeight:600,
            color:nhomSel===n&&!q?C.accent:C.dim,
            background:nhomSel===n&&!q?C.accent+"22":C.card,
            border:`1px solid ${nhomSel===n&&!q?C.accent:C.line}`,
            borderRadius:20,padding:"7px 13px",cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap",flexShrink:0}}>
          {n!=="Tất cả"&&<span>{NHOM_ICON[n]||"📋"}</span>}{n}
        </button>
      ))}
    </div>

    {loading&&<div style={{textAlign:"center",color:C.dim,padding:"30px 0",fontSize:13}}>Đang tải danh mục giá...</div>}
    {!loading&&!giaData&&<div style={{textAlign:"center",color:"#e26d6d",padding:"30px 0",fontSize:13}}>Không tải được danh mục. Kiểm tra mạng và thử lại.</div>}

    {/* KẾT QUẢ TÌM KIẾM — hiện khi đang gõ */}
    {!loading&&q.trim().length>=2&&(
      <div>
        <div style={{fontSize:13,color:C.sub,marginBottom:10}}>{suggestions.length} kết quả cho "{q}"</div>
        {suggestions.length===0&&<div style={{textAlign:"center",color:C.dim,padding:"20px 0",fontSize:13}}>Không tìm thấy dịch vụ phù hợp.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {suggestions.map((item,i)=><ItemCard key={i} item={item}/>)}
        </div>
      </div>
    )}

    {/* DUYỆT THEO NHÓM — hiện khi không tìm kiếm */}
    {!loading&&giaData&&!q&&Object.entries(byNhom).map(([nhom,items])=>(
      <div key={nhom} style={{marginBottom:20}}>
        <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>{NHOM_ICON[nhom]||"📋"}</span>
          <span>{nhom}</span>
          <span style={{fontSize:12,color:C.dim,fontWeight:400}}>({items.length} dịch vụ)</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {items.slice(0,nhomSel!=="Tất cả"?items.length:6).map((item,i)=>(
            <ItemCard key={item.ma+item.ten+i} item={{...item,nhom}}/>
          ))}
          {nhomSel==="Tất cả"&&items.length>6&&(
            <button onClick={()=>setNhomSel(nhom)}
              style={{width:"100%",padding:"10px 0",borderRadius:11,border:`1.5px dashed ${C.line}`,background:"transparent",color:C.accent,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:FONT}}>
              Xem tất cả {items.length} dịch vụ →
            </button>
          )}
        </div>
      </div>
    ))}

    {!loading&&giaData&&<div style={{textAlign:"center",fontSize:11.5,color:C.dim,padding:"16px 0 4px",lineHeight:1.6}}>
      Giá viện phí T03/2026 · Liên hệ CBKD để biết giá BHYT
    </div>}
  </div>;
}

const MORE_TABS=[
  {id:"mau_tin",icon:MessageSquare,label:"Mẫu tin"},
  {id:"uu_dai",icon:Tag,label:"Ưu đãi"},
  {id:"followup",icon:CalendarClock,label:"Follow-up"},
  {id:"map",icon:MapPin,label:"Map"},
  {id:"gia_dv",icon:DollarSign,label:"Giá DV"},
  {id:"backup",icon:Download,label:"Backup"},
];

/* ===== APP GỐC ===== */

/* ===== MÀN HÌNH NHẬP KEY ===== */
const KEY_LS = "hosp_crm_key";
const NAME_LS = "hosp_crm_name";
const KEYS_URL = "https://raw.githubusercontent.com/tiendo4n/hospital-crm/main/public/keys.json";

function LockScreen({ onUnlock }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!key.trim()) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch(KEYS_URL + "?t=" + Date.now());
      const data = await res.json();
      const found = data.keys.find((k) => k.key.toLowerCase() === key.trim().toLowerCase() && k.active);
      if (found) {
        localStorage.setItem(KEY_LS, key.trim());
        localStorage.setItem(NAME_LS, found.ten);
        onUnlock(found.ten);
      } else {
        setErr("Key không hợp lệ hoặc đã bị khoá.");
      }
    } catch (e) {
      setErr("Không kết nối được. Kiểm tra mạng và thử lại.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:FONT, padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo.png" alt="BV Phương Đông"
            style={{ height:90, width:90, objectFit:"contain", borderRadius:18, background:"#071e35", padding:8 }}
            onError={(e)=>{ e.target.style.display="none"; }}
          />
          <div style={{ fontSize:15, fontWeight:800, color:"#eaf4ff", marginTop:12, letterSpacing:.5 }}>BV Đa khoa Phương Đông</div>
          <div style={{ fontSize:12, color:"#5e84a3", marginTop:4 }}>Hệ thống quản lý kinh doanh</div>
        </div>
        <div style={{ background:C.card, border:`1.5px solid ${C.line}`, borderRadius:18, padding:24 }}>
          <input
            value={key} onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder=""
            style={{ ...inp, fontSize:18, letterSpacing:3, textAlign:"center", marginBottom:12 }}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {err && <div style={{ fontSize:13, color:"#e26d6d", marginBottom:10, textAlign:"center" }}>{err}</div>}
          <button onClick={check} disabled={loading} style={{ width:"100%", padding:"14px 0", borderRadius:13, border:"none", background: loading ? C.line : "linear-gradient(135deg,#1f995a,#157a46)", color:"#011508", fontWeight:800, fontSize:15, cursor: loading ? "default":"pointer", fontFamily:FONT }}>
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [unlocked, setUnlocked] = useState(() => {
    const saved = localStorage.getItem(KEY_LS);
    return saved ? saved : null;
  });
  const userName = localStorage.getItem(NAME_LS) || "";
  const [verifying, setVerifying] = useState(!!localStorage.getItem(KEY_LS));

  useEffect(() => {
    const saved = localStorage.getItem(KEY_LS);
    if (!saved) { setVerifying(false); return; }
    // Xác minh lại key mỗi lần mở app (để khoá được ngay)
    fetch(KEYS_URL + "?t=" + Date.now())
      .then((r) => r.json())
      .then((data) => {
        const found = data.keys.find((k) => k.key.toLowerCase() === saved.toLowerCase() && k.active);
        if (!found) { localStorage.removeItem(KEY_LS); setUnlocked(null); }
        setVerifying(false);
      })
      .catch(() => setVerifying(false)); // offline → cho vào tạm
  }, []);

  if (verifying) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT }}>
      <div style={{ color:C.sub, fontSize:14 }}>Đang xác minh...</div>
    </div>
  );
  if (!unlocked) return <LockScreen onUnlock={(ten) => setUnlocked(ten)} />;
  return <StoreProvider><InnerApp userName={userName}/></StoreProvider>;
}

function InnerApp({userName=""}){
  const [page,setPage]=useState("dashboard");
  const [selectedId,setSelectedId]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const {state:st,addKhach}=useStore();
  function go(p,id=null){ setPage(p); setSelectedId(id); setShowMore(false); }

  function renderPage(){
    if(page==="dashboard") return <Dashboard go={go} userName={userName}/>;
    if(page==="danh_sach") return <DanhSachKhach go={go}/>;
    if(page==="them_khach") return <KhachForm goiKham={st.goiKham} onBack={()=>go("danh_sach")} onSave={(k)=>{addKhach(k);go("danh_sach");}}/>;
    if(page==="chitiet") return <ChiTietKhach id={selectedId} go={go}/>;
    if(page==="mau_tin") return <MauTin/>;
    if(page==="uu_dai") return <UuDai/>;
    if(page==="followup") return <FollowUp go={go}/>;
    if(page==="map") return <MapBV/>;
    if(page==="bao_cao") return <BaoCao/>;
    if(page==="cai_dat") return <CaiDat/>;
    if(page==="gia_dv") return <GiaDichVu/>;
    if(page==="backup") return <BackupData/>;
    return null;
  }

  return (
    <div style={{minHeight:"100vh",minHeight:"-webkit-fill-available",background:C.bg,fontFamily:FONT,paddingBottom:"calc(72px + env(safe-area-inset-bottom, 0px))"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>
        {renderPage()}
      </div>
      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#061830",borderTop:`1px solid ${C.line}`,display:"flex",maxWidth:480,margin:"0 auto",zIndex:100,paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>
        {TABS.map((t)=>{
          const act=page===t.id; const Icon=t.icon;
          return <button key={t.id} onClick={()=>{go(t.id);setShowMore(false);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0 8px",border:"none",background:"transparent",cursor:"pointer",fontFamily:FONT}}>
            <Icon size={22} color={act?C.accent:C.dim} strokeWidth={act?2.5:2}/>
            <span style={{fontSize:10,fontWeight:act?700:500,color:act?C.accent:C.dim}}>{t.label}</span>
          </button>;
        })}
        <button onClick={()=>setShowMore((v)=>!v)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0 8px",border:"none",background:"transparent",cursor:"pointer",fontFamily:FONT}}>
          <Layers size={22} color={showMore?C.accent:C.dim} strokeWidth={showMore?2.5:2}/>
          <span style={{fontSize:10,fontWeight:showMore?700:500,color:showMore?C.accent:C.dim}}>Thêm</span>
        </button>
      </div>
      {/* More menu */}
      {showMore&&<div style={{position:"fixed",bottom:72,right:8,background:"#061830",border:`1px solid ${C.line}`,borderRadius:14,padding:8,zIndex:99,display:"flex",flexDirection:"column",gap:4}}>
        {MORE_TABS.map((t)=>{const Icon=t.icon;return <button key={t.id} onClick={()=>go(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",fontFamily:FONT,color:C.sub,fontSize:14,fontWeight:600,borderRadius:10}}><Icon size={18} color={C.accent}/>{t.label}</button>;})}
      </div>}
    </div>
  );
}
