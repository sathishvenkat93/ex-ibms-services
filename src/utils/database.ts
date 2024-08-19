// import { DataSource } from "typeorm";
// import { Users } from "../employees/employees.entity";

// export const MongoDatabase = new DataSource({
//     type:'mongodb',
//     url: 'mongodb+srv://rockyJohnson:Test@123@cluster0.785c34p.mongodb.net/?retryWrites=true&w=majority',
//     useUnifiedTopology: true,
//     synchronize: true,
//     logging: true,
//     entities: [Users]
// })

import { MongoClient } from 'mongodb';
import { MongoClientOptions } from 'typeorm';

let dbConnection: any = null
export async function getDBConnection(dbName: string): Promise<any>{
    try{
        if(dbConnection && dbConnection.topology.isConnected()){
            console.info(`DB Connection Exists`)
            return dbConnection.db(dbName)
        }

        const mongoOptions = {
            poolSize: 10,
            ssl: true,
            sslValidate: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            synchronize: false,
            migrations: [], 
            logging: true, 
            subscribers: [],
            entities: [], 
            migrationsRun: false
        }

        const mongoConnection = process.env.MONGO_URL || ' '

        const client = await MongoClient.connect(mongoConnection)

        // console.log("WHAT WE GOT FOR DB PING: ",await client.db(dbName).command({ping: 1}))

        // return client.db(dbName)
        
        if(client){
            console.info(`Connected to MongoDB successfully`)
            dbConnection = client
            return client.db(dbName)
        }else{
            console.error(`Error while connecting to DB`)
            throw new Error(`Unable to Connect to DB`)
        }
    }catch(error){
        console.error(`DB Connection Error: `, error)
        return { message: `DB Connection Error. Check DB`}
    }
}