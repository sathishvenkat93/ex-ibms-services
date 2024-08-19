import { dbConfig } from "../configs/appConfig"
import { getDBConnection } from "../utils/database"
import DocSequence, { Doc } from "../utils/docSequencing"
import { BadRequestData, InboundDataMisMatchException } from "../utils/exceptionhandler"
import { DataExistsErrorMessage, DataNotFound, createRecordSuccessMessage } from "../utils/messages"
import { GenericAPIReponse, createAPIReponse } from "../utils/responseObjects"
import { CreateInventory, SKU, UpdateInventory, UpdateSKU } from "./inventory.dto"
import { Inventory, StockUnits } from "./inventory.entity"

export class InventoryService{
    private dbConnPromise: Promise <any>
    private inventoryRepository: Promise <any>
    private skuRepository: Promise <any>

    constructor(){
        this.dbConnPromise = this.initDBConnection()
        this.inventoryRepository = this.getRepositories(dbConfig.db.inventory.collection.inventory)
        this.skuRepository = this.getRepositories(dbConfig.db.inventory.collection.sku)
    }

    private async getRepositories(collection: any){
        console.info('calling repos..')
        const dbConn = await this.dbConnPromise
        return await dbConn.collection(collection)
    }

    private async initDBConnection(){
        try{
            console.info("Inventory DB Constructor Init()..")
            return await getDBConnection(dbConfig.db.inventory.name)
        }catch(error){
            console.log("Caught Error", error)
            throw new Error(`Caught DB Connection Constructor error: ${error}`)
        }
    }

    async checkProductNameExists(productName: string){
        const dbConn = await this.dbConnPromise
        const collection = await dbConn.collection(dbConfig.db.inventory.collection.inventory).find({
            productName: productName
        }).toArray()
        return collection.length > 0
    }

    async getModelIdUnits(modelId: string){
        const collectionRepos = await this.skuRepository
        const collection = await collectionRepos.find({
            modelId: modelId
        }).toArray()
        return collection[0].units
    }

    async createInventory(body: CreateInventory){
        const inventory = new Inventory
        if(await this.checkProductNameExists(body.productName)){
            return GenericAPIReponse(409, DataExistsErrorMessage)
        }else{
            inventory.productId = await DocSequence.getNextIndexOf(Doc.PRODUCTINVENTORY)
            inventory.productName = body.productName
            inventory.productDescription = body.productDescription
            inventory.category = body.category
            inventory.type = body.type
            inventory.printRequired = body.printrequired
            inventory.printDetails = body.printDetails
            
            inventory.createdAt = new Date()
            // inventory.productImages = body.productImages || undefined
            inventory.SKU = []
            for(const sku of body.SKU){
                const {modelId, units} = sku
                inventory.SKU.push(`${modelId}: ${units}`)
            }
            try{
                const collection = await this.inventoryRepository
                // console.log("inventory schema: ", inventory)
                await collection.insertOne(inventory)
                return createAPIReponse(201, createRecordSuccessMessage)
            }catch(error){
                console.error(error)
                throw new InboundDataMisMatchException(`Problem Processing Request: ${error}`)
            }
            
        }
    }

    async createStockUnits(body: SKU){
        const sku = new StockUnits
        if(await this.checkStockModelExists(body.modelId)){
            return GenericAPIReponse(409, DataExistsErrorMessage)
        }else{
            sku.modelId = body.modelId
            sku.color = body.color
            sku.material = body.material || ''
            sku.weight = body.weight || 0
            sku.dimensions = body.dimensions || ''
            sku.inStock = body.inStock
            sku.ratePerUnit = body.ratePerUnit
            sku.units = body.units
            sku.createdAt = new Date()
            try{
                const collection = await this.skuRepository
                await collection.insertOne(sku)
                return createAPIReponse(201, createRecordSuccessMessage)
            }catch(error){
                console.error(error)
                throw new InboundDataMisMatchException(`Problem Processing Request: ${error}`)
            }
        }
    }
    async checkStockModelExists(modelId: string) {
        const collectionRepos = await this.skuRepository
        const collection = await collectionRepos.find({
            modelId: modelId
        }).toArray()
        return collection.length > 0
    }

