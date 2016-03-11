/*
 Basic MQTT example

  - connects to an MQTT server
  - publishes "hello world" to the topic "outTopic"
  - subscribes to the topic "inTopic"
*/

#include <ESP8266WiFi.h>
#include "PubSubClient.h"

const char* ssid = "HUAWEI-E5172-5793";
const char* pass = "Q1HEB8EDE0Q";

// Update these with values suitable for your network.
IPAddress server(192, 168, 1, 102);

void callback(const MQTT::Publish& pub) {
  // handle message arrived
}

WiFiClient wclient;
PubSubClient client(wclient, server);

void setup() {
  // Setup console
  Serial.begin(115200);
  delay(10);
  Serial.println();
  Serial.println();

  client.set_callback(callback);
}
int i=0;
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to ");
    Serial.print(ssid);
    Serial.println("...");
    WiFi.begin(ssid, pass);

    if (WiFi.waitForConnectResult() != WL_CONNECTED)
      return;
    Serial.println("WiFi connected");
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      if (client.connect("arduinoClient")) {
      	client.publish("outTopic","hello world");
      	client.subscribe("inTopic");
        Serial.println("MQTT connected");
      } else {
        Serial.println("MQTT not connected");
        delay(5000);
      }
    }

    if (client.connected())
    i++;
    if(i>10000) {
      i=0;
      client.publish("outTopic","hello a");
    }
    client.loop();
  }

}
