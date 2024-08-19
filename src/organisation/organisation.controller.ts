import express, {Request, Response} from "express"
import { OrganisationService } from "./organisation.service"
import { ControllerHandler } from "../utils/exceptionhandler"
import { UpdateOrganisation, createOrganisation } from "./organisation.dto"

const OrganisationController = express.Router()
const service = new OrganisationService()

OrganisationController.post('/create', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body as createOrganisation
    const employees = await service.createOrganisation(body)
    response.json(employees)
}))

OrganisationController.get('/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const employees = await service.getOrganisationDetails(id)
    response.json(employees)
}))

OrganisationController.put('/update/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const body = request.body as UpdateOrganisation
    const employees = await service.updateOrganisationInfo(id, body)
    response.json(employees)
}))


export default OrganisationController