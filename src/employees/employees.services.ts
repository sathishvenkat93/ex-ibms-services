import { Connection } from "typeorm"
import { dbConfig } from "../configs/appConfig"
import { getDBConnection } from "../utils/database"
import { CreateEmployeesBody, UpdateEmployeeBody, employeeDTO } from "./employees.dto"
import { ApiDbErrors, BadRequestData, InboundDataMisMatchException } from "../utils/exceptionhandler"
import { Employees } from "./employees.entity"
import { GenericAPIReponse, createAPIReponse } from "../utils/responseObjects"
import { ApiBodyInvalid, DataExistsErrorMessage, InternalServerError, NoRecordFoundMessage, createRecordSuccessMessage, requestProcessSuccess } from "../utils/messages"

export class EmployeesService{

    // private employeeService = new EmployeesService()
    private dbConnPromise: Promise<any>
    private employeesRepository: Promise<any>

    constructor(){
        this.dbConnPromise = this.initDBConnection()
        this.employeesRepository = this.getRepositories(dbConfig.db.users.employees.collection)
    }
    private async initDBConnection(){
        try{
            console.info("Employees DB Constructor Init()..")
            return await getDBConnection(dbConfig.db.users.name)
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
    
    async checkDataAlreadyExists(username: string, primaryContactNumber: number, email: string){
        const repo = await this.employeesRepository
        const record = await repo.find({
            $or:[
                { username: username },
                { primaryContactNumber: primaryContactNumber },
                { secondaryContactNumber: primaryContactNumber },
                { emailAddress: email }
            ]
        }).toArray();
        return record.length>0
    }

    
    async createEmployees(body: CreateEmployeesBody){
        const employees = new Employees()

        if(await this.checkDataAlreadyExists(body.username, body.primaryContactNumber, body.emailAddress)){
            return GenericAPIReponse(409, DataExistsErrorMessage)
        }else{
            employees.username = body.username
            employees.primaryContactNumber = body.primaryContactNumber
            employees.firstname = body.firstname
            employees.lastname = body.lastname
            employees.emailAddress = body.emailAddress

            if(body.secondaryContactNumber){
                employees.secondaryContactNumber = body.secondaryContactNumber
            }
            if(body.dateOfBirth){
                employees.dateOfBirth = body.dateOfBirth
            }
            if(body.address){
                employees.address = body.address
            }
            if(body.qualification){
                employees.qualification = body.qualification
            }
            if(body.skillset){
                employees.skillset = body.skillset
            }   
            
            employees.salary = body.salary
            
            employees.emergencyContact = body.emergencyContact
            
            if(body.emergencyAddress){
                employees.emergencyAddress = body.emergencyAddress
            }
            
            employees.emergencyRelationship = body.emergencyRelationship

            employees.createdAt = new Date()
            
            try{
                const repo = await this.employeesRepository
                await repo.insertOne(employees)
                return createAPIReponse(201, createRecordSuccessMessage)
            }catch(error){
                console.error(error)
                throw new InboundDataMisMatchException(`Request is not Valid: ${error}`)
            }
        }
    }

    async getEmployeesAll() {
        try {
            const repo = await this.employeesRepository
            const employees = await repo.find({}).toArray()
            return employees
        } catch (error) {
          console.error('Error on GET all employees:', error);
          throw new Error('Unable to retrieve employees');
        }
    }
    
    async getEmployeesField(searchField: string, searchValue: string) {
        try {
            if(!searchField || !searchValue){
                throw new InboundDataMisMatchException(`Search Field or Value missing in Query params`) 
            }
            const repo = await this.employeesRepository
            const employees = await repo.find({
                [searchField]: searchValue
            }).toArray()
            return employees
        } catch (error) {
          console.error('Error on GET all employees:', error);
          throw new Error('Unable to retrieve employees');
        }
    }

    async getEmployeebyAny(searchValue: any){
        try {
            if (!searchValue) {
              throw new Error(`Search value is required`);
            }
            const collection = await this.employeesRepository;
        
            const regex = new RegExp(searchValue, 'i');
            const record = await collection.find({
              $or:[
                { username: regex },
                { firstname: regex },
                { lastname: regex },
                { email: regex },
                { dateOfBirth: regex },
                { primaryContactNumber: regex },
                { secondaryContactNumber: regex },
                { address: regex },
                { qualification: regex },
                { employmentStatus: regex },
                { salary: regex },
                { skillset: regex },
                { emergencyContact: regex },
                { emergencyAddress: regex },
                { emergencyRelationship: regex },
              ]
            }).toArray();
        
            if(record.length>0){
              return record[0]; // return the first document
            }else{
              throw new Error(`No record found`);
            }
        } catch (error) {
            console.error(error);
            throw new Error(`Unable to retrieve`);
        }
    }

    async checkUsernameExists(username: string){
        const collection = await this.employeesRepository
        const record = await collection.find({
            username: username
        }).toArray()
        return record.length > 0
    }

    async updateEmployeeInfo(username:string, body: UpdateEmployeeBody){
        const collection = await this.employeesRepository
        try{
            if(await this.checkUsernameExists(username)){
                if(Object.keys(body).length === 0){
                    return new BadRequestData(ApiBodyInvalid)
                }
                const updatedRecord = await collection.findOneAndUpdate(
                    { username },
                    { $set: {
                        ...body,
                        updatedAt: new Date()
                     }
                    },
                    { new: true }
                  );
                return await collection.find({ username: username}).toArray()
            }else{
                return GenericAPIReponse(200, `${username} - Record does not exists`)
            }
        }catch(error){
            console.error(error)
            throw new ApiDbErrors(`Error while updating record for ${username}`)
        }
    }

    async deleteEmployeeRecord(username: string){
        const collection = await this.employeesRepository
        console.log("we got username",username)
        try{
            if(await this.checkUsernameExists(username)){
                await collection.deleteOne({username})
                if(!await this.checkUsernameExists(username)){
                    return GenericAPIReponse(204, requestProcessSuccess)
                }else{
                    return GenericAPIReponse(500, InternalServerError)
                }
            }else{
                return GenericAPIReponse(200, `${username} - Record does not exists`)
            }
        }catch(error){
            console.error(error)
            throw new ApiDbErrors(`Error while deleting record for ${username}`)
        }
    }

}