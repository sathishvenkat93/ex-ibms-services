import { dbConfig } from "../configs/appConfig"
import { getDBConnection } from "./database"

export enum Doc {
    PRODUCTINVENTORY,
    SKU,
    PRICING,
    DISCOUNT,
    PRODUCTIMAGES,
    EMPLOYEES,
    CUSTOMERS,
    INVOICE,
    ORGANISATION
}

async function getNextIndexOf(doc: Doc): Promise<string>{
    if(doc === Doc.PRODUCTINVENTORY){
        const dbConn = await getDBConnection(dbConfig.db.inventory.name)
        const collection = await dbConn.collection(dbConfig.db.inventory.collection.inventory).find().sort({productId: -1}).limit(1).toArray()
        return collection.length>0 ? IncrementKey(collection[0].productId) : 'PRD-001-00001'
    }
    if(doc === Doc.INVOICE){
        const dbConn = await getDBConnection(dbConfig.db.billing.name)
        const collection = await dbConn.collection(dbConfig.db.billing.collection.billing).find().sort({billingId: -1}).limit(1).toArray()
        return collection.length>0 ? IncrementKey(collection[0].billingId) : 'INV-001-00001'
    }
    if(doc === Doc.EMPLOYEES){
        const dbConn = await getDBConnection(dbConfig.db.inventory.name)
        const collection = await dbConn.collection(dbConfig.db.inventory.collection.inventory).find().sort({empId: -1}).limit(1).toArray()
        return collection ? IncrementKey(collection.empId) : 'EMP-001-00001'
    }

    if(doc === Doc.ORGANISATION){
        const dbConn = await getDBConnection(dbConfig.db.organisation.name)
        const collection = await dbConn.collection(dbConfig.db.organisation.orgDetails.collection).find().sort({orgId: -1}).limit(1).toArray()
        return collection.length>0 ? IncrementTwoPadding(collection[0].orgId) : 'ORG-00001'
    }
    throw new Error(`Error while Doc Sequencing`)
}

const IncrementTwoPadding = (value: any, padding = 5) => {
    var splits = value.split("-")
    return `${splits[0]}-${String((parseInt(splits[1]) + 1)).padStart(padding, '0')}`
}

const IncrementKey = (value: any, padding = 5) => {
    console.log("What happend0",value)
    var splits = value.split("-")
    console.log("What happend",splits)
    return `${splits[0]}-${splits[1]}-${String((parseInt(splits[2]) + 1)).padStart(padding, '0')}`
}

const DocSequence = { getNextIndexOf }

export default DocSequence