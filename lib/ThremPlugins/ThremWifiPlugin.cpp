#include "ThremWifiPlugin.h"

int ThremWifiPlugin::connectWifi(const char* ssid, const char* pass) {
  #ifdef LOG
        LOG << "Connecting as wifi client..." << endl;
  #endif
    if(ssid) {
      WiFi.begin(ssid, pass);
    } else {
      #ifdef LOG
      LOG << "Using last saved values." << endl;
      #endif
      WiFi.begin();
    }

        int connRes = waitForConnectResult();
  #ifdef LOG
        LOG <<"Connection result: ";
        LOG << connRes << endl;
#endif
        //todo: wps from wifimanager
        return connRes;
}

uint8_t ThremWifiPlugin::waitForConnectResult() {
        if (_connectTimeout == 0) {
                return WiFi.waitForConnectResult();
        } else {
                #ifdef LOG
                LOG << "Waiting for connection result with time out" << endl;
                #endif

                unsigned long start = millis();
                boolean keepConnecting = true;
                uint8_t status;
                while (keepConnecting) {
                        status = WiFi.status();
                        if (millis() > start + _connectTimeout) {
                                keepConnecting = false;
                                #ifdef LOG
                                LOG << "Connection timed out" << endl;
                                #endif
                        }
                        if (status == WL_CONNECTED || status == WL_CONNECT_FAILED) {
                                keepConnecting = false;
                        }
                        delay(100);
                }
                return status;
        }
}

int ThremWifiPlugin::getRSSIasQuality(int RSSI) {
  int quality = 0;

  if (RSSI <= -100) {
    quality = 0;
  } else if (RSSI >= -50) {
    quality = 100;
  } else {
    quality = 2 * (RSSI + 100);
  }
  return quality;
}
