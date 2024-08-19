import { Column, Entity } from "typeorm"

@Entity()
export class Organisation {
    @Column()
    orgId!: string

    @Column()
    orgName!: string

    @Column()
    orgDescription!: string

    @Column()
    orgAddress!: {
        doorNumber: string;
        addressLine1: string;
        addressLine2?: string;
        addressLine3?: string;
        locality?: string;
        city: string;
        state: string;
        pincode: string;
      };

    @Column()
    orgContactNumber!: number

    @Column()
    orgEmailAddress!: string

    @Column()
    orgConfigs!: {
        orgPrefix: string;
    }

    @Column('timestamp')
    createdAt!: Date

    @Column('timestamp')
    updatedAt!: Date
}

@Entity()
export class OrgEmployeesAssociation {
    @Column()
    orgId!: string

    @Column()
    users!: {
        userName: string
        password: string
        roleType: number
    }
}