import forge from 'node-forge'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'

import util from '../util'
import config from '../config'

let pki = forge.pki

let cache = {}

let CERT_DIR
let ROOT_KEY_PATH
let ROOT_CRT_PATH

let ROOT_KEY
let ROOT_CRT

let defaultAttrs = [
    {
        name: 'countryName',
        value: 'CN'
    },
    {
        shortName: 'ST',
        value: 'BJ'
    },
    {
        name: 'localityName',
        value: 'BJ'
    },
    {
        name: 'organizationName',
        value: 'Baidu'
    },
    {
        shortName: 'OU',
        value: 'idev proxy'
    }
]

// https://github.com/digitalbazaar/forge#x509
function createKeyAndCert(serialNumber) {
    let keys = pki.rsa.generateKeyPair(1024);

    let cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;

    cert.serialNumber = serialNumber || '01';

    cert.validity.notBefore = new Date();

    cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 10);

    cert.validity.notAfter = new Date();

    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 20);

    return {
        cert,
        keys
    }
}

function createRootCA() {

    CERT_DIR = path.join(config.dataDir, 'certs')

    ROOT_KEY_PATH = path.join(CERT_DIR, 'rootCA.key')

    ROOT_CRT_PATH = path.join(CERT_DIR, 'rootCA.crt')

    let rootKey

    let rootCrt

    try {
        rootKey = fs.readFileSync(ROOT_KEY_PATH, 'utf8')

        rootCrt = fs.readFileSync(ROOT_CRT_PATH, 'utf8')
    }
    catch (e) {
        rootKey = null

        rootCrt = null
    }

    if (rootKey && rootKey.length && rootCrt && rootCrt.length) {
        ROOT_KEY = pki.privateKeyFromPem(rootKey)

        ROOT_CRT = pki.certificateFromPem(rootCrt);

        return
    }

    let attrs = defaultAttrs.concat([
        {
            name : 'commonName',
            value : 'idev'
        }
    ])

    let kc = createKeyAndCert()

    let cert = kc.cert

    let keys = kc.keys

    cert.setSubject(attrs)

    cert.setIssuer(attrs)

    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        }
    ]);

    // signs a certificate using SHA-256 instead of SHA-1
    cert.sign(keys.privateKey, forge.md.sha256.create())

    ROOT_CRT = cert;

    ROOT_KEY = keys.privateKey

    fse.outputFileSync(ROOT_KEY_PATH, pki.privateKeyToPem(ROOT_KEY))

    fse.outputFileSync(ROOT_CRT_PATH, pki.certificateToPem(ROOT_CRT))
}

function createCAForHostname(hostname) {

    if (!cache[hostname]) {
        let md = forge.md.md5.create()

        md.update(hostname)

        let kc = createKeyAndCert(md.digest().toHex())

        let cert = kc.cert

        let keys = kc.keys

        cert.setSubject(defaultAttrs.concat([{
            name: 'commonName',
            value: hostname
        }]));

        cert.setIssuer(ROOT_CRT.subject.attributes);

        cert.sign(ROOT_KEY, forge.md.sha256.create());

        cache[hostname] = {
            key: pki.privateKeyToPem(keys.privateKey),

            cert: pki.certificateToPem(cert)
        }
    }

    return cache[hostname]
}

function getCertDir() {
    return CERT_DIR
}

function getRootCertPath() {
    return ROOT_CRT_PATH
}

export default {
    createRootCA,

    getCertDir,

    getRootCertPath,

    createCAForHostname
}
