
export const formatCurrency = (amount: number): string => {
  return "KES " + Math.round(amount).toLocaleString();
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'cleared':
      return 'text-emerald-400 bg-emerald-400/10';
    case 'pending':
    case 'active':
      return 'text-amber-400 bg-amber-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
};

export const exportToWord = (title: string, headers: string[], rows: any[][]) => {
  const headerHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 12px; }
      th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; }
      h1 { text-align: center; color: #333; margin-bottom: 5px; }
      .meta { text-align: center; color: #666; font-size: 10px; margin-bottom: 20px; }
    </style>
    </head><body>
  `;
  const footerHtml = "</body></html>";
  
  const content = `
    <h1>${title}</h1>
    <div class="meta">Boutique Master Suite • Generated on ${new Date().toLocaleString()}</div>
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob(['\ufeff', headerHtml + content + footerHtml], { type: 'application/msword' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
  link.click();
};

export const printReceipt = (sale: any) => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) return;

  const content = `
    <html>
    <head>
      <title>Receipt - ${sale.id}</title>
      <style>
        @media print {
          @page { margin: 0; size: 58mm auto; }
          body { margin: 0; padding: 2mm; width: 54mm; }
        }
        body { 
          font-family: 'Courier New', Courier, monospace; 
          width: 54mm; 
          color: #000; 
          font-size: 11px; 
          line-height: 1.2;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 4px 0; }
        .flex { display: flex; justify-content: space-between; }
        .title { font-size: 14px; margin-bottom: 2px; letter-spacing: 1px; }
        .footer { font-size: 9px; margin-top: 10px; line-height: 1.4; }
        .item-row { margin: 2px 0; }
      </style>
    </head>
    <body>
      <div class="center bold title">BIASHARA MASTER</div>
      <div class="center bold">BOUTIQUE EDITION</div>
      <div class="center">Nairobi, Kenya</div>
      <div class="center">TEL: +254 700 000 000</div>
      
      <div class="line"></div>
      
      <div class="flex"><span>DATE:</span><span>${new Date(sale.date).toLocaleDateString()}</span></div>
      <div class="flex"><span>TIME:</span><span>${new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
      <div class="flex"><span>TXN#:</span><span>${sale.id.toUpperCase()}</span></div>
      
      <div class="line"></div>
      
      <div class="bold">DESCRIPTION       QTY      PRICE</div>
      <div class="item-row flex">
        <span style="flex: 2;">${sale.itemName.padEnd(16).substring(0,16)}</span>
        <span style="flex: 1; text-align: center;">${sale.quantity}</span>
        <span style="flex: 1; text-align: right;">${Math.round(sale.totalPrice)}</span>
      </div>
      
      <div class="line"></div>
      
      <div class="flex bold" style="font-size: 13px;">
        <span>GRAND TOTAL:</span>
        <span>KES ${Math.round(sale.totalPrice).toLocaleString()}</span>
      </div>
      
      <div class="line"></div>
      
      <div class="center footer">
        <div class="bold">THANK YOU FOR VISITING!</div>
        GOODS ONCE SOLD ARE NOT RETURNABLE.<br>
        EXCHANGE WITHIN 7 DAYS WITH RECEIPT.<br>
        --- Powered by Biashara Master ---
      </div>
      
      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => window.close(), 500);
        };
      </script>
    </body>
    </html>
  `;

  receiptWindow.document.write(content);
  receiptWindow.document.close();
};
