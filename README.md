# BROWSER-AUTOMATION-TS

This browser automation is created to automate employee observation submission. It uses puppeteer to control the browser. The submission is expected to be submitted at working time and using the desired geo-location.


## About

### **Emulate mobile device**
The browser needs to emulate a mobile device and has geolocation permission enabled. Otherwise, the observation menu will not be shown on the home page.
```javascript
  const browser = await puppeteer.launch({ headless: true });
  await browser
    .defaultBrowserContext()
    .overridePermissions(process.env.HOME_URL, ["geolocation"]);

  var pages = await browser.pages();
  const pageDummy = pages[0];
  const page = await browser.newPage();
  await page.emulate(KnownDevices["iPhone 13 Pro"]);
```

### **Geo location**
The submission page needs user's location to determine whether the user is at an acceptable observation area or not. The website use script below to watch user position given by their GPS device. When a new location is given by GPS, it triggers positionSuccess function.

```javascript
positionId = navigator.geolocation.watchPosition(positionSuccess, positionError, { timeout: 15000, maximumAge: 0, enableHighAccuracy: true });
```
In positionSuccess function, the GPS needs to give location 10 times. The reason is to avoid fake GPS by users. After that, the website script use the condition to display the submit button. 

```javascript
function positionSuccess(pos) {
    coordCount++;
    
    //
    //some codes
    //

    if (((coordCount >= 5 && uniqueCoordsCount > 1) || coordCount >= 10) && distance < 7500000 && !!geoPlaceId) {
        $("#progressbar").hide();
        $("button:submit").removeAttr("disabled", "disabled").show();
    }
}

```
To exploit that condition, the browser needs to switch between tabs 10 times while giving a new set of locations.

```typescript
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
}
```
