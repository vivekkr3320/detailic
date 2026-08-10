const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadApk() {
  const payload = JSON.stringify({
    host: "https://detailic.vercel.app",
    name: "Detailic",
    launcherName: "Detailic",
    packageId: "com.detailic.app",
    themeColor: "#1d4ed8",
    navigationColor: "#1d4ed8",
    backgroundColor: "#ffffff",
    startUrl: "/",
    webManifestUrl: "https://detailic.vercel.app/manifest.webmanifest",
    iconUrl: "https://detailic.vercel.app/icon-512.png",
    maskableIconUrl: "https://detailic.vercel.app/icon-512.png",
    appVersion: "1.0.0.0",
    appVersionCode: 1,
    display: "standalone",
    fallbackType: "customtabs",
    signingMode: "new",
    signing: {
      fullName: "Detailic Admin",
      organization: "Detailic",
      organizationalUnit: "Engineering",
      countryCode: "IN",
      keyPassword: "Password123!",
      storePassword: "Password123!",
      alias: "detailic"
    }
  });

  console.log("Requesting APK package from PWABuilder CloudAPK API...");

  const options = {
    hostname: 'pwabuilder-cloudapk.azurewebsites.net',
    port: 443,
    path: '/generateAppPackage',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const zipPath = path.join(__dirname, 'package.zip');
  const file = fs.createWriteStream(zipPath);

  const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    if (res.statusCode === 200) {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Successfully downloaded package zip! (${fs.statSync(zipPath).size} bytes)`);
        });
      });
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => console.log("Response body:", data));
    }
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

downloadApk();
