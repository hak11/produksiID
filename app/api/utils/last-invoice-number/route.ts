import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { invoices } from "@/lib/db/schema";
import { desc } from "drizzle-orm";


export async function GET() {
  try {
    const deliveryOrdersWithDetails = await db
      .select({
        invoiceNumber: invoices.invoiceNumber,
      })
      .from(invoices)
      .orderBy(desc(invoices.id))
      .limit(1);
    
    if (deliveryOrdersWithDetails.length === 0) {
      return NextResponse.json({ error: "No invoice found" }, { status: 200 });
    }  

    return NextResponse.json(deliveryOrdersWithDetails[0]);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}