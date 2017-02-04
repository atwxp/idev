/**
 * @file   cli
 * @author wxp201013@163.com
 */

import program from 'commander'

import pkgConfig from '../../package.json'

import main from '../index'

let started = false

function getOptions() {
    let obj = {}

    Object.keys(program).forEach(name => {
        if (program.optionFor('--' + name)) {
            obj[name] = program[name]
        }
    });

    return obj
}

program
    .version(pkgConfig.version)
    .usage('<Command> [Options]')

program
    .option('-p, --port [port]', pkgConfig.port + ' by default')
    .option('--debug', 'debug webui')

program
    .command('help')
    .description('Display help information')
    .action(() => {
        program.help()
    })
program
    .command('start')
    .description('start debugger')
    .action(() => {
        started = true
    })

program.parse(process.argv)

if (!started) {
    console.log('type [idev start] to start debug.')
}

else {
    main(getOptions())
}
