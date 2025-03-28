import { DeliveryOrder } from "./tables/deliveryOrders";
import { DeliveryOrderItem } from "./tables/deliveryOrderItems";
import { Invoice } from "./tables/invoices";
import { Company } from "./tables/companies";
import { Car } from "./tables/cars";
import { Driver } from "./tables/drivers";
import { Team } from "./tables/teams";
import { TeamMember } from "./tables/teams";
import { User } from "./tables/users";

export type DeliveryOrderDetailType = DeliveryOrder & {
  supplierName: string
  customerName: string
  carInfo: string
  items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string })[]
}

export type InvoicesDetailType = Invoice & {
  invoiceDetailDO: DeliveryOrder[]
}

export type DetailDOType = DeliveryOrder & {
  supplier: Company
  customer: Company
  car: (Car & { driver: Driver[] })
  items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string, nameItem?: string })[]
}

export type TeamDataWithMembers = Team & {
  members: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

