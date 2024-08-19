import express, {Request, Response} from "express";
import { EmployeesService } from "./employees.services";
import { ControllerHandler } from "../utils/exceptionhandler";
import { CreateEmployeesBody, UpdateEmployeeBody } from "./employees.dto";

const EmployeesController = express.Router()
const service = new EmployeesService()

EmployeesController.post('/create', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body as CreateEmployeesBody
    const employees = await service.createEmployees(body)
    response.json(employees)
}))

EmployeesController.get('/list', ControllerHandler(async (request: Request, response: Response) => {
    const employees = await service.getEmployeesAll()
    response.json(employees)
}))

EmployeesController.get('/any/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const employees = await service.getEmployeebyAny(id)
    response.json(employees)
}))

EmployeesController.get('/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const employees = await service.getEmployeesField(id.split('=')[0], id.split('=')[1])
    response.json(employees)
}))

EmployeesController.put('/update/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const body = request.body as UpdateEmployeeBody
    const employees = await service.updateEmployeeInfo(id, body)
    response.json(employees)
}))

EmployeesController.delete('/delete/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const employees = await service.deleteEmployeeRecord(id)
    response.json(employees)
}))

export default EmployeesController