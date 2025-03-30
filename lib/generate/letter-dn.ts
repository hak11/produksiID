import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export type DeliveryNoteData = {
  id: string
  teamId: string
  noteNumber: string
  issueDate: string // format 'YYYY-MM-DD'
  status: string
  remarks: string
  createdAt: string
  updatedAt: string
  dnItems: {
    name: string
    supplierName: string
    deliveryDate: string
    customerName: string
    loadQty: number
    doNumber: string
    actualQty: number
    deliveryOrderId: string
    deliveryOrderItemId: string
  }[]
}

// Fungsi untuk menggambar header di setiap halaman dengan format title: value,
// di mana hanya nilai (value) yang dicetak tebal.
function drawHeader(
  doc: jsPDF,
  options: {
    noteNumber: string
    issueDate: string
    supplierName: string
    customersText: string
    currentPage: number
    totalPages: number
    leftMargin: number
    pdfWidth: number
    teamData: any
  }
) {
  // Baris 1: Judul dan info perusahaan
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DELIVERY NOTE", options.leftMargin, 10)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(options.teamData.name, options.pdfWidth - options.leftMargin, 10, {
    align: "right",
  })
  doc.text(
    `Telp: ${options.teamData.contact_phone} | Email: ${options.teamData.contact_email}`,
    options.pdfWidth - options.leftMargin,
    14,
    {
      align: "right",
    }
  )
  doc.text(
    `Alamat: ${options.teamData.contact_address}`,
    options.pdfWidth - options.leftMargin,
    18,
    { align: "right" }
  )

  // Baris 2: Delivery Note No dan Issue Date (sejajar)
  let pagePrefix = ''

  if (options.totalPages > 1) {
    pagePrefix = `(${options.currentPage + 1}/${options.totalPages + 1})`;
  }
  
  const headerYRow2 = 26
  // Delivery Note No:
  const dnTitle = "Delivery Note No: "
  doc.setFont("helvetica", "normal")
  doc.text(dnTitle, options.leftMargin, headerYRow2)
  const dnTitleWidth = doc.getTextWidth(dnTitle)
  doc.setFont("helvetica", "bold")
  doc.text(
    `${options.noteNumber} ${pagePrefix}`,
    options.leftMargin + dnTitleWidth,
    headerYRow2
  )

  // Issue Date:
  const issueTitle = "Issue Date: "
  doc.setFont("helvetica", "normal")
  const issueValue = options.issueDate
  const issueFullText = issueTitle + issueValue
  const issueTextWidth = doc.getTextWidth(issueFullText)
  // Posisi X untuk issue date = mulai dari kanan dengan margin
  const issueX = options.pdfWidth - options.leftMargin - issueTextWidth
  doc.text(issueTitle, issueX, headerYRow2)
  const issueTitleWidth = doc.getTextWidth(issueTitle)
  doc.setFont("helvetica", "bold")
  doc.text(issueValue, issueX + issueTitleWidth, headerYRow2)

  // Baris 3: Supplier dan Customer
  const headerYRow3 = 34
  // Supplier:
  const supplierTitle = "Supplier: "
  doc.setFont("helvetica", "normal")
  doc.text(supplierTitle, options.leftMargin, headerYRow3)
  const supplierTitleWidth = doc.getTextWidth(supplierTitle)
  doc.setFont("helvetica", "bold")
  doc.text(
    options.supplierName,
    options.leftMargin + supplierTitleWidth,
    headerYRow3
  )

  // Customer:
  const customerTitle = "Customer: "
  doc.setFont("helvetica", "normal")
  const customerFull = customerTitle + options.customersText
  const customerTextWidth = doc.getTextWidth(customerFull)
  const customerX = options.pdfWidth - options.leftMargin - customerTextWidth
  doc.text(customerTitle, customerX, headerYRow3)
  const customerTitleWidth = doc.getTextWidth(customerTitle)
  doc.setFont("helvetica", "bold")
  doc.text(options.customersText, customerX + customerTitleWidth, headerYRow3)

  // Garis bawah header
  doc.setLineWidth(0.5)
  doc.line(options.leftMargin, 38, options.pdfWidth - options.leftMargin, 38)
}

