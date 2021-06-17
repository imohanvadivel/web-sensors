/*
------------------------------------------------------------------------------------
MIT License

Copyright (c) 2021 Mohan Vadivel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------------
*/

/*
  The frequency param in Sensor constructor is not implemented consistently
  across platform, so it's handled manually.

  iOS13+ require explicit permission request "DeviceMotionEvent.requestPermission"

  In Geolocation sensor Altitude, Heading, Speed may not available in all platform
*/

export class CreateSensor {
  constructor(element) {
    this.element = element;
    this.sensorType = element.getAttribute("data-sensorType");
    this.readingPane = element.querySelector(".reading");
    this.errorPane = element.querySelector(".error");
    if (element.querySelector("select#frequency"))
      this.frequency = +element.querySelector("select#frequency").value;
    this.switch = element.querySelector(".switch-inp");
    this.Apple = "requestPermission" in DeviceMotionEvent;
    this.constructSensor();
    if (this.sensor) this.listen();
  }

  constructSensor() {
    try {
      switch (this.sensorType) {
        case "Accelerometer":
          this.sensor = new Accelerometer({
            frequency: this.frequency,
            referenceFrame: "screen",
          });
          this.unit = "m/s²";
          this.freq_dep = true;
          break;

        case "LinearAccelerationSensor":
          this.sensor = new LinearAccelerationSensor({
            frequency: this.frequency,
            referenceFrame: "screen",
          });
          this.unit = "m/s²";
          this.freq_dep = true;
          break;

        case "Gravity":
          this.sensor = new GravitySensor({
            frequency: this.frequency,
            referenceFrame: "screen",
          });
          this.unit = "m/s²";
          this.freq_dep = true;
          break;

        case "AmbientLightSensor":
          this.sensor = new AmbientLightSensor();
          this.unit = "lux";
          this.freq_dep = false;
          break;

        case "Gyroscope":
          this.sensor = new Gyroscope({
            frequency: this.frequency,
            referenceFrame: "screen",
          });
          this.unit = "rad/s";
          this.freq_dep = true;
          break;

        case "Magnetometer":
          this.sensor = new Magnetometer({
            frequency: this.frequency,
            referenceFrame: "screen",
          });
          this.unit = "μT";
          this.freq_dep = true;
          break;

        case "Geolocation":
          this.sensor = new GeolocationSensor();
          this.freq_dep = false;
          break;

        case "ProximitySensor":
          this.sensor = new ProximitySensor();
          this.freq_dep = false;
          break;

        case "AbsoluteOrientationSensor":
          this.sensor = new AbsoluteOrientationSensor({
            frequency: this.frequency,
          });
          this.freq_dep = true;
          break;

        case "RelativeOrientationSensor":
          this.sensor = new RelativeOrientationSensor({
            frequency: this.frequency,
          });
          this.freq_dep = true;
          break;
      }
    } catch (err) {
      this.handleError(err);
    }

    if (this.sensor) {
      if (!this.freq_dep) this.sensor.onreading = () => this.setReading();
      this.sensor.onerror = (ev) => this.handleError(ev.error);
      this.sensor.onactivate = () => (this.sensorActivated = true);
      console.log(`${this.sensorType} Activated`);
    }

    if (this.sensorType == "Geolocation") {
      navigator.geolocation.getCurrentPosition(
        (ev) => {},
        (err) => this.handleError(err)
      );
    }
  }

  start() {
    if (this.freq_dep) {
      this.intervalID = setInterval(
        () => this.setReading(),
        1000 / this.frequency
      );
    }
    this.sensor.start();
    this.sensorStarted = true;
    this.readingPane.style.display = "grid";
    if (this.frequency) this.freq_toggle.style.display = "flex";
    console.log(`Starting ${this.sensorType} ================================`);
  }

  stop() {
    if (this.freq_dep) {
      clearTimeout(this.intervalID);
    }
    this.sensor.stop();
    this.errorPane.style.display = "none";
    this.readingPane.style.display = "none";
    if (this.frequency) this.freq_toggle.style.display = "none";
    console.log(`Stoping ${this.sensorType} ================================`);
  }

  listen() {
    if (this.frequency) {
      this.freq_toggle = this.element.querySelector(".freq-sel");
      this.freq_toggle.addEventListener("change", () => {
        this.stop();
        this.frequency = +this.element.querySelector("select#frequency").value;
        this.constructSensor();
        this.start();
      });
    }

    this.switch.addEventListener("change", () => {
      if (this.switch.checked) {
        // permission for apple devices
        if (this.Apple) {
          DeviceMotionEvent.requestPermission()
            .then((response) => {
              if (response == "granted") {
                this.start();
              }
            })
            .catch((err) => this.handleError(err));
          return;
        }
        this.start();
      } else {
        this.stop();
      }
    });
  }

