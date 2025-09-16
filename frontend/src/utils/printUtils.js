// Use high quality logo for printing
import logoLongTransparent from '../assets/branding/full_logo_high.png';

export const printHtmlContent = (title, heading, innerHTML, logoUrl=logoLongTransparent) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;margin:40px;color:#001529;}
      .logo{max-width:220px;margin:0 auto 20px;display:block;}
      h2{text-align:center;margin-top:0;font-weight:600;}
      ul{margin-left:20px;}
    </style>
  </head><body>
    <img class="logo" src="${logoUrl}" alt="VirtualMD Logo" />
    <h2>${heading}</h2>
    <div>${innerHTML}</div>
  </body></html>`;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}; 