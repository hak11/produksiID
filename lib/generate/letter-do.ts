import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
  DetailDOType
} from "@/lib/db/schema"; 


export function generateDeliveryOrderPDF(data: DetailDOType): Blob {
  const pdf = new jsPDF({
    format: 'a4',
    unit: 'mm'
  });

  // Add company logo
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Surat Jalan', 10, 20);

  // Company details in top right corner
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const rightColumnX = 200;
  // pdf.text('powered by: produksi.id', rightColumnX, 10, { align: 'right' });
  // pdf.text('yourbrand@gmail.com', rightColumnX, 15, { align: 'right' });
  // pdf.text('www.yourbrand.com', rightColumnX, 20, { align: 'right' });
  // pdf.text('Praesent viera street no. 27', rightColumnX, 25, { align: 'right' });
  pdf.text('PT Andreasssss', rightColumnX, 15, { align: 'right' });
  pdf.text('CS: 08xx-xxxx-xxx', rightColumnX, 20, { align: 'right' });

  // Left side details
  const leftColumnX = 10;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('DELIVERY NO :', leftColumnX, 40);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${data.orderNumber}`, leftColumnX, 45);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TANGGAL CETAK:', leftColumnX, 55);
  pdf.setFont('helvetica', 'normal');
  pdf.text(format(new Date(), 'dd-MM-yyyy'), leftColumnX, 60);
  
  // pdf.text('CUSTOMER P.O. :', leftColumnX, 70);
  // pdf.text('-', leftColumnX, 75);

  // Main title - Delivery Order
  // pdf.setFontSize(24);
  // pdf.setFont('helvetica', 'bold');
  // pdf.text('Delivery Order', 105, 50, { align: 'center' });

  // Delivery details in two columns
  pdf.setFontSize(10);
  
  // Deliver To section
  const deliverToX = 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pickup From :', deliverToX, 70);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.supplier.name, deliverToX, 75);
  pdf.text(data.supplier.address, deliverToX, 80, { maxWidth: 50});
  // pdf.text(data.supplier.picPhone, deliverToX, 85);

  // Delivery Address section
  const addressX = 120;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Delivery To :', addressX, 70);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.customer.name, addressX, 75);
  pdf.text(data.customer.address, addressX, 80, { maxWidth: 50});
  // pdf.text(data.customer.picPhone, addressX, 85);

  const tableData = data.items.map((item, index) => {
    return {
      no: index + 1,
      nameItem: item.nameItem || "",
      loadQty: item.loadQty || "",
      actual: "",
    }
  });

  // Single table
  autoTable(pdf, {
    startY: 95,
    head: [['NO', 'DESCRIPTION', 'QTY', 'QTY ACTUAL']],
    body: tableData.map(row => [row.no, row.nameItem, row.loadQty, row.actual]),
    theme: 'striped',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  const pageHeight = pdf.internal.pageSize.height;
  const marginBottom = 20;
  const noteY = pageHeight - marginBottom - 50;
  const signatureY = pageHeight - marginBottom; 

  // Note section
  // const finalYafterTable = (pdf as any).lastAutoTable.finalY;

  // const noteY = finalYafterTable + 20;
  pdf.text('NOTE :', 10, noteY);
  pdf.line(10, noteY + 5, 200, noteY + 5);

  // Signature section
  // const signatureY = noteY + 30;
  
  pdf.text('SUPPLIER', 35, signatureY, { align: 'center' });
  pdf.text('DRIVER', 105, signatureY, { align: 'center' });
  pdf.text('CUSTOMER', 175, signatureY, { align: 'center' });
  
  pdf.line(10, signatureY + 5, 60, signatureY + 5);
  pdf.line(80, signatureY + 5, 130, signatureY + 5);
  pdf.line(150, signatureY + 5, 200, signatureY + 5);

  return pdf.output('blob');
}

