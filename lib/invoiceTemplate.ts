import { InvoiceFormValues, Invoice } from '@/types/invoiceType';

/**
 * Generate styled HTML for a single invoice matching design
 */
export function generateInvoiceHtml(data: InvoiceFormValues): string {
    // Fallback: if reservation_ref isn't populated yet, fall back to data.reservation
    const ticketId =
        data.reservation_ref?.ticket_id ||
        // data.reservation?.ticket_id?.toString() ||
        '';
    const destination =
        data.reservation_ref?.destination ||
        // data.reservation?.destination ||
        '';
    const paxName =
        data.reservation_ref?.name ||
        // data.reservation?.name ||
        '';
    const pricePerPack = data.total_amount || 0;

    // Build table rows (supporting multiple tickets if present)
    const tickets = Array.isArray(data.reservation_ref?._id) 
        ? data.reservation_ref._id 
        : [{ ticket_id: ticketId, name: paxName, remark: data.status || '', price: pricePerPack }];

    const rows = tickets.map((pdf: { price: { toLocaleString: (arg0: string) => any; }; }) => `
        <tr>
            <td>${new Date(data.issued_date || new Date()).toLocaleDateString('id-ID')}</td>
            <td>${ticketId || ''}</td>
            <td>${destination}</td>
            <td>${paxName|| ''}</td>
            <td style="text-align:right;">Rp ${pdf.price?.toLocaleString('id-ID') || '0'}</td>
            <td style="text-align:right;">Rp ${(pdf.price || 0).toLocaleString('id-ID')}</td>
        </tr>
    `).join('');

    const grandTotal = (data.total_amount || 0) + (data.fee || 0);

    // terbilang placeholder - implement conversion if needed
    const terbilang = '#NAME?';
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
    <html>
    <head>
        <style>
            body { font-family: sans-serif; margin:0; padding:0; font-size:9px; }
            .container { padding:10px; }
            .header { text-align:center; margin-bottom:10px; }
            .header h1 { margin:10px; font-size:18px; }
            .company { position:absolute; top:10px; right:10px; text-align:right; }
            .company p { margin:2px 0; font-size:9px; }
            .info { margin-bottom:8px; font-size:9px; }
            .info p { margin:2px 0; }
            table { width:100%; border-collapse: collapse; margin-bottom:8px; font-size:9px; }
            th, td { border:1px solid #000; padding:4px; }
            th { background:#ddd; }
            .total-row td { border:none; }
            .total { text-align:right; font-weight:bold; font-size:11px; }
            .terbilang { margin-top:4px; font-size:9px; }
            .footer { margin-top:10px; font-size:9px; }
            .signature { float:right; text-align:center; margin-top:20px; font-size:9px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>INVOICE</h1>
            </div>
            <div class="company">
                <img src="/img/logo-karisma.jpg" alt="Logo" style="height:50px;" />
                <p>KARISMA TOUR AND TRAVEL</p>
                <p>Perum Grand Soeroso Kav 24 Malang</p>
                <p>081217369484</p>
                <p>karisma.travel@yahoo.co.id</p>
            </div>
            <div class="info">
                <p><strong>Bill to:</strong></p>
                <p>Name      : ${paxName}</p>
                <p>Address   : ${destination}</p>
                <p>Phone No. : ${data.reservation_ref?.contact || '-'}]</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Remark</th>
                        <th>Route</th>
                        <th>Pax Name</th>
                        <th>Price / Pack</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" class="total">Total</td>
                        <td style="text-align:right; font-weight:bold;">Rp ${grandTotal.toLocaleString('id-ID')}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="terbilang"><strong>Terbilang:</strong> ${terbilang}</div>
            <div class="footer">
                <p>${destination}, ${today}</p>
            </div>
            <div class="signature">
                <p>Erik Andrias B.P</p>
            </div>
            <div style="clear:both;"></div>
            <div class="footer" style="margin-top:60px;">
                <p>Transfer Bank Mandiri a.n Erik Andrias Budi Prasetyo SAB</p>
                <p>No. Rek 144 00 0012684 4</p>
            </div>
            <div class="footer" style="text-align:center; margin-top:20px;">
                <strong>THANK YOU FOR YOUR ORDER</strong>
            </div>
        </div>
    </body>
    </html>
    `;
}