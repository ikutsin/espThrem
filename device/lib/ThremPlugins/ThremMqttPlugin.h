replace MQTTWPLUGIN
replace MqttWriterPlugin
set uniqueid


#ifndef FILE_MQTTWPLUGIN_PLUGIN_SEEN
#define FILE_MQTTWPLUGIN_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"
#include <PubSubClient.h>

class ThremMqttWriterPluginPlugin : public IThremPlugin {
	virtual int getUniqueId()
	{
		return 14;
	}
	virtual String getName()
	{
		return "MqttWriterPlugin";
	}

	void callback(const MQTT::Publish& pub) {
		// handle message arrived
	}

	WiFiClient wclient;
	PubSubClient client;
	String deviceName;

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremMqttWriterPlugin init" << endl;
#endif

		//ESP8266WebServer* server = context->getServer();

		if (!root.containsKey("server")) {
			return false;
		}
		String serverAddr = root["server"];
		deviceName = root["name"];
		IPAddress addr = IPAddress(serverAddr);
		client = PubSubClient(wclient, addr);
		client.set_callback(callback);

		return true;
	}
	virtual void readData(ThremContext* context)
	{
		if (!client.connected()) {
			if (client.connect(deviceName)) {
				context->addNotification(getUniqueId(), 1, String(""));
			}
			else {
				context->addNotification(getUniqueId(), 2, String(""));
			}
		}
		else {
			client.loop();
		}
	}

	virtual void writeData(ThremNotification* notification)
	{
		if (client.connected()) {
			String data = notification->toJson();
			client.publish(deviceName, data);
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


#endif /* !FILE_MQTTWPLUGIN_PLUGIN_SEEN */
