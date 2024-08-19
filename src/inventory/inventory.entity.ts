import { Entity, ObjectIdColumn, ObjectId, Column, PrimaryColumn, Double } from 'typeorm';
import { SKU, colors, productImages, productImg } from './inventory.dto';

@Entity()
export class Inventory {
    // @Column()
    // orgId!: string

    @Column()
    productId!: string

    @Column()
    productName!: string

    @Column()
    productDescription!: string

    @Column()
    category!: string

    @Column()
    type!: string

    @Column()
    SKU!: string[]

    @Column()
    printRequired!: boolean

    @Column()
    printDetails!: string

    @Column()
    productImages!: productImg

    @Column()
    createdAt!: Date

    @Column()
    updatedAt!: Date

}
@Entity()
export class StockUnits{
    @Column()
    modelId!: string

    @Column()
    color!: string

    @Column()
    material!: string

    @Column()
    weight!: number

    @Column()
    dimensions!: string

    @Column()
    inStock!: boolean

    @Column()
    ratePerUnit!: number

    @Column()
    units!: number

    @Column()
    createdAt!: Date

    @Column()
    updatedAt!: Date
}