#ifndef FILE_WIFIPLUGIN_SEEN
#define FILE_WIFIPLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <WiFiClient.h>

//https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/ESP8266WiFiSTA.h
//TODO: smart config.... wps

class ThremWifiPlugin : public IThremPlugin {
	int _connectTimeout = 12000;

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

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremWifiPlugin init" << endl;
#endif

		WiFi.mode(WIFI_STA);

		int connectStatus = connectWifi(NULL, NULL);

		if (WiFi.status() != WL_CONNECTED && root.containsKey("ssid")) {
			int connectStatus = connectWifi(root["ssid"], root["pwd"]);
		}


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

		server->on("/scan.json", HTTP_GET, [=](){

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
				if (i > 0) {
					json += ",";
				}
				json += "{";
				json += "\"ssid\":\"";
				json += WiFi.SSID(indices[i]);
				json += "\",\"rssi\":\"";
				json += WiFi.RSSI(indices[i]);
				json += "\",\"BSSIDstr\":\"";
				json += WiFi.BSSIDstr(indices[i]);
				json += "\",\"channel\":\"";
				json += WiFi.channel(indices[i]);
				json += "\",\"isHidden\":\"";
				json += WiFi.isHidden(indices[i]);
				json += "\",\"e\":\"";

				//TODO
				//enum wl_enc_type {  /* Values map to 802.11 encryption suites... */
				//	ENC_TYPE_WEP = 5,
				//	ENC_TYPE_TKIP = 2,
				//	ENC_TYPE_CCMP = 4,
				//	/* ... except these two, 7 and 8 are reserved in 802.11-2007 */
				//	ENC_TYPE_NONE = 7,
				//	ENC_TYPE_AUTO = 8
				//};

				json += WiFi.encryptionType(indices[i]);
				json += "\",\"q\":\"";
				int quality = getRSSIasQuality(WiFi.RSSI(indices[i]));
				json += quality;
				json += "\"}";
			}

			json += "]";
			server->send(200, "text/json", json);
		});

		return WiFi.status() == WL_CONNECTED;
	}
	virtual void readData(ThremContext* context)
	{
		while (WiFi.status() != WL_CONNECTED)
		{
			context->addNotification(getUniqueId(), 1, WiFi.status());
		}
	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		//if (!jsonObject.containsKey("pwd")) {
		//}
		if (!jsonObject.containsKey("ssid")) {

			//TODO: dtop it
			jsonObject["pwd"] = NULL;
		}
		//never off
		jsonObject["off"] = 0;
	}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
