#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#include "Threm.h"
#include "ThremDiagPlugin.h"
#include "ThremSsdpPlugin.h"
#include "ThremWifiPlugin.h"
#include "ThremWebSocketPlugin.h"
#include "ThremCoreApiPlugin.h"
#include "ThremInfoApiPlugin.h"
#include "ThremCaptivePortalPlugin.h"
#include "ThremSpiffsPlugin.h"


Threm* threm = new Threm();

void setup() {
	Serial.begin(115200);
	Serial.print("Free heap -> ");
	Serial.print(ESP.getFreeHeap());
	Serial.print("\n");
	Serial.setDebugOutput(true);

	//add plugins
	IThremPlugin* plugin;

	plugin = new ThremDiagPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremWifiPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremCaptivePortalPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremSpiffsPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremSsdpPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremWebSocketPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremCoreApiPlugin(threm);
	threm->addPlugin(plugin);

	plugin = new ThremInfoApiPlugin();
	threm->addPlugin(plugin);

	threm->start();

	//delay(5000);
	//Serial.println("start");
}

void loop()
{
	threm->loop();
	//delay(500);
	//Serial.println("loop");
}
