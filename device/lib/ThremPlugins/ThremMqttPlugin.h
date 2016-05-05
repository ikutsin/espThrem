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

		if (!root.containsKey("server")) {
			return false;
		}
		String serverAddr = root["server"];
		String rootName = root["name"];
		deviceName = rootName;
		IPAddress addr = IPAddress();
		addr.fromString(serverAddr.c_str());
		client = new PubSubClient(wclient, addr);
		client->set_callback(callback);

		bool status = client->connect(deviceName);
		return status;
	}
	virtual void readData(ThremContext* context)
	{
		if (!client->connected()) {
			if (client->connect(deviceName)) {
				context->addNotification(getUniqueId(), 1, String(""));
			}
			else {
				context->addNotification(getUniqueId(), 2, String(""));
			}
		}
		else {
			client->loop();
		}
	}

	virtual void writeData(ThremNotification* notification)
	{
		if (client->connected()) {
			String data = notification->toJson();
			client->publish(deviceName, data);
		}
	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if (!jsonObject.containsKey("name")) {
			String chipid = String(ESP.getChipId(), HEX);
			String name = "Sensor_" + chipid;
			jsonObject["name"] = name;
		}
	}
};


#endif /* !FILE_MQTTPLUGIN_PLUGIN_SEEN */
