export type CreateEmployeesBody = {
    username: string
    firstname: string
    lastname: string
    emailAddress: string
    dateOfBirth?: Date
    primaryContactNumber: number
    secondaryContactNumber?: number
    address?: string
    qualification?: string
    employmentStatus: string
    salary: number
    skillset?: string[]
    emergencyContact: number
    emergencyAddress?: string
    emergencyRelationship: string
}

export type UpdateEmployeeBody = {
    firstname?: string
    lastname?: string
    emailAddress?: string
    dateOfBirth?: Date
    primaryContactNumber?: number
    secondaryContactNumber?: number
    address?: string
    qualification?: string
    employmentStatus?: string
    salary?: number
    skillset?: string[]
    emergencyContact?: number
    emergencyAddress?: string
    emergencyRelationship?: string
}

export interface employeeDTO {
    username: string
    firstname: string
    lastname: string
    email: string
    dateOfBirth: Date
    primaryContactNumber: number
    secondaryContactNumber: number
    address: string
    qualification: string
    employmentStatus: string
    salary: number
    skillset: string[]
    emergencyContact: number
    emergencyAddress: string
    emergencyRelationship: string
}