// Fungsi untuk menggambar area tanda tangan di bagian bawah setiap halaman
function drawSignature(
  doc: jsPDF,
  leftMargin: number,
  pdfWidth: number,
  pdfHeight: number
) {
  const signatureY = pdfHeight - 30 // 30 mm dari bawah
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text("SUPPLIER", leftMargin + 20, signatureY, { align: "center" })
  doc.text("DRIVER", pdfWidth / 2, signatureY, { align: "center" })
  doc.text("CUSTOMER", pdfWidth - leftMargin - 20, signatureY, {
    align: "center",
  })
  doc.line(leftMargin + 5, signatureY + 4, leftMargin + 35, signatureY + 4)
  doc.line(pdfWidth / 2 - 15, signatureY + 4, pdfWidth / 2 + 15, signatureY + 4)
  doc.line(
    pdfWidth - leftMargin - 35,
    signatureY + 4,
    pdfWidth - leftMargin - 5,
    signatureY + 4
  )
}

export function generateDeliveryNotePDF(data: DeliveryNoteData, teamData: any): Blob {
  /**
   * Kertas A5 landscape: 210 x 148 mm
   * Margin: 10 mm di setiap sisi → area konten efektif = 210 - 20 = 190 mm
   */
  const leftMargin = 10
  const pdfWidth = 210
  const pdfHeight = 148
  const effectiveWidth = pdfWidth - leftMargin * 2 // 190 mm

  const pdf = new jsPDF({
    format: "a5",
    orientation: "landscape",
    unit: "mm",
  })

  // Kelompokkan dnItems berdasarkan supplierName
  const supplierGroups = new Map<string, typeof data.dnItems>()
  data.dnItems.forEach((item) => {
    const supplier = item.supplierName
    if (!supplierGroups.has(supplier)) {
      supplierGroups.set(supplier, [])
    }
    supplierGroups.get(supplier)!.push(item)
  })

  let isFirstGroup = true
  // Iterasi untuk tiap supplier group → tiap supplier akan dibuat lampiran tersendiri.
  supplierGroups.forEach((items, supplierName) => {
    if (!isFirstGroup) {
      pdf.addPage()
    }
    isFirstGroup = false

    // Ambil daftar customer unik untuk supplier ini
    const customers = Array.from(
      new Set(items.map((item) => item.customerName))
    )
    const customersText = customers.join(", ")

    // Header akan digambar di tiap halaman melalui didDrawPage.
    // Tetapkan tinggi header (misal 38 mm) sehingga tabel mulai di bawahnya.
    const headerHeight = 42 // 38 + 4

    // Catat halaman awal untuk kelompok ini
    const groupStartPage = pdf.getNumberOfPages()

    autoTable(pdf, {
      startY: headerHeight,
      margin: { left: leftMargin, right: leftMargin },
      tableWidth: effectiveWidth,
      head: [
        ["No", "Description", "QTY", "DO Number", "Actual", "Destination"],
      ],
      body: items.map((item, index) => [
        index + 1,
        item.name,
        item.loadQty,
        item.doNumber,
        item.actualQty,
        `Delivery to ${item.customerName}`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // No
        1: { cellWidth: 60 }, // Description
        2: { cellWidth: 15 }, // QTY
        3: { cellWidth: 35 }, // DO Number
        4: { cellWidth: 20 }, // Actual
        5: { cellWidth: 50 }, // Destination
      },
      didDrawPage: function (dataArg) {
        const currentPage = dataArg.pageNumber - groupStartPage + 1
        const totalPages = dataArg.pageCount
        drawHeader(pdf, {
          noteNumber: data.noteNumber,
          issueDate: format(new Date(data.issueDate), "dd-MM-yyyy"),
          supplierName: supplierName,
          customersText: customersText,
          currentPage: currentPage,
          totalPages: totalPages,
          leftMargin: leftMargin,
          pdfWidth: pdfWidth,
          teamData: teamData,
        })
        // Gambar area tanda tangan di bagian bawah setiap halaman
        drawSignature(pdf, leftMargin, pdfWidth, pdfHeight)
      },
    })
  })

  return pdf.output("blob")
}
