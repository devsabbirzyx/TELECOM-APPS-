import PDFDocument from 'pdfkit';

export const generateOrderReceiptPdf = (order, stream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(stream);

  // Header Banner
  doc.rect(0, 0, doc.page.width, 90).fill('#1E3A8A');
  doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('OfferHut', 40, 25);
  doc.fontSize(10).font('Helvetica').text('Bangladesh Telecom SIM Offer Marketplace', 40, 55);
  doc.fontSize(14).font('Helvetica-Bold').text('PAYMENT RECEIPT', doc.page.width - 200, 35, { align: 'right' });

  doc.moveDown(3);

  // Order Details Box
  const startY = 120;
  doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('Order Summary', 40, startY);
  
  doc.fontSize(10).font('Helvetica');
  doc.text(`Order ID: ${order.id}`, 40, startY + 25);
  doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 40, startY + 40);
  doc.text(`Status: ${order.status.toUpperCase()}`, 40, startY + 55);
  doc.text(`Payment Method: ${order.payment_method?.toUpperCase() || 'bKash'}`, 40, startY + 70);
  doc.text(`Transaction ID: ${order.transaction_id || 'N/A'}`, 40, startY + 85);

  // Recipient Box
  doc.text(`Recipient SIM Number: ${order.recipient_number}`, 320, startY + 25);
  doc.text(`Operator: ${order.offers?.operators?.name || 'Telecom Operator'}`, 320, startY + 40);
  doc.text(`Package: ${order.offers?.title || 'Offer Bundle'}`, 320, startY + 55);
  doc.text(`Validity: ${order.offers?.validity_days || 30} Days`, 320, startY + 70);

  // Divider
  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, startY + 115).lineTo(doc.page.width - 40, startY + 115).stroke();

  // Price Table
  const tableY = startY + 130;
  doc.font('Helvetica-Bold').fontSize(11).text('Description', 40, tableY);
  doc.text('Amount (BDT)', doc.page.width - 150, tableY, { align: 'right' });

  doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, tableY + 18).lineTo(doc.page.width - 40, tableY + 18).stroke();

  doc.font('Helvetica').fontSize(10);
  doc.text(`${order.offers?.title || 'SIM Offer Package'} (${order.recipient_number})`, 40, tableY + 30);
  doc.text(`৳${Number(order.amount).toFixed(2)}`, doc.page.width - 150, tableY + 30, { align: 'right' });

  if (Number(order.wallet_used) > 0) {
    doc.text('Wallet Balance Discount Applied', 40, tableY + 50);
    doc.text(`-৳${Number(order.wallet_used).toFixed(2)}`, doc.page.width - 150, tableY + 50, { align: 'right' });
  }

  // Total Line
  const totalY = tableY + (Number(order.wallet_used) > 0 ? 80 : 60);
  doc.strokeColor('#1E3A8A').lineWidth(1.5).moveTo(40, totalY).lineTo(doc.page.width - 40, totalY).stroke();

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1E3A8A');
  doc.text('Total Paid:', 40, totalY + 10);
  doc.text(`৳${Number(order.final_amount).toFixed(2)}`, doc.page.width - 150, totalY + 10, { align: 'right' });

  // Footer Note
  const footerY = totalY + 80;
  doc.fillColor('#64748B').fontSize(9).font('Helvetica');
  doc.text('Thank you for using OfferHut! If your pack is not activated within 15 minutes, please reach out to our Live Support.', 40, footerY, { align: 'center', width: doc.page.width - 80 });
  doc.text('support@offerhut.com.bd | Hotline: +880 9612 000000', 40, footerY + 18, { align: 'center', width: doc.page.width - 80 });

  doc.end();
};
