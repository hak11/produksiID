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
  pdf.text('LFLV', 10, 20);

  // Company details in top right corner
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const rightColumnX = 200;
  pdf.text('+88 12 345 6789', rightColumnX, 10, { align: 'right' });
  pdf.text('yourbrand@gmail.com', rightColumnX, 15, { align: 'right' });
  pdf.text('www.yourbrand.com', rightColumnX, 20, { align: 'right' });
  pdf.text('Praesent viera street no. 27', rightColumnX, 25, { align: 'right' });
  pdf.text('West Nulla city,', rightColumnX, 30, { align: 'right' });
  pdf.text('Leaflove 5100', rightColumnX, 35, { align: 'right' });

  // Left side details
  const leftColumnX = 10;
  
  pdf.text('DELIVERY NO :', leftColumnX, 40);
  pdf.text(`${data.orderNumber}`, leftColumnX, 45);
  
  pdf.text('ISSUE DATE :', leftColumnX, 55);
  pdf.text(format(new Date(), 'dd-MM-yyyy'), leftColumnX, 60);
  
  pdf.text('CUSTOMER P.O. :', leftColumnX, 70);
  pdf.text('A-8202002162', leftColumnX, 75);

  // Main title - Delivery Order
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Delivery Order', 105, 50, { align: 'center' });

  // Delivery details in two columns
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Deliver To section
  const deliverToX = 105;
  pdf.text('DELIVER TO :', deliverToX, 70);
  pdf.text('Ariella Moldekin', deliverToX, 75);
  pdf.text('+88 12 345 6789 100', deliverToX, 80);
  pdf.text('email_here@gmail.com', deliverToX, 85);

  // Delivery Address section
  const addressX = 150;
  pdf.text('DELIVERY ADDRES :', addressX, 70);
  pdf.text('Vomnes derovit street no. 18', addressX, 75);
  pdf.text('North Sequi city,', addressX, 80);
  pdf.text('Leaflove 5100', addressX, 85);

  // Table data
  const tableData = [
    { no: '1', description: 'Item description here', quantity: '10' },
    { no: '2', description: 'Item description here', quantity: '15' },
    { no: '3', description: 'Item description here', quantity: '10' },
    { no: '4', description: 'Item description here', quantity: '15' },
    { no: '5', description: 'Item description here', quantity: '10' },
    { no: '6', description: 'Item description here', quantity: '15' },
  ];

  // Single table
  autoTable(pdf, {
    startY: 95,
    head: [['NO', 'DESCRIPTION', 'QUANTITY']],
    body: tableData.map(row => [row.no, row.description, row.quantity]),
    theme: 'plain',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Note section
  const finalYafterTable = (pdf as any).lastAutoTable.finalY;

  const noteY = finalYafterTable + 20;
  pdf.text('NOTE :', 10, noteY);
  pdf.line(10, noteY + 5, 200, noteY + 5);

  // Signature section
  const signatureY = noteY + 30;
  
  pdf.text('SELLER', 35, signatureY, { align: 'center' });
  pdf.text('DRIVER', 105, signatureY, { align: 'center' });
  pdf.text('BUYER', 175, signatureY, { align: 'center' });
  
  pdf.line(10, signatureY + 5, 60, signatureY + 5);
  pdf.line(80, signatureY + 5, 130, signatureY + 5);
  pdf.line(150, signatureY + 5, 200, signatureY + 5);

  return pdf.output('blob');
}

