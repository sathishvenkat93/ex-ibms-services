import { Column, Entity } from "typeorm";
import { BillingParticulars, newBillingAddress } from "./billing.dto";

@Entity()
export class Billing {
    @Column()
    billingId!: string

    @Column()
    billName!: string

    @Column()
    contactNo!: string

    @Column()
    emailAddress!: string

    @Column()
    billAddress!: newBillingAddress

    @Column()
    particulars!: BillingParticulars[]

    @Column('float')
    total!: number

    @Column()
    status!: string

    @Column()
    docPath!: string

    @Column()
    generatedAt!: Date

    @Column()
    updatedAt!: Date
}
/*
export class BillingParticulars{
    @Column()
    productId!: string

    @Column()
    productName!: string

    @Column('float')
    rate!: number

    @Column()
    units!: number

    @Column('float')
    amount!: number
}


export class BillingAddress{
    @Column()
    doorNumber!: string

    @Column()
    address1!: string

    @Column()
    address2!: string

    @Column()
    city!: string

    @Column()
    state!: string

    @Column()
    zipCode!: string
}*/