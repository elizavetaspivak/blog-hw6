import {Result, ValidationError, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {ErrorMessagesType, ErrorType, HTTP_RESPONSE_CODES} from "../../models/common";


export const inputModelMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const formattedErrors: Result<ErrorMessagesType> = validationResult(req).formatWith((error: ValidationError) => {
        switch (error.type) {
            case "field":
                return {
                    message: error.msg,
                    field: error.path
                }
            default :
                return {
                    message: error.msg,
                    field: '---'
                }
        }
    })

    if (!formattedErrors.isEmpty()) {
        const errorMessages: ErrorMessagesType[] = formattedErrors.array({onlyFirstError: true})

        const errors: ErrorType = {
            errorsMessages: errorMessages
        }

        res.status(HTTP_RESPONSE_CODES.BAD_REQUEST).send(errors);

        return;
    }

    return next()
}
