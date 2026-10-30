import {
  cpfMask,
  isValidCPF,
  isValidPhone,
  phoneMask,
  stripCPF,
  stripPhone,
} from "@/shared/lib/masks";

export interface Deliveryman {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  cpf: string | null;
  numberQualification: string;
}

export type DeliverymanSummary = Pick<Deliveryman, "id" | "name" | "lastName">;

export interface DeliverymanInput {
  name: string;
  lastName: string;
  phone: string;
  cpf: string;
  numberQualification: string;
}

export interface DeliverymanFormValues {
  name: string;
  lastName: string;
  phone: string;
  cpf: string;
  numberQualification: string;
}

export type DeliverymanFormErrors = Partial<
  Record<keyof DeliverymanFormValues, string>
>;

export interface RegisteredDocuments {
  cpfs: Set<string>;
  qualifications: Set<string>;
}

export const deliverymanFullName = (deliveryman: DeliverymanSummary): string =>
  `${deliveryman.name} ${deliveryman.lastName}`;

export const emptyDeliverymanForm: DeliverymanFormValues = {
  name: "",
  lastName: "",
  phone: "",
  cpf: "",
  numberQualification: "",
};

export const toDeliverymanFormValues = (
  deliveryman: Deliveryman,
): DeliverymanFormValues => ({
  name: deliveryman.name,
  lastName: deliveryman.lastName,
  phone: phoneMask(deliveryman.phone),
  cpf: deliveryman.cpf ? cpfMask(deliveryman.cpf) : "",
  numberQualification: deliveryman.numberQualification,
});

export const collectRegisteredDocuments = (
  deliverymen: Deliveryman[],
  excludeId?: number,
): RegisteredDocuments => {
  const others = deliverymen.filter((d) => d.id !== excludeId);
  return {
    cpfs: new Set(
      others
        .map((d) => stripCPF(d.cpf ?? ""))
        .filter((cpf) => cpf.length === 11),
    ),
    qualifications: new Set(
      others.map((d) => d.numberQualification).filter(Boolean),
    ),
  };
};

export const validateDeliverymanForm = (
  values: DeliverymanFormValues,
  registered: RegisteredDocuments,
): DeliverymanFormErrors => {
  const errors: DeliverymanFormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe o sobrenome.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  else if (!isValidPhone(values.phone))
    errors.phone = "Telefone inválido. Use DDD + número.";
  if (!values.cpf.trim()) errors.cpf = "Informe o CPF.";
  else if (!isValidCPF(values.cpf))
    errors.cpf =
      "CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números.";
  else if (registered.cpfs.has(stripCPF(values.cpf)))
    errors.cpf = "Este CPF já está cadastrado no sistema.";
  if (!values.numberQualification.trim())
    errors.numberQualification = "Informe o número da habilitação.";
  else if (registered.qualifications.has(values.numberQualification))
    errors.numberQualification =
      "Esta habilitação já está cadastrada no sistema.";
  return errors;
};

export const toDeliverymanInput = (
  values: DeliverymanFormValues,
): DeliverymanInput => ({
  name: values.name.trim(),
  lastName: values.lastName.trim(),
  phone: stripPhone(values.phone),
  cpf: stripCPF(values.cpf),
  numberQualification: values.numberQualification,
});
