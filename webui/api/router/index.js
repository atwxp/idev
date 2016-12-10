import express from 'express'

import controller from '../controller'

const router = express.Router()

router.post('/getFilePath', controller.getFilePath)

export default router
