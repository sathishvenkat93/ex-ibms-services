import express, {Request, Response} from "express";
import { BillingService } from "./billing.service";
import { ControllerHandler } from "../utils/exceptionhandler";
import { CreateInvoice, UpdateBillingStatus } from "./billing.dto";

const BillingController = express.Router()
const service = new BillingService

BillingController.post('/create', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body as CreateInvoice
    const record = await service.createInvoice(body)
    response.json(record)
}))

BillingController.get('/list', ControllerHandler(async (request: Request, response: Response) => {
    const record = await service.getAllInvoices()
    response.json(record)
}))

BillingController.get('/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const record = await service.getInvoiceById(id)
    response.json(record)
}))

BillingController.put('/update/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const body = request.body as UpdateBillingStatus
    const record = await service.updateInvoiceStatus(id, body.status)
    response.json(record)
}))

export default BillingController