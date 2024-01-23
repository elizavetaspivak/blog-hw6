import {body} from "express-validator";
import {inputModelMiddleware} from "../middlewares/inputModelMiddleware/input-model-middleware";
export const loginValidation = body('login')
    .isString()
    .trim()
    .isLength({min: 3, max: 10})
    .withMessage('Incorrect login')
    .matches('^[a-zA-Z0-9_-]*$')
    .withMessage('Incorrect login')

export const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Incorrect password')

export const emailValidation = body('email')
    .isString()
    .trim()
    .isLength({
        min: 1,
    })
    .withMessage('Incorrect email')
    .isEmail()
    .withMessage('Incorrect email')

export const userValidation = () => [loginValidation, passwordValidation, emailValidation, inputModelMiddleware]