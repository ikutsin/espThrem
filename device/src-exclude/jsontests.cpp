#include "Arduino.h"
#include "FS.h"
#include "ArduinoJson.h"

const char* ssid = "HUAWEI-E5172-5793";
const char* password = "Q1HEB8EDE0Q";
const char* host = "esp8266fs";

void setup(void) {
    Serial.begin(115200);
}

int lastmillis = 0;

void loop() {
  if(millis()-10000>lastmillis) {
    lastmillis = millis();

    //do the logic
    {
      StaticJsonBuffer<300> jsonBuffer;
      JsonObject& root = jsonBuffer.createObject();
      root["sensor"] = "millis";
      root["time"] = millis();

      JsonArray& data = root.createNestedArray("data");
      data.add(48.756080, 6);  // 6 is the number of decimals to print
      data.add(2.302038, 6);   // if not specified, 2 digits are printed

      char buffer[300];
      root.printTo(buffer, 300);

      Serial.print(buffer);
    }
  }
}
