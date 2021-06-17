import { CreateSensor } from "./sensor_util";
import {
  AbsoluteOrientationSensor,
  Accelerometer,
  Gyroscope,
  GravitySensor,
  LinearAccelerationSensor,
  RelativeOrientationSensor,
} from "./polyfill/motion-sensors";
import { GeolocationSensor } from "./polyfill/geolocation-sensor";

function $(a, b = document) {
  return b.querySelector(a);
}
function $all(a, b = document) {
  return [...b.querySelectorAll(a)];
}

let sensorList = [
  { name: "Accelerometer", label: "Accelerometer", type: "low-level" },
  {
    name: "LinearAccelerationSensor",
    label: "Linear Acceleration Sensor",
    type: "low-level",
  },
  { name: "Gravity", label: "Gravity Sensor", type: "low-level" },
  {
    name: "AmbientLightSensor",
    label: "Ambient Light Sensor",
    type: "low-level",
  },
  { name: "Gyroscope", label: "Gyroscope", type: "low-level" },
  { name: "Magnetometer", label: "Magnetometer", type: "low-level" },
  { name: "Geolocation", label: "Geolocation", type: "low-level" },
  { name: "ProximitySensor", label: "Proximity Sensor", type: "low-level" },
  {
    name: "AbsoluteOrientationSensor",
    label: "Absolute Orientation Sensor",
    type: "high-level",
  },
  {
    name: "RelativeOrientationSensor",
    label: "Relative Orientation Sensor",
    type: "high-level",
  },
];

// DOM Insertion
(function () {
  let low_sensor = sensorList.filter((s) => s.type === "low-level");
  let high_sensor = sensorList.filter((s) => s.type === "high-level");

  let low_level = `<header span="row"><h4>Low-Level Sensors</h4></header>`;
  let high_level = `<header span="row"><h4>High-Level (fusion) Sensors</h4></header>`;

  low_sensor.forEach(
    (ss) =>
      (low_level += `<section class="sensor-cnt" data-sensorType="${ss.name}">
    <header>
      <span>${ss.label}</span>
      <div class="rhs">
      ${
        ss.name !== "AmbientLightSensor" &&
        ss.name !== "Geolocation" &&
        ss.name !== "ProximitySensor"
          ? `<div class="freq-sel">
        <label class="opacity5" for="frequency">freq:</label>
        <div class="select-cnt">
          <select id="frequency">
            <option value="1">1Hz</option>
            <option value="2">2Hz</option>
            <option selected="selected" value="5">5Hz</option>
            <option value="10">10Hz</option>
            <option value="20">20Hz</option>
            <option value="30">30Hz</option>
            <option value="60">60Hz</option>
          </select>
        </div>
      </div>`
          : ""
      }
        <div class="switch">
          <input class="switch-inp" type="checkbox" />
          <div class="switch-cnt">
            <div class="thumb"></div>
          </div>
        </div>
      </div>
    </header>
    <div class="error"></div>
    <div class="reading"></div>
  </section>`)
  );

  high_sensor.forEach(
    (ss) =>
      (high_level += `<section class="sensor-cnt" data-sensorType="${ss.name}">
    <header>
      <span>${ss.label}</span>
      <div class="rhs">
      <div class="freq-sel">
        <label class="opacity5" for="frequency">freq:</label>
        <div class="select-cnt">
          <select id="frequency">
            <option value="1">1Hz</option>
            <option value="2">2Hz</option>
            <option selected="selected" value="5">5Hz</option>
            <option value="10">10Hz</option>
            <option value="20">20Hz</option>
            <option value="30">30Hz</option>
            <option value="60">60Hz</option>
          </select>
        </div>
      </div>
        <div class="switch">
          <input class="switch-inp" type="checkbox" />
          <div class="switch-cnt">
            <div class="thumb"></div>
          </div>
        </div>
      </div>
    </header>
    <div class="error"></div>
    <div class="reading"></div>
  </section>`)
  );

  $(".sensor-wrapper").insertAdjacentHTML(
    "beforeend",
    `${low_level}<div span="row" aria-hidden="true" class="h-1">&nbsp;</div>${high_level}`
  );
})();

// checking browser support for sensors
// and adding polyfills if it's not supported
if (!window.Accelerometer) window.Accelerometer = Accelerometer;
if (!window.Gyroscope) window.Gyroscope = Gyroscope;
if (!window.GravitySensor) window.GravitySensor = GravitySensor;
if (!window.LinearAccelerationSensor)
  window.LinearAccelerationSensor = LinearAccelerationSensor;
if (!window.RelativeOrientationSensor)
  window.RelativeOrientationSensor = RelativeOrientationSensor;
if (!window.AbsoluteOrientationSensor)
  window.AbsoluteOrientationSensor = AbsoluteOrientationSensor;
if (!window.GeolocationSensor) window.GeolocationSensor = GeolocationSensor;

// Attaching sensor to DOM
$all(".sensor-cnt").forEach((cnt) => {
  new CreateSensor(cnt);
});

// DarkMode
class DarkMode {
  constructor(el, namespace, setMetaTheme) {
    this.root = document.querySelector("html");
    if (namespace) this.namespace = namespace;
    if (setMetaTheme) this.setMetaTheme = setMetaTheme;
    this.label = "darkMode";
    this.InitializeTheme();
    el.addEventListener("click", () => this.toggleTheme());
  }

  InitializeTheme() {
    if (this.namespace) this.label = `${this.namespace}-darkMode`;
    let theme = localStorage.getItem(this.label);

    if (theme === "false" || theme == null) {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    } else {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    }
  }

  setMeta(theme) {
    let meta = document.querySelector('html meta[name="theme-color"]');
    if (!meta) {
      let meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document
        .querySelector("head")
        .insertAdjacentHTML(
          "beforeend",
          `<meta name="theme-color" content="${
            theme === "dark" ? "#191919" : "#ffffff"
          }" />`
        );
      return;
    }

    meta.insertAdjacentHTML(
      "afterend",
      `<meta name="theme-color" content="${
        theme === "dark" ? "#191919" : "#ffffff"
      }" />`
    );
    meta.remove();
  }

  toggleTheme() {
    let theme = localStorage.getItem(this.label);
    if (theme === "false") {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    } else {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    }
  }

  setDarkMode() {
    this.root.classList.add("dark");
    localStorage.setItem(this.label, true);
    if (this.setMetaTheme) this.setMeta("dark");
  }

  setLightMode() {
    this.root.classList.remove("dark");
    localStorage.setItem(this.label, false);
    if (this.setMetaTheme) this.setMeta("light");
  }
}
new DarkMode($("#darkMode-toggle"), "sensor", true);
