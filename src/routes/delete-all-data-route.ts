import {Router} from "express";
import {TestingRepository} from "../repositories/private-repositories/testing-repository";

export const deleteAllDataRoute = Router({})

deleteAllDataRoute.delete('/', async (req, res) => {
    await TestingRepository.deleteAllData()
    res.sendStatus(204)
})