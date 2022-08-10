const fs = require("fs");
const net = require("net");
const cli = require("cli");
const { join } = require("path");
const { status } = require("minecraft-server-util");
const { blueBright, redBright, gray, greenBright, yellow } = require("chalk");

// CLI config
const params = cli.parse({
    ip: [ false, "IP to start the scanning", "ip" ],
    port: [ "p", "Port to check (default: 25565)", "int" ],
    output: [ "o", "Output file path", "path" ],
    timeout: [ "t", "Timeout for server response in milliseconds (default: 5000)", "int" ]
});

if (!params.ip) {
    cli.fatal("missing IP. Provide --help to see all the parameters.");
} else if (params.port && (params.port < 1 || params.port > 0xFFFF)) {
    cli.fatal("invalid port. Provide --help to see all the parameters.");
}

// Server scanning
const timeout = params.timeout ?? 5000;
const currentIP = params.ip.split(".").map(v => parseInt(v));
const port = params.port ?? 25565;

let output = "";
function log(a) {
    console.log(a);

    if (params.output) {
        output += `[${new Date().toLocaleString()}]\n${a.replace(/\x1b\[\d+m/gi, "")}\n`;

        try {
            fs.writeFileSync(join(params.output), output);
        } catch(e) {
            cli.error("failed to write output file:\n" + e);
        }
    }
}

function queryIP(ip) {
    let valid = false;

    process.title = `Current IP: ${ip}`;

    return new Promise((resolve) => {
        const socket = net.connect({
            host: ip,
            port,
            keepAlive: false,
            noDelay: true
        });

        socket.once("ready", () => {
            valid = true;

            socket.destroy();
            resolve(ip);
        });

        socket.once("error", () => {});

        setTimeout(() => {
            if (valid) return;

            socket.destroy();
            resolve();
        }, timeout);
    });
}

function checkIPs() {
    for (let i = 0; i < 10; i++) {
        queryIP(currentIP.join("."))
        .then((ip) => {
            if (ip) {
                status(ip, port)
                .then((status) => {
                    let playersInfo = "Players: " + gray(`${status.players.online}/${status.players.max}`);
                    let motd = "MOTD: " + gray(status.motd.clean.includes("\n") ? "\n" + status.motd.clean : status.motd.clean);

                    if (status.players.sample?.length > 0) {
                        const playersUsernames = status.players.sample.filter((v) => v.name.length > 3 && v.name.length < 17).map((v) => v.name).slice(0, 10);
                        if (playersUsernames.length > 0) {
                            if (status.players.sample.length > 10) {
                                playersUsernames.push("...");
                            }

                            playersInfo += ` (${gray(playersUsernames.join(blueBright(", ")))})`;
                        }
                    }

                    log(blueBright(`${greenBright("[+]")} ${gray(`${ip}:${port}`)}\n${playersInfo}\n${motd}\n`));
                })
                .catch((e) => {
                    log(blueBright(`${greenBright("[+]")} ${gray(`${ip}:${port}`)}\nFailed to get MOTD info:\n${gray(e)}\n`));
                });
            }
        });

        currentIP[3]++;
        if (currentIP[3] > 255) {
            currentIP[3] = 0;

            currentIP[2]++;
            if (currentIP[2] > 255) {
                currentIP[2] = 0;
    
                currentIP[1]++;
                if (currentIP[1]++ > 255) {
                    currentIP[1] = 0;

                    currentIP[0]++;
                    if (currentIP[0]) {
                        log(redBright("[x] Reached the IP limit."));
                        process.exit(1);
                    }
                }
            }
        }
    }
}

setInterval(() => checkIPs(), timeout);
checkIPs();

console.log(yellow("[!] Scanning...\n"));