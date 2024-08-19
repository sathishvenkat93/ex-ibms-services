export type CreateInventory = {
    orgId: string
    // productId: string
    productName: string
    productDescription: string
    category: string
    type: string
    SKU: Array<{ modelId: string, units: number }>;
    colors: colors[]
    printrequired: boolean
    printDetails: string
    // pricing: pricing
    // discount?: Discounts
    productImages?: productImg[]
    createdAt: Date
}

export type UpdateInventory = {
    orgId?: string
    // productId: string
    productName?: string
    productDescription?: string
    category?: string
    type?: string
    SKU?: string
    colors?: colors[]
    printrequired?: boolean
    printDetails?: string
    productImages?: productImg[]
    updatedAt: Date
}

export type UpdateSKU = {
    color?: string
    material?: string
    weight?: number
    dimensions?: string
    inStock?: boolean
    ratePerUnit?: number
    units?: number
    updatedAt: Date
}

export type colors = {
    color: string
}

export type Discounts = {
    discountID: string
    discountName: string
    discountOff: string
}

export type pricing = {
    ratePerUnit: string
    taxRate?: number
    taxAmount?: number
}

export type SKU = {
    modelId: string
    color: string
    material?: string
    weight?: number
    dimensions?: string
    inStock: boolean
    ratePerUnit: number
    units: number
    createdAt: Date
}

export type productImg = {
    url: string
}

export type productImages = {
    imageId: string
    productId: string
    images?: Images[]
}

export type Images = {
    imageId: string
    imageUrl: string
}