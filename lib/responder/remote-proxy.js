import requestHandler from '../handler/request'

export function remoteProxy(options, req, res) {
    req.url = options.url

    req.headers.host = options.host

    requestHandler.httpRequestHandler(req, res)
}
