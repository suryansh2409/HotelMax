/**
 * Generates an itemized HTML invoice for printable booking receipts
 */
const generateInvoiceHtml = (booking, hotel, payment = null) => {
  const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${booking.bookingReference}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 40px; background: #fff; }
    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.08); font-size: 15px; line-height: 24px; }
    .header-table, .details-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .title { font-size: 28px; font-weight: bold; color: #1a2b4c; }
    .gold-accent { color: #b8860b; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
    .badge-confirmed { background: #e8f5e9; color: #2e7d32; }
    .badge-cancelled { background: #ffebee; color: #c62828; }
    .items-table th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; }
    .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .total-row { font-weight: bold; font-size: 18px; color: #1a2b4c; }
    .footer { text-align: center; color: #777; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; }
    @media print {
      body { padding: 0; }
      .invoice-box { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <table class="header-table">
      <tr>
        <td>
          <div class="title">Hotel<span class="gold-accent">Pro</span></div>
          <div>${hotel.name}</div>
          <div>${hotel.address}, ${hotel.city}, ${hotel.state}</div>
          <div>Email: ${hotel.contactEmail} | Tel: ${hotel.contactPhone}</div>
        </td>
        <td class="text-right">
          <h2 style="margin: 0; color: #1a2b4c;">TAX INVOICE</h2>
          <div style="font-weight: bold; font-size: 16px; margin: 5px 0;">Reference: ${booking.bookingReference}</div>
          <div>Date: ${new Date(booking.createdAt).toLocaleDateString()}</div>
          <div style="margin-top: 6px;">
            <span class="badge ${booking.status === 'confirmed' || booking.status === 'completed' ? 'badge-confirmed' : 'badge-cancelled'}">
              ${booking.status.replace('_', ' ')}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <table class="details-table">
      <tr style="background: #f8f9fa;">
        <td style="padding: 15px; width: 50%; vertical-align: top; border-right: 1px solid #dee2e6;">
          <strong style="color: #1a2b4c;">Billed To:</strong><br>
          ${booking.guestDetails.fullName}<br>
          Email: ${booking.guestDetails.email}<br>
          Phone: ${booking.guestDetails.phone}
        </td>
        <td style="padding: 15px; width: 50%; vertical-align: top;">
          <strong style="color: #1a2b4c;">Reservation Summary:</strong><br>
          Room: ${booking.room.title || 'Room ' + booking.room.roomNumber} (${booking.room.type})<br>
          Check-in: ${checkIn}<br>
          Check-out: ${checkOut}<br>
          Length of stay: ${booking.totalNights} night(s)
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Room Charge (${booking.room.type} Room)</td>
          <td class="text-right">$${booking.priceBreakdown.nightlyRate.toFixed(2)}</td>
          <td class="text-right">${booking.totalNights} night(s)</td>
          <td class="text-right">$${booking.priceBreakdown.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Hospitality Tax & Tourism Fee</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">$${booking.priceBreakdown.taxes.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Sanitization & Cleaning Fee</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">$${booking.priceBreakdown.cleaningFee.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right">Total Amount Due/Paid:</td>
          <td class="text-right" style="color: #b8860b;">$${booking.priceBreakdown.totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #fdfaf0; border-left: 4px solid #b8860b; padding: 12px; margin-bottom: 20px; font-size: 13px;">
      <strong>Payment Status:</strong> ${payment ? `PAID via ${payment.paymentMethod.toUpperCase()} (TXN: ${payment.transactionId})` : (booking.status === 'confirmed' ? 'PAID' : 'PENDING')}
    </div>

    <div class="footer">
      <p>Thank you for choosing HotelPro. For inquiries or reservation assistance, contact our 24/7 concierge at ${hotel.contactEmail}.</p>
      <p style="font-size: 11px; color: #aaa;">This is a computer-generated tax invoice. No signature required.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = { generateInvoiceHtml };
