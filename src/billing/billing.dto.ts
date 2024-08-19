export type CreateInvoice = {
    billName: string
    contactNo?: string
    emailAddress?: string
    billAddress: newBillingAddress
    particulars: BillingParticulars[]
    total?: number
    status?: string
}

export type newBillingAddress = {
    doorNumber?: string
    address1?: string
    address2?: string
    city: string
    state: string
    zipcode: string
}

export type BillingParticulars = {
    productId: string
    productName?: string
    rate: number
    units: number
    amount?: number
}

export type UpdateBillingStatus = {
    status: string
}

export interface SkuStatus {
    modelId: string;
    requiredUnits: number;
    inStock: boolean;
  }