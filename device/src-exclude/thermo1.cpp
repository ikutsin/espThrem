#include <Arduino.h>

#include <DHT.h>

#include <WiFiManager.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);
WiFiManager wifiManager;
DHT dht(14, DHT22);

void setup() {
  Serial.begin(9600);
  //wifiManager.setDebugOutput(false);

  wifiManager.autoConnect();

  //done setup
  dht.begin();
  Serial.println("Starting server");

  server.on("/", [](){
    // Wait a few seconds between measurements.
    String s = "<!DOCTYPE HTML><html><body><h1>Payload</h1>";

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float f = dht.readTemperature(true);

    // Check if any reads failed and exit early (to try again).
    if (isnan(h) || isnan(t) || isnan(f)) {
      s += ("Failed to read from DHT sensor!");
    } else {

      // Compute heat index in Fahrenheit (the default)
      float hif = dht.computeHeatIndex(f, h);
      // Compute heat index in Celsius (isFahreheit = false)
      float hic = dht.computeHeatIndex(t, h, false);

      s += ("<br/>Humidity: ");
      s += (h);
      s += (" %\t");
      s += ("<br/>Temperature: ");
      s += (t);
      s += (" *C ");
      s += (f);
      s += (" *F");
      s += ("<br/>Heat index: ");
      s += (hic);
      s += (" *C ");
      s += (hif);
      s += (" *F");
    }

    server.send(200, "text/html", s);
  });

  server.on("/restart", [](){
    server.send(200, "text/plain", "Device restart.");
    ESP.restart();
  });

  server.on("/reset", [](){
    server.send(200, "text/plain", "Reset settings.");
    wifiManager.resetSettings();
    ESP.restart();
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
