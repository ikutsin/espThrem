#ifndef UNIT_TEST
#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#include "Threm.h"
#include "ThremPlugins\ThremDiagPlugin.h"
#include "ThremPlugins\ThremWifiPlugin.h"
#include "ThremPlugins\ThremCoreApiPlugin.h"
#include "ThremPlugins\ThremInfoApiPlugin.h"
#include "ThremPlugins\ThremCaptivePortalPlugin.h" //needs ssdp?
#include "ThremPlugins\ThremSpiffsPlugin.h"
#include "ThremPlugins\ThremThermPlugin.h"
#include "ThremPlugins\ThremBufferPlugin.h"
#include "ThremPlugins\ThremMqttPlugin.h"

#include "ThremPlugins\ThremRoutePlugin.h"
#include "ThremPlugins\ThremSwitchPlugin.h"
#include "ThremPlugins\ThremButtonPlugin.h"


Threm* threm = new Threm();

bool bufferTherm(int senderId, int type) {
	return senderId == 40;
}

bool bufferNotTherm(int senderId, int type) {
	return senderId != 40 && senderId<100;
}

ThremNotification* pinSwitch(ThremNotification* notiff) {
	if(notiff->senderId==14) {
		if(notiff->type == 1) { //mqtt errors at 1
			return 0;
		}
		ThremNotification * notif =  new ThremNotification();

		notif->type = notiff->type;
		notif->value = String(notiff->value);
		notif->senderId = 2; //switch

		return notif;
	}

	return 0;
}

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

	plugin = new ThremCoreApiPlugin(threm);
	threm->addPlugin(plugin);

	plugin = new ThremInfoApiPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremThermPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremInfoApiPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremMqttPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremBufferPlugin("Therm", 0, &bufferTherm);
	threm->addPlugin(plugin);

	plugin = new ThremBufferPlugin("Diag", 1, &bufferNotTherm);
	threm->addPlugin(plugin);

	plugin = new ThremRoutePlugin("Switch", 0, &pinSwitch);
	threm->addPlugin(plugin);

	plugin = new ThremSwitchPlugin();
	threm->addPlugin(plugin);

	plugin = new ThremButtonPlugin();
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
#endif
