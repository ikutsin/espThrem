#ifndef FILE_MQTTPLUGIN_PLUGIN_SEEN
#define FILE_MQTTPLUGIN_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"
#include <PubSubClient.h>

//#ifdef ESP8266
#include <functional>
//#endif

class ThremMqttInput {
public:
	String payload;
	String topic;
	ThremMqttInput(String t, String p) {
		payload = p;
		topic = t;
	}
};

class ThremMqttPlugin : public IThremPlugin {
	WiFiClient wclient;
	PubSubClient* client;
	String deviceName;

	int lastMillis = 0;
	int testInterval = 5000;

	int type = 0x1;

	LinkedList<ThremMqttInput*>* _callbacks = new LinkedList<ThremMqttInput*>();

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
		type = ((jtype)>(type)?(jtype):(type)); //std::max(jtype, type);

		#ifdef LOG
				LOG << "publish type" << type << endl;
		#endif

		deviceName = rootName;
		IPAddress addr = IPAddress();
		addr.fromString(serverAddr.c_str());
		client = new PubSubClient(addr, 1883, wclient);

		std::function<void(char*, uint8_t*, unsigned int)> callback =
			std::bind(&ThremMqttPlugin::callback, this,
				std::placeholders::_1,
				std::placeholders::_2,
				std::placeholders::_3);

		client->setCallback(callback);
		reconnect();

		lastMillis = millis();
		return true;
	}

	bool reconnect() {
		bool status = client->connect(deviceName.c_str());
	#ifdef LOG
			LOG << "MQTTstatus" << status << endl;
	#endif
		if(status) {
			String topic = getInTopicPart();
			topic += "#";
			client->subscribe(topic.c_str());
		#ifdef LOG
				LOG << "Callback on " << topic << endl;
		#endif
		}


		return status;
	}

	virtual void readData(ThremContext* context)
	{
		if (!client->connected()) {
			if ((lastMillis + testInterval) < millis()) {
				if (reconnect()) {
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
			String topic = getInTopicPart();
			while (_callbacks->size()>0)
			{
				ThremMqttInput* input = _callbacks->pop();

				// sensor\in\[recipient]\[value] format
				String recipientStr = input->topic.substring(topic.length());
				int recipientId = recipientStr.toInt();
				if (recipientId > 0) {
					context->addNotification(getUniqueId(), recipientId, input->payload);
				}
				else {
#ifdef LOG
					LOG << "failed to parse input: " << recipientStr << endl;
					LOG << input->topic << endl;
					LOG << input->payload << endl;
#endif
				}
				delete input;
			}

			client->loop();
		}
	}

	virtual void writeData(ThremNotification* notification)
	{
		if (client->connected()) {
			if ((type & 0b0001) == 0b0001) {
				String topic = String(deviceName);
				topic += "/out/";
				topic += notification->senderId;
				topic += "/";
				topic += notification->type;

				client->publish(topic.c_str(), notification->value.c_str());
			}
			if ((type & 0b0010) == 0b0010) {
				String topic = String(deviceName);
				topic += "/out/";

				String data = notification->toJson();
				client->publish(topic.c_str(), data.c_str());
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

	String getInTopicPart() {
		String topic = String(deviceName);
		topic += "/in/";
		return topic;
	}

	void callback(char* topic, uint8_t* payload, unsigned int length) {
		String pstr = String();
		for (int i = 0; i < length; i++) {
			pstr += (char)payload[i];
		}
		#ifdef DEBUG
				DEBUG << "Message arrived [" << topic << "] " << endl;
				DEBUG << pstr << endl;
		#endif

		ThremMqttInput* notif = new ThremMqttInput(String(topic), pstr);
		_callbacks->add(notif);
	}
};


#endif /* !FILE_MQTTPLUGIN_PLUGIN_SEEN */
