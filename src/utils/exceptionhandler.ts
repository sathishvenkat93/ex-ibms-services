import { NextFunction, Request, Response } from "express";

export const ControllerHandler = (fn: (request: Request, response: Response, next: NextFunction) => any) => (request: Request, response: Response, next: NextFunction) => {
    return Promise.resolve(fn(request, response, next)).catch(next)
}

export class InboundDataMisMatchException extends Error{
    statusCode = 405
    constructor(public message: string){
        super(message)
    }
}

export class StockUnitsNotAvailable extends Error{
    statusCode = 207
    constructor(public message: string){
        super(message)
    }
}

export class DataExistsException extends Error{
    statusCode = 409
    constructor(public message: string){
        super(message)
    }
}

export class BadRequestData extends Error{
    statusCode = 400
    constructor(public message: string){
        super(message)
    }
}

export class ApiDbErrors extends Error{
    statusCode = 500
    constructor(public message: string){
        super(message)
    }
}