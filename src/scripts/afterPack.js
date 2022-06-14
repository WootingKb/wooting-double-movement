const fetch = require("node-fetch");
const fs = require("fs");

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function downloadViGEm() {
  // https://developer.github.com/v3/repos/releases/#get-the-latest-release
  const repoData = await fetchJson(
    `https://api.github.com/repos/ViGEm/ViGEmBus/releases/latest`
  );

  const msiDownloadUrl = repoData.assets.find((asset) =>
    asset.name.includes("ViGEmBusSetup_x64.msi")
  ).browser_download_url;

  const msiResult = await fetch(msiDownloadUrl);
  if (!msiResult.ok) {
    throw new Error(await msiResult.text());
  }
  if (!fs.existsSync("build/installers")) {
    fs.mkdirSync("build/installers");
  }
  fs.writeFileSync(
    "build/installers/ViGEmBusSetup_x64.msi",
    await msiResult.buffer()
  );
  console.log("Downloaded latest ViGem release");
}

async function downloadAnalogSDK() {
  // https://developer.github.com/v3/repos/releases/#get-the-latest-release
  const repoData = await fetchJson(
    `https://api.github.com/repos/WootingKb/wooting-analog-sdk/releases/latest`
  );

  const msiDownloadUrl = repoData.assets.find((asset) =>
    asset.name.endsWith(".msi")
  ).browser_download_url;

  const msiResult = await fetch(msiDownloadUrl);
  if (!msiResult.ok) {
    throw new Error(await msiResult.text());
  }
  if (!fs.existsSync("build/installers")) {
    fs.mkdirSync("build/installers");
  }
  fs.writeFileSync(
    "build/installers/wooting_analog_sdk.msi",
    await msiResult.buffer()
  );
  console.log("Downloaded latest Wooting Analog SDK MSI");
}

exports.default = async function (context) {
  if (context.electronPlatformName === "win32") {
    await downloadViGEm();
    await downloadAnalogSDK();
  }
};
