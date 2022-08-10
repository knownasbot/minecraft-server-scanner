# Minecraft Server Scanner

This is a simple Minecraft server scanner written in JavaScript.

It checks for open ports on every IP and if it is open, it tries to perform a query to get server info.

**The code is available for study purposes, I'm not responsible for your actions.**

![Scan logs](https://i.imgur.com/CStbmy8.png)

## How to use
First of all you need to install the code stuff (you must have NodeJS installed):
```sh
git clone https://github.com/knownasbot/minecraft-server-scanner.git

cd minecraft-server-scanner/

yarn install
```

To start scanning, type: `node index.js --ip <IP>`, which `IP` refers to an initial IP. The scanner will scan until the IP reaches `255.255.255.255`. If you want to save to a file, provide the parameter `--output file.txt`.

This can take a loooong time, but there is a good technique I use. You can open some Minecraft server list website and choose a random server. Ping that domain to get the IP and use it to start the scan. You should pay attention if the IP is a DNS protection, just like CloudFlare does. In the case of CloudFlare, you can paste the IP into browser and see the displayed content.

Some servers use Minecraft hosting platforms and the first two IP numbers (`xx.xx...`) are in the host's IP range. So the most efficient way to capture servers is to start with a hosting provider IP. With this method I managed to capture up to 1625 servers in a few hours.

Provide the parameter `--help` to see more information.