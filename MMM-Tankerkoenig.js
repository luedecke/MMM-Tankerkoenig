Module.register("MMM-Tankerkoenig", {
  defaults: {
    apiKey: "00000000-0000-0000-0000-000000000002",
    updateInterval: 600000,
    stationNames: [
      { id: "24a381e3-0d72-416d-bfd8-b2f65f6e5802", name: "Esso Tankstelle" },
      { id: "474e5046-deaf-4f9b-9a32-9797b778f047", name: "Total Berlin" }
    ],
    fuelTypes: ["e5", "e10", "diesel"],
    headerText: "Tankerkönig"
  },

  getStyles: function () {
    return ["MMM-Tankerkoenig.css"];
  },

  start: function () {
    this.loaded = false;
    this.prices = {};
    this.sendSocketNotification("CONFIG", this.config);
    this.getData();
    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
  },

  getData: function () {
    this.sendSocketNotification("FETCH_FUEL_PRICES");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "FUEL_PRICES") {
      this.prices = payload;
      this.loaded = true;
      this.updateDom();
    }
  },

  getHeader: function () {
    return this.config.headerText || "Tankerkönig";
  },

  getDom: function () {
    var wrapper = document.createElement("table");
    wrapper.className = "small tanker-table";

    if (!this.loaded) {
      wrapper.innerHTML = "Lade Spritpreise...";
      wrapper.className = "dimmed light";
      return wrapper;
    }

    // Header Row
    var headerRow = document.createElement("tr");
    var stationNameHeader = document.createElement("th");
    stationNameHeader.innerHTML = "Tankstelle";
    headerRow.appendChild(stationNameHeader);
    var statusHeader = document.createElement("th");
    statusHeader.innerHTML = "Status";
    headerRow.appendChild(statusHeader);

    for (let fuelType of this.config.fuelTypes) {
      var fuelTypeHeader = document.createElement("th");
      fuelTypeHeader.innerHTML = fuelType.toUpperCase();
      headerRow.appendChild(fuelTypeHeader);
    }

    wrapper.appendChild(headerRow);

    // Data Rows
    this.config.stationNames.forEach(station => {
      var stationData = this.prices[station.id];
      var row = document.createElement("tr");

      // Station Name
      var stationName = document.createElement("td");
      stationName.innerHTML = station.name;
      row.appendChild(stationName);

      // Status (open or closed)
      var status = document.createElement("td");
      status.innerHTML = stationData && stationData.status === "open" ? "geöffnet ✓" : "geschlossen ✗";
      status.style.color = stationData && stationData.status === "open" ? "green" : "red";
      row.appendChild(status);

      // Fuel Prices
      this.config.fuelTypes.forEach(fuelType => {
        var fuelPrice = document.createElement("td");
        if (stationData && stationData[fuelType] !== undefined) {
          fuelPrice.innerHTML = `${stationData[fuelType].toFixed(2)} €`;
        } else {
          fuelPrice.innerHTML = "-";
        }
        row.appendChild(fuelPrice);
      });

      wrapper.appendChild(row);
    });

    return wrapper;
  }
});

