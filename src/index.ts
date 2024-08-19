import express from "express"
import serverless from 'serverless-http'
import EmployeesController from "./employees/employees.controller"
import InventoryController from "./inventory/inventory.controller"
import OrganisationController from "./organisation/organisation.controller"
import BillingController from "./billing/billing.controller"
// import { connectDB } from "./utils/database"

const app = express()
const handler: any = serverless(app)

app.use(express.json())
app.use('/v1/employees', EmployeesController)
app.use('/v1/inventory', InventoryController)
app.use('/v1/billing', BillingController)
app.use('/v1/organisation', OrganisationController)

exports.handler = async( event: any, context: any) => {
    try{
        context.callbackWaitsForEmptyEventLooop = false

        // const dbConnection = await connectDB();
        
        const result = await handler(event, context)
        return{
            statusCode: result.statusCode,
            body: result.body
        }
    }catch(error){
        return {
            statusCode: 500,
            body: JSON.stringify({message: `Internal Server Error - ${error}`})
        }

    }
}

// app.listen(3000, () => {
//     console.log("Server Started")
// })