import httpClient from "@/shared/api/httpClient";
import type { Delivery, DeliveryStatus } from "../domain/delivery";
import type { CreateDeliveryInput } from "../domain/deliveryOrder";
import type {
  RankingItem,
  RankingPage,
  RankingQuery,
} from "../domain/deliverymanRanking";
import type { FinishDeliveryInput } from "../domain/finishDelivery";

interface DeliveryDto {
  id: number;
  quantity: string | number;
  amount: number | string;
  data: string;
  receivedAt?: string | null;
  finishedAt?: string | null;
  status: DeliveryStatus;
  deliverymanId?: number | null;
  unitStore?: { name: string } | null;
  deliveryman?: {
    id: number;
    name: string;
    lastName: string;
    phone?: string | null;
  } | null;
  Register?: {
    client?: { name?: string; phone?: string | null } | null;
    address?: {
      street?: string;
      numberHouse?: number | string;
      neighborhood?: string | null;
      city?: string;
      reference?: string | null;
    } | null;
  } | null;
}

interface RankingDto {
  items?: RankingItem[];
  page?: number;
  totalItems?: number;
  totalPages?: number;
  totalDeliveries?: number;
}

const toDelivery = (dto: DeliveryDto): Delivery => {
  const client = dto.Register?.client;
  const address = dto.Register?.address;
  return {
    id: dto.id,
    quantity: String(dto.quantity),
    amount: Number(dto.amount),
    createdAt: dto.data,
    receivedAt: dto.receivedAt ?? null,
    finishedAt: dto.finishedAt ?? null,
    status: dto.status,
    deliverymanId: dto.deliverymanId ?? null,
    deliveryman: dto.deliveryman
      ? {
          id: dto.deliveryman.id,
          name: dto.deliveryman.name,
          lastName: dto.deliveryman.lastName,
          phone: dto.deliveryman.phone ?? "",
        }
      : null,
    unitStoreName: dto.unitStore?.name ?? null,
    client: { name: client?.name ?? "", phone: client?.phone ?? "" },
    address: {
      street: address?.street ?? "",
      numberHouse: String(address?.numberHouse ?? ""),
      neighborhood: address?.neighborhood ?? "",
      city: address?.city ?? "",
      reference: address?.reference ?? "",
    },
  };
};

const toRankingPage = (
  dto: RankingDto,
  requestedPage: number,
): RankingPage => ({
  items: Array.isArray(dto?.items) ? dto.items : [],
  page: Number(dto?.page ?? requestedPage),
  totalItems: Number(dto?.totalItems ?? 0),
  totalPages: Number(dto?.totalPages ?? 1),
  totalDeliveries: Number(dto?.totalDeliveries ?? 0),
});

export const deliveriesRepository = {
  async list(): Promise<Delivery[]> {
    const { data } = await httpClient.get<DeliveryDto[]>("/orderDelivery");
    return Array.isArray(data) ? data.map(toDelivery) : [];
  },

  async create(input: CreateDeliveryInput): Promise<{ id: number | null }> {
    const { data } = await httpClient.post<{ id?: unknown }>(
      "/orderDelivery",
      input,
    );
    return { id: typeof data?.id === "number" ? data.id : null };
  },

  async finish(id: number, input: FinishDeliveryInput): Promise<void> {
    await httpClient.put(`/orderDelivery/${id}`, input);
  },

  async ranking(query: RankingQuery): Promise<RankingPage> {
    const { data } = await httpClient.get<RankingDto>(
      "/orderDelivery/ranking/deliveryman",
      { params: query },
    );
    return toRankingPage(data, query.page);
  },
};
