import { db } from './drizzle';
import { users, teams, teamMembers, cars, drivers, driverCarAssignments, companies, companyRoles, invoices, invoiceDeliveryOrders, invoiceStatusEnum,
  roleEnum, deliveryOrders, deliveryOrderItems, deliveryOrderDrivers, deliveryStatusEnum, deliveryDriverRoleEnum, items  } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  const emailAdmin = 'admin@test.com';
  const passwordAdmin = 'admin123';
  const emailMember = 'member@test.com';
  const passwordMember = 'member123';
  const passwordAdminHash = await hashPassword(passwordAdmin);
  const passwordmemberHash = await hashPassword(passwordMember);

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: emailAdmin,
        passwordHash: passwordAdminHash,
        role: "admin",
      },
      {
        email: emailMember,
        passwordHash: passwordmemberHash,
        role: "member",
      },
    ])
    .returning({ id: users.id });

  const [userAdmin, userMember] = insertedUsers || [];

  console.log('Initial users created:', userAdmin?.id, userMember?.id);

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning({ id: teams.id });

  if (!team) throw new Error("Team creation failed!");

  await db.insert(teamMembers).values([
    {
      teamId: team.id,
      userId: userAdmin?.id,
      role: 'admin',
    },
    {
      teamId: team.id,
      userId: userMember?.id,
      role: 'member',
    }
  ]);

   // Insert Companies (10 perusahaan)
    const insertedCompanies = await db.insert(companies).values([
      // 3 Perusahaan sebagai Supplier saja
      {
        name: "PT Bahan Bangunan Jaya",
        address: "Jl. Raya Bogor No. 123",
        category: "Construction",
        picName: "Hendro",
        picPhone: "081234567890",
        email: "supplier1@test.com",
        registeredDate: "2023-01-10",
        teamId: team.id,
      },
      {
        name: "PT Pabrik Plastik Abadi",
        address: "Jl. Industri No. 45",
        category: "Manufacturing",
        picName: "Siti",
        picPhone: "081234567891",
        email: "supplier2@test.com",
        registeredDate: "2023-02-15",
        teamId: team.id,
      },
      {
        name: "PT Logam Makmur",
        address: "Jl. Perintis No. 67",
        category: "Mining",
        picName: "Joko",
        picPhone: "081234567892",
        email: "supplier3@test.com",
        registeredDate: "2023-03-20",
        teamId: team.id,
      },

      // 3 Perusahaan sebagai Customer saja
      {
        name: "PT Retail Sejahtera",
        address: "Jl. Sudirman No. 89",
        category: "Retail",
        picName: "Rina",
        picPhone: "081234567893",
        email: "customer1@test.com",
        registeredDate: "2023-04-12",
        teamId: team.id,
      },
      {
        name: "PT Jasa Transportasi Nusantara",
        address: "Jl. Gatot Subroto No. 100",
        category: "Logistics",
        picName: "Bambang",
        picPhone: "081234567894",
        email: "customer2@test.com",
        registeredDate: "2023-05-18",
        teamId: team.id,
      },
      {
        name: "PT Perhotelan Mewah",
        address: "Jl. Kuningan No. 77",
        category: "Hospitality",
        picName: "Dewi",
        picPhone: "081234567895",
        email: "customer3@test.com",
        registeredDate: "2023-06-25",
        teamId: team.id,
      },

      // 4 Perusahaan sebagai Supplier & Customer
      {
        name: "PT Kimia Farma Sehat",
        address: "Jl. Medika No. 55",
        category: "Pharmaceutical",
        picName: "Andi",
        picPhone: "081234567896",
        email: "supcus1@test.com",
        registeredDate: "2023-07-10",
        teamId: team.id,
      },
      {
        name: "PT Perdagangan Global",
        address: "Jl. Thamrin No. 101",
        category: "Trading",
        picName: "Fauzan",
        picPhone: "081234567897",
        email: "supcus2@test.com",
        registeredDate: "2023-08-15",
        teamId: team.id,
      },
      {
        name: "PT Makanan Lezat",
        address: "Jl. Pancoran No. 202",
        category: "Food Industry",
        picName: "Nina",
        picPhone: "081234567898",
        email: "supcus3@test.com",
        registeredDate: "2023-09-05",
        teamId: team.id,
      },
      {
        name: "PT Energi Baru",
        address: "Jl. Lenteng Agung No. 88",
        category: "Energy",
        picName: "Budi",
        picPhone: "081234567899",
        email: "supcus4@test.com",
        registeredDate: "2023-10-20",
        teamId: team.id,
      },
    ]).returning({ id: companies.id });

    const supplierCompanies = insertedCompanies.slice(0, 3).concat(insertedCompanies.slice(6, 10)); // 3 supplier + 4 both
    const customerCompanies = insertedCompanies.slice(3, 6).concat(insertedCompanies.slice(6, 10)); // 3 customer + 4 both

    console.log("Companies data seeded successfully.");

    // Insert Company Roles
    const companyRolesData = [
      // Supplier Only (3 perusahaan pertama)
      { companyId: insertedCompanies[0].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[1].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[2].id, role: roleEnum.enumValues[0] },

      // Customer Only (3 perusahaan berikutnya)
      { companyId: insertedCompanies[3].id, role: roleEnum.enumValues[1] },
      { companyId: insertedCompanies[4].id, role: roleEnum.enumValues[1] },
      { companyId: insertedCompanies[5].id, role: roleEnum.enumValues[1] },

      // Supplier & Customer (4 perusahaan terakhir)
      { companyId: insertedCompanies[6].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[6].id, role: roleEnum.enumValues[1] },
      { companyId: insertedCompanies[7].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[7].id, role: roleEnum.enumValues[1] },
      { companyId: insertedCompanies[8].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[8].id, role: roleEnum.enumValues[1] },
      { companyId: insertedCompanies[9].id, role: roleEnum.enumValues[0] },
      { companyId: insertedCompanies[9].id, role: roleEnum.enumValues[1] },
    ];

    await db.insert(companyRoles).values(companyRolesData);

    console.log("Company roles seeded successfully.");


   // Insert Cars (5 data mobil)
  const insertedCars = await db.insert(cars).values([
    {
      brand: "Hino",
      model: "Dutro 300",
      year: 2018,
      licensePlate: "B 8765 JKL",
      vin: "MI567890123456789",
      color: "Grey",
      status: "available",
      lastMaintenanceDate: "2024-01-25",
      teamId: team.id,
    },
    {
      brand: "Suzuki",
      model: "Carry",
      year: 2022,
      licensePlate: "B 1122 MNO",
      vin: "NI234567890123456",
      color: "Red",
      status: "available",
      lastMaintenanceDate: "2024-02-20",
      teamId: team.id,
    },
    {
      brand: "Toyota",
      model: "Avanza",
      year: 2020,
      licensePlate: "B 1234 ABC",
      vin: "JT123456789012345",
      color: "White",
      status: "available",
      lastMaintenanceDate: "2024-01-15",
      teamId: team.id,
    },
    {
      brand: "Honda",
      model: "Civic",
      year: 2021,
      licensePlate: "B 5678 DEF",
      vin: "HC987654321098765",
      color: "Black",
      status: "available",
      lastMaintenanceDate: "2024-02-10",
      teamId: team.id,
    },
    {
      brand: "Suzuki",
      model: "Ertiga",
      year: 2019,
      licensePlate: "B 4321 GHI",
      vin: "SU123456789876543",
      color: "Silver",
      status: "in_maintenance",
      lastMaintenanceDate: "2024-03-01",
      teamId: team.id,
    },
  ]).returning({ id: cars.id });

  console.log("Cars data seeded successfully.");

  // Insert Drivers (5 data driver)
  const insertedDrivers = await db.insert(drivers).values([
      {
        name: "Andi Saputra",
        licenseNumber: "10001234567",
        dateOfBirth: "1990-05-10",
        contactNumber: "081234567891",
        email: "andi.saputra@test.com",
        address: "Jl. Sudirman No.1, Jakarta",
        hiredDate: "2023-01-15",
        status: "active",
        teamId: team.id,
      },
      {
        name: "Budi Santoso",
        licenseNumber: "10007654321",
        dateOfBirth: "1988-07-22",
        contactNumber: "081234567892",
        email: "budi.santoso@test.com",
        address: "Jl. Thamrin No.2, Jakarta",
        hiredDate: "2022-09-10",
        status: "active",
        teamId: team.id,
      },
      {
        name: "Cahyo Wibowo",
        licenseNumber: "10003456789",
        dateOfBirth: "1992-03-18",
        contactNumber: "081234567893",
        email: "cahyo.wibowo@test.com",
        address: "Jl. Gatot Subroto No.3, Jakarta",
        hiredDate: "2023-06-25",
        status: "inactive",
        teamId: team.id,
      },
      {
        name: "Dian Pratama",
        licenseNumber: "10009876543",
        dateOfBirth: "1985-11-05",
        contactNumber: "081234567894",
        email: "dian.pratama@test.com",
        address: "Jl. Rasuna Said No.4, Jakarta",
        hiredDate: "2021-12-01",
        status: "active",
        teamId: team.id,
      },
      {
        name: "Eka Ramadhan",
        licenseNumber: "10006789012",
        dateOfBirth: "1995-09-30",
        contactNumber: "081234567895",
        email: "eka.ramadhan@test.com",
        address: "Jl. MH Thamrin No.5, Jakarta",
        hiredDate: "2024-02-10",
        status: "on_leave",
        teamId: team.id,
      },
    ]).returning({ id: drivers.id, status: drivers.status });
  
    console.log("Drivers data seeded successfully.");

    const driverCarAssignmentsData = insertedDrivers.map((driver, index) => ({
      carId: insertedCars[index % insertedCars.length].id,
      driverId: driver.id,
      status: driver.status,
      teamId: team.id,
    }));

    await db.insert(driverCarAssignments).values(driverCarAssignmentsData);

    console.log("Driver-Car Assignments seeded successfully.");

     const insertedOrders = await db.insert(deliveryOrders).values([
      {
        orderDate: "2024-03-01",
        supplierId: supplierCompanies[0].id,
        customerId: customerCompanies[0].id,
        carId: insertedCars[0].id,
        deliveryDate: "2024-03-05",
        deliveryStatus: deliveryStatusEnum.enumValues[0],
        orderNumber: "ORD-0001",
        deliveryAddress: "Jl. Tujuan 1",
        teamId: team.id,
      },
      {
        orderDate: "2024-03-02",
        supplierId: supplierCompanies[1].id,
        customerId: customerCompanies[1].id,
        carId: insertedCars[1].id,
        deliveryDate: "2024-03-06",
        deliveryStatus: deliveryStatusEnum.enumValues[1],
        orderNumber: "ORD-0002",
        deliveryAddress: "Jl. Tujuan 2",
        teamId: team.id,
      },
    ]).returning({ id: deliveryOrders.id, orderDate: deliveryOrders.orderDate });

    console.log("Delivery orders seeded successfully.");
     const insertedItems = await db.insert(items).values([
      {
        name: "space-Ctn",
        price: `${200000}`,
        unit: "Ctn",
        teamId: team.id,
      },
      {
        name: "space-Kg",
        price: `${300000}`,
        unit: "Kg",
        teamId: team.id,
      },
    ]).returning({ id: items.id, price: items.price });

    console.log("items seeded successfully.");

    const insertDeliveryOrderItems = await db.insert(deliveryOrderItems).values(
      [
        { 
          doId: insertedOrders[0].id, 
          name: "Barang A", 
          loadQty: `${100}`, 
          loadQtyActual: `${95}`, 
          loadPerPrice: insertedItems[0].price, 
          totalLoadPrice: `${1900000}`,
          itemId: insertedItems[0].id
        },
        { 
          doId: insertedOrders[1].id, 
          name: "Barang B", 
          loadQty: `${50}`, 
          loadQtyActual: `${50}`, 
          loadPerPrice: insertedItems[1].price, 
          totalLoadPrice: `${2500000}`,
          itemId: insertedItems[1].id
        },
        { 
          doId: insertedOrders[1].id, 
          name: "Barang C", 
          loadQty: `${20}`, 
          loadQtyActual: `${30}`, 
          loadPerPrice: insertedItems[0].price, 
          totalLoadPrice: `${1500000}`,
          itemId: insertedItems[0].id
        },
      ]
    ).returning({ id: deliveryOrderItems.id, doId: deliveryOrderItems.doId, totalLoadPrice: deliveryOrderItems.totalLoadPrice  });

    await db.insert(deliveryOrderDrivers).values([
      { deliveryOrderId: insertedOrders[0].id, driverId: insertedDrivers[0].id, role: deliveryDriverRoleEnum.enumValues[0] },
      { deliveryOrderId: insertedOrders[0].id, driverId: insertedDrivers[1].id, role: deliveryDriverRoleEnum.enumValues[1] },
      { deliveryOrderId: insertedOrders[1].id, driverId: insertedDrivers[3].id, role: deliveryDriverRoleEnum.enumValues[0] },
      { deliveryOrderId: insertedOrders[1].id, driverId: insertedDrivers[1].id, role: deliveryDriverRoleEnum.enumValues[1] },
    ]);

    const invoicesData = insertedOrders.map((order, index) => {
       const totalAmount = insertDeliveryOrderItems
        .filter(item => insertedOrders.some(order => order.id === item.doId))
        .reduce((acc, item) => acc + Number(item.totalLoadPrice), 0).toString();
      return {
        teamId: team.id,
        invoiceNumber: `INV-${String(index + 1).padStart(4, '0')}`,
        invoiceDate: new Date(order.orderDate).toISOString().split('T')[0],
        dueDate: new Date(new Date(order.orderDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: invoiceStatusEnum.enumValues[1],
        totalAmount,
      };
    });

    const insertedInvoices = await db.insert(invoices)
      .values(invoicesData)
      .returning({ id: invoices.id, invoiceNumber: invoices.invoiceNumber });

    const invoiceDeliveryOrdersData = insertedOrders.map((order, index) => ({
      invoiceId: insertedInvoices[index].id,
      deliveryOrderId: order.id
    }));

    // Insert Invoice-Delivery Orders relationship
    await db.insert(invoiceDeliveryOrders).values(invoiceDeliveryOrdersData);

    console.log("Invoice-Delivery Orders seeded successfully.");
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
