export type createOrganisation = {
    orgName: string
    orgDescription: string
    orgAddress: OrgAddress
    orgContactNumber: number
    orgEmailAddress: string
    orgConfigs: OrgConfig
}

export type OrgAddress = {
    doorNumber: string
    addressLine1: string
    addressLine2?: string
    addressLine3?: string
    locality?: string
    city: string
    state: string
    pincode: string
}

export type OrgConfig = {
    orgPrefix: string
}

export type UpdateOrganisation = {
    orgName?: string
    orgDescription?: string
    orgAddress?: OrgAddress
    orgContactNumber?: number
    orgEmailAddress?: string
    orgConfigs?: OrgConfig
}