  setReading() {
    // High resolution TimeStamp
    console.log(this.sensor.timestamp);
    if (
      ["AbsoluteOrientationSensor", "RelativeOrientationSensor"].includes(
        this.sensorType
      )
    ) {
      // if (!this.sensor.quaternion)
      //   this.handleError({ name: "NotReadableError" });

      this.readingPane.innerHTML = `
      <label>quaternion.x</label>
      <output>: ${this.polarityPadding(this.sensor.quaternion[0].toFixed(8))}
      </output>
      <label>quaternion.y</label>
      <output>: ${this.polarityPadding(this.sensor.quaternion[1].toFixed(8))}
      </output >
      <label>quaternion.z</label>
      <output>: ${this.polarityPadding(this.sensor.quaternion[2].toFixed(8))}
      </output >
      <label>quaternion.w</label>
      <output>: ${this.polarityPadding(this.sensor.quaternion[3].toFixed(8))}
      </output>`;
      return;
    }

    if (this.sensorType === "AmbientLightSensor") {
      // if (!this.sensor.illuminance)
      //   this.handleError({ name: "NotReadableError" });
      this.readingPane.innerHTML = `<label>Illuminance</label><output>: ${this.sensor.illuminance} ${this.unit}</output>`;
      return;
    }

    if (this.sensorType === "Geolocation") {
      // if (!this.sensor.latitude) this.handleError({ name: "NotReadableError" });

      let lat = `<label>Latitude</label>
      <output>: ${this.sensor.latitude.toFixed(8)}</output>`;

      let lon = `<label>Longitude</label>
      <output>: ${this.sensor.longitude.toFixed(8)}</output>`;

      let alt = "",
        head = "",
        speed = "";

      if (this.sensor.altitude)
        alt = `<label>Altitude</label>
        <output>: ${this.sensor.altitude.toFixed(8)}</output>`;
      if (this.sensor.heading)
        head = `<label>Heading</label>
        <output>: ${this.sensor.heading.toFixed(8)}</output>`;
      if (this.sensor.speed)
        speed = `<label>Speed</label>
        <output>: ${this.sensor.speed.toFixed(8)}</output>`;

      this.readingPane.innerHTML = lat + lon + alt + head + speed;
      return;
    }

    if (this.sensorType === "ProximitySensor") {
      this.readingPane.innerHTML = `
      <label>Objects Nearby</label>
      <output>: ${this.sensor.near}</output>
      <label>Distance</label>
      <output>: ${this.sensor.distance}</output>
      <label>Max</label>
      <output>: ${this.sensor.max}</output>`;
      return;
    }

    // if (!this.sensor.x) this.handleError({ name: "NotReadableError" });

    this.readingPane.innerHTML = `
    <label>x</label>
    <output>: 
    ${this.polarityPadding(this.sensor.x.toFixed(5))} ${this.unit} </output>
    <label>y</label>
    <output>: 
    ${this.polarityPadding(this.sensor.y.toFixed(5))} ${this.unit} </output >
    <label>z</label>
    <output>: 
    ${this.polarityPadding(this.sensor.z.toFixed(5))} ${this.unit} </output >`;
    return;
  }

  handleError(err) {
    console.log(err.name);
    this.errorPane.style.display = "block";
    this.readingPane.style.display = "none";

    if (this.sensorActivated || this.sensorStarted) {
      if (this.freq_dep) {
        clearTimeout(this.intervalID);
      }
      this.sensor.stop();
    }

    if (err.name === "NotAllowedError") {
      this.errorPane.innerHTML = "Permission to access sensor was denied";
      return;
    }

    if (err.name === "NotReadableError") {
      this.errorPane.innerHTML = "Cannot connect to the sensor";
      return;
    }

    if (err.name === "SecurityError") {
      this.errorPane.innerHTML =
        "Sensor construction was blocked by a feature policy";
      return;
    }

    if (err.name === "ReferenceError") {
      this.errorPane.innerHTML = "Sensor is not supported by the browser";
      this.switch.closest(".switch").style.display = "none";
      return;
    }

    this.errorPane.innerHTML = err.message;
  }

  polarityPadding(num) {
    let n = parseFloat(num);
    if (n < 0) return n;
    return `+${n}`;
  }
}
