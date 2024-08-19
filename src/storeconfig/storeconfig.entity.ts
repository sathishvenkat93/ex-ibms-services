import { Column, Entity } from "typeorm";

@Entity()
export class skuConfig {
    @Column()
    modelId!: string

    @Column()
    modelName!: string

}

export class category{
    @Column()
    categoryId!: string

    @Column()
    categoryName!: string
    
}