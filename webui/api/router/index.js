/**
 * @file   server router
 * @author wxp201013@163.com
 */

import express from 'express'

import * as controller from '../controller'

/* eslint-disable */
const router = express.Router()
/* eslint-enable */

router.post('/getFilePath', controller.getFilePath)

router.get('/getUiConfig', controller.getUiConfig)

export default router