    async checkProductIdExists(productId: string){
        const repo = await this.inventoryRepository
        const collection = await repo.find({ productId: productId }).toArray()
        return collection.length>0
    }

    async updateInventory(productId: string, body: UpdateInventory){
        const collection = await this.inventoryRepository
        try{
            if(!await this.checkProductIdExists){
                return new BadRequestData(DataNotFound)
            }

            await collection.findOneAndUpdate(
                { productId },
                { $set: {
                    ...body,
                    updatedAt: new Date()
                }
            }, { new: true }
            )
            return await collection.find( { productId: productId }).toArray()
        }catch(error){
            console.error(error)
            throw new InboundDataMisMatchException(`Problem Processing Request: ${error}`)
        }
        return null
    }

    async updateStockUnits(modelId: string, body: UpdateSKU){
        const collection = await this.skuRepository
        try{
            if(!await this.checkStockModelExists){
                return new BadRequestData(DataNotFound)
            }

            await collection.findOneAndUpdate(
                { modelId },
                { $set: {
                    ...body,
                    updatedAt: new Date()
                }
            }, { new: true }
            )
            return await collection.find({ modelId: modelId }).toArray()
        }catch(error){
            console.error(error)
            throw new InboundDataMisMatchException(`Problem Processing Request: ${error}`)
        }
        return null
    }

    async getInventorybyID(productId: string){
        const collection = await this.inventoryRepository
        const record = await collection.find({ productId: productId }).toArray()
        return record
    }

    async getStockUnitbyID(modelId: string){
        const collection = await this.skuRepository
        const record = await collection.find({ modelId: modelId }).toArray()
        return record
    }

    async getAllProductInventory(){
        const collection = await this.inventoryRepository
        const record = await collection.find({}).sort({ createdAt: -1 }).toArray()
        return record
    }

    async getAllSKU(){
        const collection = await this.skuRepository
        const record = await collection.find({}).sort({ createdAt: -1 }).toArray()
        return record
    }

    async updateSKUnits(modelId: string, units: number) {
        const collection = await this.skuRepository;
      
        try {
          // Find the document with the specified modelId
          const document = await collection.findOne({ modelId });
      
          if (!document) {
            throw new Error(`Model with ID ${modelId} not found`);
          }
      
          // Calculate the new units value
          const newUnits = document.units - units;
      
          if (newUnits < 0) {
            throw new InboundDataMisMatchException(`Not enough units in stock for model ID ${modelId}`);
          }
      
          // Update the document with the new units value
          await collection.findOneAndUpdate(
            { modelId },
            {
              $set: {
                units: newUnits,
                updatedAt: new Date()
              }
            },
            { returnOriginal: false }
          );
      
          return true;
        } catch (error) {
          console.error(error);
          throw new InboundDataMisMatchException(`Problem Processing Request: ${error}`);
        }
      }
      

    // async deleteInventoryProduct(productId: string){
    //     const collection = await this.inventoryRepository
    //     const record = await collection.deleteOne({ productId: productId })
    //     return record
    // }

    async deleteInventoryProduct(productIds: string[]): Promise<number> {
        const collection = await this.inventoryRepository;
        const result = await collection.deleteMany({ productId: { $in: productIds } });
        return result.deletedCount || 0;
      }

    // async deleteSKU(modelId: string){
    //     const collection = await this.skuRepository
    //     const record = await collection.deleteOne({ modelId: modelId })
    //     return record
    // }

    async deleteSKU(modelIds: string[]): Promise<number> {
        const collection = await this.skuRepository;
        const result = await collection.deleteMany({ modelId: { $in: modelIds } });
        return result.deletedCount || 0;
      }
      

}