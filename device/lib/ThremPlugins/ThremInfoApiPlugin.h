#ifndef FILE_INFOAPI_PLUGIN_SEEN
#define FILE_COREAPI_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266WiFi.h>

class ThremInfoApiPlugin : public IThremPlugin {
	bool isResetRequest = false;
	bool isRestartRequest = false;

	virtual int getUniqueId()
	{
		return 32;
	}
	virtual char* getName()
	{
		return "Info API";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremInfoApiPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		server->on("/info/wifi.json", HTTP_GET, [=](){
			String json = "{";
			json += "\"localIP\":\"";
			json += WiFi.localIP().toString();
			json += "\",\"subnetMask\":\"";
			json += WiFi.subnetMask().toString();
			json += "\",\"gatewayIP\":\"";
			json += WiFi.gatewayIP().toString();
			json += "\",\"SSID\":\"";
			json += WiFi.SSID();
			json += "\",\"RSSI\":\"";
			json += WiFi.RSSI();
			//https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/ESP8266WiFiType.h
			//https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/ESP8266WiFiSTA.h

			//TODO
			//typedef enum {
			//	WL_NO_SHIELD = 255,   // for compatibility with WiFi Shield library
			//	WL_IDLE_STATUS = 0,
			//	WL_NO_SSID_AVAIL = 1,
			//	WL_SCAN_COMPLETED = 2,
			//	WL_CONNECTED = 3,
			//	WL_CONNECT_FAILED = 4,
			//	WL_CONNECTION_LOST = 5,
			//	WL_DISCONNECTED = 6
			//} wl_status_t;

			json += "\",\"status\":\""; //wl_status_t TODO: stringify
			json += WiFi.status();
			json += "\",\"softAPIP\":\"";
			json += WiFi.softAPIP().toString();
			json += "\",\"softAPmacAddress\":\"";
			json += WiFi.softAPmacAddress();
			json += "\",\"macAddress\":\"";
			json += WiFi.macAddress();
			//json += "\",\"psk\":\"";
			//json += WiFi.psk();
			json += "\",\"BSSIDstr\":\"";
			json += WiFi.BSSIDstr();

			json += "\",\"hostname\":\"";
			json += WiFi.hostname();
			json += "\",\"mode\":\"";
			WiFiMode_t wifimode = WiFi.getMode();
			json += (wifimode == WIFI_OFF ? "WIFI_OFF" : wifimode == WIFI_STA ? "WIFI_STA" : wifimode == WIFI_AP ? "WIFI_AP" : wifimode == WIFI_AP_STA ? "WIFI_AP_STA" : "UNKNOWN");
			json += "\"}";
			server->send(200, "text/json", json);
		});
		server->on("/info/status.json", HTTP_GET, [=](){
			String json = "{";

			json += "\"vcc\":";
			json += ESP.getVcc();
			json += ",\"cycleCount\":";
			json += ESP.getCycleCount();
			json += ",\"millis\":";
			json += millis();
			json += ",\"heap\":";
			json += ESP.getFreeHeap();
			json += ",\"analog\":";
			json += analogRead(A0);
			json += ",\"gpio\":";
			json += ((uint32_t)(((GPI | GPO) & 0xFFFF) | ((GP16I & 0x01) << 16)));

			json += "}";
			server->send(200, "text/json", json);
		});
		server->on("/info/chip.json", HTTP_GET, [=](){
			String json = "{";
			json += "\"bootMode\":";
			json += ESP.getBootMode();
			json += ",\"bootVersion\":";
			json += ESP.getBootVersion();
			json += ",\"cpuFreqMHz\":";
			json += ESP.getCpuFreqMHz();
			json += ",\"chipId\":";
			json += ESP.getChipId();
			json += ",\"flashChipId\":";
			json += ESP.getFlashChipId();
			json += ",\"getFlashChipRealSize\":";
			json += ESP.getFlashChipRealSize();
			json += ",\"getFlashChipSize\":";
			json += ESP.getFlashChipSize();
			json += ",\"flashChipSizeByChipId\":";
			json += ESP.getFlashChipSizeByChipId();
			json += ",\"freeSketchSpace\":";
			json += ESP.getFreeSketchSpace();
			json += ",\"sketchSize\":";
			json += ESP.getSketchSize();
			FlashMode_t ideMode = ESP.getFlashChipMode();
			json += ",\"flashChipMode\":\"";
			json += (ideMode == FM_QIO ? "QIO" : ideMode == FM_QOUT ? "QOUT" : ideMode == FM_DIO ? "DIO" : ideMode == FM_DOUT ? "DOUT" : "UNKNOWN");
			json += "\",\"sdkVer\":\"";
			json += ESP.getSdkVersion();
			json += "\",\"resetReason\":\"";
			json += ESP.getResetReason();
			json += "\",\"resetInfo\":\"";
			json += ESP.getResetInfo();
			json += "\"}";

			server->send(200, "text/json", json);
		});

		return true;
	}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
