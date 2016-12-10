import express from 'express'

import controller from '../controller'

const router = express.Router()

router.post('/getFilePath', controller.getFilePath)

router.get('/getUiConfig', controller.getUiConfig)

export default router
