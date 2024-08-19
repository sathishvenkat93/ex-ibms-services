export const createAPIReponse = (statusCode: number, message: string) =>{
    return {
        status: statusCode,
        message: message
    }
}

export const GenericAPIReponse = (statusCode: number, message: string) =>{
    return {
        status: statusCode,
        message: message
    }
}