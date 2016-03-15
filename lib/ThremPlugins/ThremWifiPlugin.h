#ifndef FILE_WIFIPLUGIN_SEEN
#define FILE_WIFIPLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <WiFiClient.h>

//https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/ESP8266WiFiSTA.h
//TODO: smart config.... wps

class ThremWifiPlugin: public IThremPlugin {
  int _connectTimeout = 8000;

  int connectWifi(const char* ssid, const char* pass);
  uint8_t waitForConnectResult();
  int getRSSIasQuality(int RSSI);

  virtual int getUniqueId()
  {
    return 1;
  }
  virtual char* getName()
  {
    return "Wifi connection";
  }

  virtual bool init(ThremContext* context)
  {
    #ifdef LOG
    LOG << "ThremWifiPlugin init" << endl;
    #endif

    WiFi.mode(WIFI_STA);
    const char* ssid = "HUAWEI-E5172-5793";
    const char* password = "Q1HEB8EDE0Q";

    int connectStatus = connectWifi(NULL, NULL); //ssid, password);


    #ifdef LOG
    if (WiFi.status() == WL_CONNECTED)
      {
        LOG << "Connected! IP address: " << WiFi.localIP() << endl;
      }
    else
      {
        LOG << "Not connected " << connectStatus << endl;
      }
    #endif

    ESP8266WebServer* server = context->getServer();

    server->on("/scan.json", HTTP_GET, [ = ](){

      int n = WiFi.scanNetworks();
      #ifdef LOG
      LOG << "Scan done";
      #endif

      //SORT
      int indices[n];
      for (int i = 0; i < n; i++) {
        indices[i] = i;
      }
      for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
          if (WiFi.RSSI(indices[j]) > WiFi.RSSI(indices[i])) {
            //int temp = indices[j];
            //indices[j] = indices[i];
            //indices[i] = temp;
            std::swap(indices[i], indices[j]);
          }
        }
      }

      String json = "[";
      for (int i = 0; i < n; i++) {
        if(i>0) {
          json+= ",";
        }
        json+= "{";
        json+= "\"ssid\":\"";
        json+= WiFi.SSID(indices[i]);
        json+= "\",\"rssi\":\"";
        json+= WiFi.RSSI(indices[i]);
        // json+= "\",\"BSSIDstr\":\"";
        // json+= WiFi.BSSIDstr(indices[i]);
        // json+= "\",\"channel\":\"";
        // json+= WiFi.channel(indices[i]);
        // json+= "\",\"isHidden\":\"";
        // json+= WiFi.isHidden(indices[i]);
        json+= "\",\"e\":\"";
        json+= WiFi.encryptionType(indices[i]);
        json+= "\",\"q\":\"";
        int quality = getRSSIasQuality(WiFi.RSSI(indices[i]));
        json+= quality;
        json+= "\"}";
      }

      json += "]";
      server->send(200, "text/json", json);
    });

    return true;
  }
  virtual void readData(ThremContext* context)
  {
    while (WiFi.status() != WL_CONNECTED)
      {
        context->addNotification(getUniqueId(), 1, WiFi.status());
      }
  }
  virtual void writeData(ThremNotification* notification)
  {
  }

};


#endif /* !FILE_DIAGPLUGIN_SEEN */
