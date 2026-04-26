import { jsPDF } from 'jspdf';

/**
 * Generates a professional PDF receipt for a sale.
 * @param {Object} sale - The sale record
 * @param {Array} items - List of items in the sale
 * @param {Object} customer - Customer details
 */
export const generateReceipt = (sale, items, customer) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // Thermal receipt style
  });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SADIQ WHOLESALE', 40, 15, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Drink Distribution Experts', 40, 20, { align: 'center' });
  doc.text('------------------------------------------', 40, 25, { align: 'center' });

  // Sale Info
  doc.text(`Receipt #: ${sale.id}`, 5, 32);
  doc.text(`Date: ${new Date(sale.created_at).toLocaleString()}`, 5, 36);
  doc.text(`Customer: ${customer?.name || 'General Customer'}`, 5, 40);
  doc.text('------------------------------------------', 40, 45, { align: 'center' });

  // Items Header
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, 52);
  doc.text('Qty', 35, 52);
  doc.text('Price', 50, 52);
  doc.text('Total', 65, 52);
  doc.setFont('helvetica', 'normal');

  let y = 58;
  items.forEach(item => {
    const name = item.product_name || `Product ${item.product_id}`;
    doc.text(name.substring(0, 15), 5, y);
    doc.text(`${item.quantity} ${item.unit_type === 'crate' ? 'Cr' : 'Bt'}`, 35, y);
    doc.text(item.unit_price.toFixed(2), 50, y);
    doc.text((item.unit_price * item.quantity).toFixed(2), 65, y);
    y += 5;
  });

  // Footer
  doc.text('------------------------------------------', 40, y + 2, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 5, y + 8);
  doc.text(`GH₵ ${sale.total_amount.toFixed(2)}`, 65, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 40, y + 18, { align: 'center' });
  doc.text('No refunds after 24 hours.', 40, y + 22, { align: 'center' });

  // Save/Download
  doc.save(`receipt_${sale.id}.pdf`);
};
