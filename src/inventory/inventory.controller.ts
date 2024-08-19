import express, {Request, Response} from "express";
import { InventoryService } from "./inventory.service";
import { ControllerHandler } from "../utils/exceptionhandler";
import { CreateInventory, SKU, UpdateInventory, UpdateSKU } from "./inventory.dto";

const InventoryController = express.Router()
const service = new InventoryService()

/** Inventory Controller */
InventoryController.post('/create', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body as CreateInventory
    const inventory = await service.createInventory(body)
    response.json(inventory)
}))

InventoryController.get('/list', ControllerHandler(async (request: Request, response: Response) => {
    const record = await service.getAllProductInventory()
    response.json(record)
}))

InventoryController.get('/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const record = await service.getInventorybyID(id)
    response.json(record)
}))

InventoryController.put('/update/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const body = request.body as UpdateInventory
    const record = await service.updateInventory(id, body)
    response.json(record)
}))

InventoryController.delete('/product/delete', ControllerHandler(async (request: Request, response: Response) => {
    // const { id } = request.params
    const body = request.body
    if (!Array.isArray(body) || body.length === 0) {
      return response.status(400).json({ error: 'Invalid request body. Please provide an array of SKU IDs.' });
    }
    const deletedCount = await service.deleteInventoryProduct(body)
    response.json({deletedCount})
}))

/** SKU Controller */
InventoryController.post('/sku/create', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body as SKU
    const sku = await service.createStockUnits(body)
    response.json(sku)
}))

InventoryController.get('/sku/list', ControllerHandler(async (request: Request, response: Response) => {
    const record = await service.getAllSKU()
    response.json(record)
}))

InventoryController.get('/sku/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const record = await service.getStockUnitbyID(id)
    response.json(record)
}))

InventoryController.put('/sku/update/:id', ControllerHandler(async (request: Request, response: Response) => {
    const { id } = request.params
    const body = request.body as UpdateSKU
    const record = await service.updateStockUnits(id, body)
    response.json(record)
}))

InventoryController.delete('/sku/delete', ControllerHandler(async (request: Request, response: Response) => {
    const body = request.body
    if (!Array.isArray(body) || body.length === 0) {
      return response.status(400).json({ error: 'Invalid request body. Please provide an array of SKU IDs.' });
    }
    
    const deletedCount = await service.deleteSKU(body);
    response.json({ deletedCount });
  }))

export default InventoryController