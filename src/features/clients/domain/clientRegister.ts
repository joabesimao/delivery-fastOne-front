export interface ClientRegisterAddress {
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

export interface ClientRegister {
  id: number;
  name: string;
  phone: string;
  address: ClientRegisterAddress;
}
