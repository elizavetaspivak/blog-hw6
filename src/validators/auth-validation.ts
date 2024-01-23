import {body} from "express-validator";
import {inputModelMiddleware} from "../middlewares/inputModelMiddleware/input-model-middleware";

export const loginOrEmailValidation = body('loginOrEmail')
    .isString()
    .trim()
    .isLength({min: 1})
    .withMessage('Incorrect loginOrEmail')

export const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 1})
    .withMessage('Incorrect password')

export const authValidation = () => [loginOrEmailValidation, passwordValidation, inputModelMiddleware]