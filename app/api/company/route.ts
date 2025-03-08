import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { companies, companyRoles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

// Get all companies
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = session.team_id

    const companiesWithRoles = await db
      .select({
        id: companies.id,
        name: companies.name,
        picName: companies.picName,
        picPhone: companies.picPhone,
        address: companies.address,
        companyRoles: sql<string[]>`ARRAY_AGG(${companyRoles.role})`.as('company_roles'),
      })
      .from(companies)
      .leftJoin(
        companyRoles, 
        eq(companies.id, companyRoles.companyId)
      )
      .where(eq(companies.teamId, teamId))
      .groupBy(companies.id);

    return NextResponse.json(companiesWithRoles);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

// Create a new company
export async function POST(request: Request) {
  try {
    const { company, roles } = await request.json();

    if (!company || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: "'company' object and 'roles' array are required." },
        { status: 400 }
      );
    }

    const newCompany = await db
      .insert(companies)
      .values(company)
      .returning({ id: companies.id });

    const companyId = newCompany[0]?.id;
    if (!companyId) {
      throw new Error("Failed to create company.");
    }

    if (roles.length > 0) {
      const roleAssignments = roles.map((role) => ({
        companyId,
        role,
      }));
      await db.insert(companyRoles).values(roleAssignments);
    }

    return NextResponse.json({ message: "Company created successfully.", companyId });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error: "Failed to create company." }, { status: 500 });
  }
}

// Update an existing company
export async function PUT(request: Request) {
  try {
    const { company, roles } = await request.json();

    if (!company?.id || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: "'company.id' and 'roles' array are required." },
        { status: 400 }
      );
    }

    company.updatedAt = new Date();
    delete company.createdAt;


    // Update company details
    await db.update(companies).set(company).where(eq(companies.id, company.id));

    // Update roles
    await db.delete(companyRoles).where(eq(companyRoles.companyId, company.id));
    if (roles.length > 0) {
      const roleAssignments = roles.map((role) => ({
        companyId: company.id,
        role,
      }));
      await db.insert(companyRoles).values(roleAssignments);
    }

    return NextResponse.json({ message: "Company updated successfully." });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error);
    return NextResponse.json({ error: "Failed to update company." }, { status: 500 });
  }
}

// Delete a company
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Delete roles associated with the company
    await db.delete(companyRoles).where(eq(companyRoles.companyId, id));

    // Delete the company
    await db.delete(companies).where(eq(companies.id, id));

    return NextResponse.json({ message: "Company deleted successfully." });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error);
    return NextResponse.json({ error: "Failed to delete company." }, { status: 500 });
  }
}
