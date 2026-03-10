export const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
  :root{--acid:#d4f000;--black:#080808;--white:#f5f0e8;--mid:#1a1a1a;--border:#2a2a2a;--red:#ff2d2d;--green:#00e676;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{color-scheme:dark;}
  body{background:var(--black)!important;color:var(--white)!important;font-family:'DM Sans',sans-serif!important;cursor:default;}
  a,button,[role=button],[onclick]{cursor:pointer;}
  input,textarea,select{cursor:text;caret-color:var(--acid);}
  input[type=checkbox],input[type=radio]{cursor:pointer;}
  *:disabled{cursor:not-allowed!important;}
  .dc{background:var(--mid);border:1px solid var(--border);padding:24px;}
  .dc-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:10px;}
  .dc-val{font-family:'Bebas Neue',sans-serif;font-size:48px;line-height:1;color:var(--white);}
  .dc-val.a{color:var(--acid);}
  .dc-sub{font-size:12px;color:#555;margin-top:6px;}
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:24px;}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-bottom:24px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;}
  .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .st{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;}
  .ss{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-top:2px;}
  .btn{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;padding:12px 24px;border:none;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;}
  .btn-a{background:var(--acid);color:var(--black);}
  .btn-a:hover{background:#fff;}
  .btn-g{background:transparent;color:#666;border:1px solid var(--border);}
  .btn-g:hover{border-color:var(--acid);color:var(--acid);}
  .btn-r{background:transparent;color:var(--red);border:1px solid rgba(255,45,45,.3);}
  .btn-r:hover{background:rgba(255,45,45,.08);}
  .btn:disabled{opacity:.4;cursor:not-allowed;}
  .tbl{width:100%;border-collapse:collapse;}
  .tbl th{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#444;padding:12px 16px;border-bottom:1px solid var(--border);text-align:left;font-weight:400;}
  .tbl td{padding:14px 16px;border-bottom:1px solid var(--border);font-size:14px;color:#aaa;}
  .tbl tr:last-child td{border-bottom:none;}
  .tbl tr:hover td{background:rgba(255,255,255,.02);}
  .td-w{color:var(--white);font-weight:500;}
  .td-m{font-family:'Space Mono',monospace;font-size:11px;}
  .td-a{color:var(--acid);font-family:'Space Mono',monospace;font-size:12px;font-weight:700;}
  .badge{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;display:inline-block;}
  .b-pending{background:rgba(255,200,0,.15);color:#ffc800;}
  .b-accepted{background:rgba(212,240,0,.15);color:var(--acid);}
  .b-rejected{background:rgba(255,45,45,.15);color:var(--red);}
  .b-played{background:rgba(100,100,100,.2);color:#666;}
  .inp{width:100%;background:var(--black);border:1px solid var(--border);padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--white);outline:none;transition:border-color .2s;}
  .inp:focus{border-color:var(--acid);}
  .inp::placeholder{color:#444;}
  .lbl{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;display:block;}
  .field{margin-bottom:16px;}
  .empty{text-align:center;padding:80px 24px;}
  .empty-icon{font-size:40px;margin-bottom:16px;}
  .empty-t{font-family:'Bebas Neue',sans-serif;font-size:28px;color:#333;margin-bottom:8px;}
  .empty-s{font-family:'Space Mono',monospace;font-size:10px;color:#444;letter-spacing:1px;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .live{display:flex;align-items:center;gap:8px;font-family:'Space Mono',monospace;font-size:10px;color:var(--acid);letter-spacing:2px;}
  .live-dot{width:8px;height:8px;border-radius:50%;background:var(--acid);animation:pulse 1.5s ease-in-out infinite;}
  @keyframes slide-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  .req{display:flex;align-items:center;gap:16px;padding:20px 24px;background:var(--mid);border:1px solid var(--border);margin-bottom:2px;}
  .req.new{border-color:var(--acid);animation:slide-in .4s ease;}
  .req-num{font-family:'Bebas Neue',sans-serif;font-size:32px;color:#2a2a2a;min-width:40px;}
  .req-info{flex:1;}
  .req-track{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;color:var(--white);line-height:1;}
  .req-artist{font-size:13px;color:#666;margin-top:2px;}
  .req-ded{font-family:'Space Mono',monospace;font-size:10px;color:var(--acid);margin-top:6px;}
  .req-amt{font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--acid);min-width:80px;text-align:right;}
  .req-acts{display:flex;gap:8px;}
  .acc{background:var(--acid);color:var(--black);border:none;padding:10px 20px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:background .2s;}
  .acc:hover{background:#fff;}
  .acc:disabled,.rej:disabled{opacity:.4;cursor:not-allowed;}
  .rej{background:transparent;color:#555;border:1px solid var(--border);padding:10px 20px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
  .rej:hover{border-color:var(--red);color:var(--red);}
  .upload{border:2px dashed var(--border);padding:48px;text-align:center;transition:border-color .2s,background .2s;cursor:pointer;}
  .upload:hover,.upload.drag{border-color:var(--acid);background:rgba(212,240,0,.03);}
  .upload-icon{font-size:36px;margin-bottom:16px;}
  .upload-t{font-family:'Bebas Neue',sans-serif;font-size:24px;margin-bottom:8px;}
  .upload-s{font-family:'Space Mono',monospace;font-size:10px;color:#555;letter-spacing:1px;}
  .tog-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border);}
  .tog-row:last-child{border-bottom:none;}
  .tog-lbl{font-size:14px;color:var(--white);}
  .tog-sub{font-size:12px;color:#555;margin-top:2px;}
  .tog{position:relative;width:44px;height:24px;flex-shrink:0;}
  .tog input{opacity:0;width:0;height:0;}
  .tog-sl{position:absolute;inset:0;background:var(--border);border-radius:24px;cursor:pointer;transition:background .2s;}
  .tog-sl::before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;background:#666;border-radius:50%;transition:transform .2s,background .2s;}
  .tog input:checked+.tog-sl{background:rgba(212,240,0,.3);}
  .tog input:checked+.tog-sl::before{transform:translateX(20px);background:var(--acid);}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(212,240,0,.2);border-top-color:var(--acid);border-radius:50%;animation:spin .7s linear infinite;}
  .chart{display:flex;align-items:flex-end;gap:4px;height:120px;}
  .bar-w{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;}
  .bar{width:100%;background:var(--acid);border-radius:2px 2px 0 0;opacity:.7;transition:opacity .2s;}
  .bar:hover{opacity:1;}
  .bar-l{font-family:'Space Mono',monospace;font-size:7px;color:#444;text-transform:uppercase;letter-spacing:1px;}
  @media(max-width:768px){.g4,.g3{grid-template-columns:1fr 1fr;}.g2{grid-template-columns:1fr;}.req{flex-wrap:wrap;}}
`
