import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { companies, companyRoles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET( request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: companyId } = await params;
    console.log("🚀 ~ GET ~ companyId:", companyId)

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const companyDetail = await db
      .select({
        id: companies.id,
        name: companies.name,
        picName: companies.picName,
        picPhone: companies.picPhone,
        address: companies.address,
        email: companies.email,
        createdAt: companies.createdAt,
        registeredDate: companies.registeredDate,
        companyRoles: sql<string[]>`ARRAY_AGG(${companyRoles.role})`.as('company_roles'),
      })
      .from(companies)
      .leftJoin(
        companyRoles,
        eq(companies.id, companyRoles.companyId)
      )
      .where(eq(companies.id, Number(companyId)))
      .groupBy(companies.id)
      .limit(1);

    if (!companyDetail.length) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    return NextResponse.json(companyDetail[0]);
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch company detail." }, { status: 500 });
  }
}
