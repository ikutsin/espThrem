#ifndef FILE_MQTTPLUGIN_PLUGIN_SEEN
#define FILE_MQTTPLUGIN_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"
#include <PubSubClient.h>

void callback(const MQTT::Publish& pub) {
	// handle message arrived
}

class ThremMqttPlugin : public IThremPlugin {
	WiFiClient wclient;
	PubSubClient* client;
	String deviceName;

	int lastMillis = 0;
	int testInterval = 5000;

	int type = 0x1;

	virtual int getUniqueId()
	{
		return 14;
	}
	virtual String getName()
	{
		return "MqttPlugin";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremMqttPlugin init" << endl;
#endif

		//ESP8266WebServer* server = context->getServer();

		if (WiFi.getMode() != WIFI_STA || !WiFi.status() == WL_CONNECTED)
		{
			return false;
		}

		String serverAddr = root["server"];
		String rootName = root["name"];

		int jtype = root["type"];
		type = std::max(jtype, type);

		deviceName = rootName;
		IPAddress addr = IPAddress();
		addr.fromString(serverAddr.c_str());
		client = new PubSubClient(wclient, addr);
		client->set_callback(callback);

		bool status = client->connect(deviceName);
#ifdef LOG
		LOG << "MQTTstatus" << status << endl;
#endif
		return true;
	}
	virtual void readData(ThremContext* context)
	{
		if (!client->connected()) {
			if ((lastMillis + testInterval) < millis()) {
				if (client->connect(deviceName)) {
					context->addNotification(getUniqueId(), 1, String("OK"));
					testInterval = 5000;
				}
				else {
					context->addNotification(getUniqueId(), 1, String("ERR"));
					testInterval += 500;
				}
				lastMillis = millis();
			}
		}
		else {
			client->loop();
		}
	}

	virtual void writeData(ThremNotification* notification)
	{
		if (client->connected()) {

			if ((type & (1 << 0)) >> 0) {
				String data = notification->toJson();
				client->publish(deviceName, data);
			}
			if ((type & (1 << 1)) >> 1) {
				String topic = String(deviceName);
				topic += "/";
				topic += notification->senderId;
				topic += "/";
				topic += notification->type;
				client->publish(topic, notification->value);
			}
		}
	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if (!jsonObject.containsKey("name")) {
			String chipid = String(ESP.getChipId(), HEX);
			String name = "Sensor_" + chipid;
			jsonObject["name"] = name;
		}

		if (!jsonObject.containsKey("type")) {
			jsonObject["type"] = 0;
		}
	}
};


#endif /* !FILE_MQTTPLUGIN_PLUGIN_SEEN */
