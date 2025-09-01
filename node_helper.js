const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-Tankerkoenig: node_helper gestartet.");
    this.config = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      console.log("MMM-Tankerkoenig: Konfiguration erhalten.");
    } else if (notification === "FETCH_FUEL_PRICES") {
      console.log("MMM-Tankerkoenig: Anfrage zum Abrufen der Kraftstoffpreise erhalten.");
      this.fetchFuelPrices();
    }
  },

  fetchFuelPrices: async function () {
    if (!this.config || !this.config.apiKey || !Array.isArray(this.config.stationNames)) {
      console.error("MMM-Tankerkoenig: Fehlende Konfiguration oder API-Key.");
      return;
    }

    const stationIds = this.config.stationNames.map(station => station.id).join(",");
    const url = `https://creativecommons.tankerkoenig.de/json/prices.php?apikey=${this.config.apiKey}&ids=${stationIds}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Netzwerk- oder Serverfehler: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok) {
        console.log("MMM-Tankerkoenig: Kraftstoffdaten erfolgreich abgerufen.");
        this.sendSocketNotification("FUEL_PRICES", data.prices);
      } else {
        console.error("MMM-Tankerkoenig: API-Fehler:", data.message);
      }
    } catch (error) {
      console.error("MMM-Tankerkoenig: Fehler beim Abrufen der Kraftstoffdaten:", error.message);
    }
  }
});

