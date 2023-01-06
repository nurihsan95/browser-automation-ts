import puppeteer, { KnownDevices, Page } from 'puppeteer';
import { config } from 'dotenv';

config();
let date = new Date();
console.log(date.getDate());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  await browser.defaultBrowserContext().overridePermissions('https://ieiapps.epson.biz/kepo/Account/Login', ['geolocation'])

  var pages = await browser.pages();
  const pageDummy = pages[0];
  const page = await browser.newPage();
  await page.emulate(KnownDevices['iPhone 13 Pro']);

  //Login Page
  console.log('Login Page');
  await page.goto('https://ieiapps.epson.biz/kepo/Account/Login', { waitUntil: 'networkidle0' });
  await page.type('input#username.pf-c-form-control', process.env.APO, { delay: 200 }); //username input field
  await page.type('input#password.pf-c-form-control', process.env.PASS, { delay: 200 }); //password input field
  await page.click('input#kc-login.pf-c-button.pf-m-primary.pf-m-block.btn-lg'); //sign in button)

  await page.authenticate({
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASS,
  });

  //Observation Page
  console.log('Observation Page');
  await page.waitForSelector('span.navbar-toggler-icon');
  await page.goto('https://ieiapps.epson.biz/kepo/Home/Observation');
  await page.waitForSelector('div.form-group.row');
  await page.click("body > div.container-fluid > main > form > div:nth-child(2) > div > span.k-widget.k-dropdown");
  await page.setGeolocation({ latitude: parseFloat(process.env.LATITUDE), longitude: parseFloat(process.env.LONGITUDE) });
  await new Promise((r) => setTimeout(r, 1000));
  await page.click("#ActivityId_listbox > li:nth-child(2) > span");
  await setLocation(page, pageDummy);
  await page.click("body > div.container-fluid > main > form > div:nth-child(18) > div.col.offset-md-2 > button");
  await new Promise((r) => setTimeout(r, 200));
  await page.click("body > div.k-widget.k-window.k-dialog > div.k-dialog-buttongroup.k-dialog-button-layout-stretched > button.k-button.k-primary");

  //Submitted
  console.log('Submitted');
  await browser.close();
})();

async function setLocation(page: Page, pageDummy: Page) {
  for (let i = 0; i < 10; i++) {
    let tempLat = parseFloat(process.env.LATITUDE);
    let tempLong = parseFloat(process.env.LONGITUDE);
    let randomizerLatitude = parseFloat((Math.random() * 0.0003).toFixed(6));
    let randomizerLongitude = parseFloat((Math.random() * 0.0003).toFixed(6));

    await pageDummy.bringToFront();
    await new Promise((r) => setTimeout(r, 100));

    await page.bringToFront();
    await new Promise((r) => setTimeout(r, 100));

    tempLat = parseFloat((tempLat -= randomizerLatitude).toFixed(6));
    tempLong = parseFloat((tempLong -= randomizerLongitude).toFixed(6));
    console.log({ tempLat, tempLong });
    await page.setGeolocation({ latitude: tempLat, longitude: tempLong });
  }
};