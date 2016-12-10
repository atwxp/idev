import fse from 'fs-extra'
import util from 'util'
import path from 'path'
import multiparty from 'multiparty'

import config from '../../../lib/config'

let fileStats

let getFilePath = function (req, res, next) {
    let uploadPath = path.join(config.dataDir, 'upload')

    fse.ensureDirSync(uploadPath)

    const form = new multiparty.Form({
        uploadDir: uploadPath
    })

    // Errors may be emitted
    // Note that if you are listening to 'part' events, the same error may be
    // emitted from the `form` and the `part`.
    form.on('error', (err) => {
        console.log('Error parsing form: ' + err.stack)
    })

    // Parts are emitted when parsing the form
    form.on('part', (part) => {
        // You *must* act on the part by reading it
        // NOTE: if you want to ignore it, just call "part.resume()"
        if (!part.filename) {
            // filename is not defined when this is a field and not a file
            console.log('got field named ' + part.name)

            // ignore field's content
            part.resume();
        }

        if (part.filename) {
            // filename is defined when this is a file
            count++;

            console.log('got file named ' + part.name)

            // ignore file's content here
            part.resume()
        }

        part.on('error', (err) => {})
    })

    form.on('file', (name, file) => {
        fileStats = file
    })

    // Close emitted after form parsed
    form.on('close', () => {
        console.log('Upload completed!')

        res.writeHead(200, {'content-type': 'text/plain'})

        // {
        //     fieldName: 'your field name',
        //     originalFilename: 'filename.json',
        //     // options.uploadDir || os.tmpdir()(/var/folders/xh/zjcqwpfs70zd3b4dt9lz5m500000gn/T/)
        //     path: '/var/folders/xh/zjcqwpfs70zd3b4dt9lz5m500000gn/T/4JHmEH7UdxI3eWUkRcj5kph1.json',
        //     headers: {
        //         'content-disposition': 'form-data; name="your field name"; filename="filename.json"',
        //         'content-type': 'application/json'
        //     },
        //     size: 18948
        // }
        res.end(JSON.stringify(fileStats))
    })

    // Parse req
    form.parse(req)
}

export default {
    getFilePath
}
