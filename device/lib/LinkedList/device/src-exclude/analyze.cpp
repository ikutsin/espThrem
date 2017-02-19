#include "Arduino.h"
#include "FS.h"


bool spiffsBegun = false;
void setup(void) {
    Serial.begin(115200);
}


void loop() {


Serial.println("Boot:");

  Serial.printf("getBootMode=%u\n", ESP.getBootMode());
  Serial.printf("getBootVersion=%u\n", ESP.getBootVersion());

Serial.println("Rest:");

    Serial.printf("getChipId=%u\n", ESP.getChipId());
    Serial.printf("getChipId(X)=%x\n", ESP.getChipId());
    Serial.printf("getFreeHeap=%u\n", ESP.getFreeHeap());
    Serial.printf("getFreeSketchSpace=%u\n", ESP.getFreeSketchSpace());
    Serial.printf("getVcc=%u\n",ESP.getVcc());

    Serial.println("Flash data:");

    Serial.printf("getFlashChipId=%08X\n", ESP.getFlashChipId());
    Serial.printf("getFlashChipRealSize=%u\n", ESP.getFlashChipRealSize());
    Serial.printf("getFlashChipSize=%u\n", ESP.getFlashChipSize());
    Serial.printf("getFlashChipSpeed=%u\n", ESP.getFlashChipSpeed());

    FlashMode_t ideMode = ESP.getFlashChipMode();
    Serial.printf("Flash ide mode:  %s\n", (ideMode == FM_QIO ? "QIO" : ideMode == FM_QOUT ? "QOUT" : ideMode == FM_DIO ? "DIO" : ideMode == FM_DOUT ? "DOUT" : "UNKNOWN"));


    if(spiffsBegun) {
      Serial.println("SPIFFS");
      FSInfo fs_info;
      SPIFFS.info(fs_info);

      Serial.printf("size_t totalBytes=%u\n", fs_info.totalBytes);
      Serial.printf("size_t usedBytes=%u\n", fs_info.usedBytes);
      Serial.printf("size_t blockSize=%u\n", fs_info.blockSize);
      Serial.printf("size_t pageSize=%u\n", fs_info.pageSize);
      Serial.printf("size_t maxOpenFiles=%u\n", fs_info.maxOpenFiles);
      Serial.printf("size_t maxPathLength=%u\n", fs_info.maxPathLength);
    } else {
      spiffsBegun = SPIFFS.begin();
      if(spiffsBegun) {
        SPIFFS.format();
      }
        delay(2000);
    }

    delay(5000);
}
