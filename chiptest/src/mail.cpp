#include <Arduino.h>
#include "user_interface.h"

// для SoftSerial скорость порта в 115200 является большой и не гарантирует стабильную работу
const int COM_BAUD = 115200;

void setup() {

  Serial.begin(COM_BAUD);
  Serial.println("Echo setup done");
}

void loop() {
  if ( Serial.available() ) {
    Serial.write( Serial.read() );
  }

    Serial.print("available: ");
    delay(5000);
}
