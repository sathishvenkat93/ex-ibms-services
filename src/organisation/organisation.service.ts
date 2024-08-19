import { dbConfig } from "../configs/appConfig"
import { getDBConnection } from "../utils/database"
import DocSequence, { Doc } from "../utils/docSequencing"
import { ApiDbErrors, BadRequestData, InboundDataMisMatchException } from "../utils/exceptionhandler"
import { ApiBodyInvalid, DataExistsErrorMessage, createRecordSuccessMessage } from "../utils/messages"
import { GenericAPIReponse, createAPIReponse } from "../utils/responseObjects"
import { OrgAddress, OrgConfig, UpdateOrganisation, createOrganisation } from "./organisation.dto"
import { Organisation } from "./organisation.entity"

export class OrganisationService{
    private dbConnPromise: Promise<any>
    private organisationRepository: Promise<any>
    private orgEmployeeRepository: Promise<any>

    constructor(){
        this.dbConnPromise = this.initDBConnection()
        this.organisationRepository = this.getRepositories(dbConfig.db.organisation.orgDetails.collection)
        this.orgEmployeeRepository = this.getRepositories(dbConfig.db.organisation.orgEmployees.collection)
    }
    private async initDBConnection(){
        try{
            console.info("Organisation DB Constructor Init()..")
            return await getDBConnection(dbConfig.db.organisation.name)
        }catch(error){
            console.log("Caught Error", error)
            throw new Error(`Caught DB Connection Constructor error: ${error}`)
        }
    }

    private async getRepositories(collection: any){
        console.info('calling repos..')
        const dbConn = await this.dbConnPromise
        return await dbConn.collection(collection)
    }

    async checkOrgContactExists(orgContactNumber: number, orgEmailAddress: string){
        const collection = await this.organisationRepository
        const record = await collection.find({
            $or: [
                {orgContactNumber: orgContactNumber},
                {orgEmailAddress: orgEmailAddress}
        ]
        }).toArray()

        return record.length > 0
    }

    async createOrganisation(body: createOrganisation){
        const organisation = new Organisation
        if(await this.checkOrgContactExists(body.orgContactNumber,body.orgEmailAddress)){
            return GenericAPIReponse(409, DataExistsErrorMessage)
        }else{
            //OTP verification of Phone Number
            organisation.orgId = await DocSequence.getNextIndexOf(Doc.ORGANISATION)            
            organisation.orgName = body.orgName
            organisation.orgAddress = {
                doorNumber: body.orgAddress.doorNumber,
                addressLine1: body.orgAddress.addressLine1,
                addressLine2: body.orgAddress.addressLine2,
                addressLine3: body.orgAddress.addressLine3,
                locality: body.orgAddress.locality,
                city: body.orgAddress.city,
                state: body.orgAddress.state,
                pincode: body.orgAddress.pincode,
              } as OrgAddress
            organisation.orgContactNumber = body.orgContactNumber
            organisation.orgEmailAddress = body.orgEmailAddress
            organisation.createdAt = new Date()
            organisation.orgConfigs = {
                orgPrefix: body.orgConfigs.orgPrefix
            } as OrgConfig

            try{
                const collection = await this.organisationRepository
                await collection.insertOne(organisation)
                return createAPIReponse(201, createRecordSuccessMessage)
            }catch(error){
                console.error(error)
                throw new InboundDataMisMatchException(`Request is not Valid: ${error}`)
            }
             
        }

    }

    async getOrganisationDetails(orgId: string){
        const collection = await this.organisationRepository
        const record = await collection.find({
            orgId: orgId
        }).toArray()

        return record

    }

    async checkOrgExists(orgId: string){
        const collection = await this.organisationRepository
        return (await collection.find({orgId: orgId}).toArray()).length > 0
    }

    async updateOrganisationInfo(orgId: string, body: UpdateOrganisation){
        const collection = await this.organisationRepository
        try{  
            if(await this.checkOrgExists(orgId)){
                if(Object.keys(body).length === 0){
                    return new BadRequestData(ApiBodyInvalid)
                }

                const updatedRecord = await collection.findOneAndUpdate(
                    { orgId },
                    { $set: {
                        ...body,
                        updatedAt: new Date()
                    }
                },
                { new: true }
                )
                return await collection.find( { orgId: orgId }).toArray()
            }else{
                return GenericAPIReponse(200, `${orgId} - Record Does not Exists`)
            }
        }catch(error){
            console.error(error)
            throw new ApiDbErrors(`Error while updating record for ${orgId}`)
        }
    }


}