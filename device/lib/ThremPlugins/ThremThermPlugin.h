#ifndef FILE_THERM_PLUGIN_SEEN
#define FILE_THERM_PLUGIN_SEEN

#include <DHT.h>

#include "IThremPlugin.h"
#include "Streaming.h"


struct lastMeasure{
	float t;
	float h;
	float hic;
	long millis;
};
class ThremThermPlugin : public IThremPlugin {

	DHT* dht;
	int _interval = 10000;
	int _intervalmillis;

	lastMeasure _lastMeasure;

	virtual int getUniqueId()
	{
		return 40;
	}
	virtual String getName()
	{
		return "Therm";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremThermPlugin init" << endl;
#endif
		ESP8266WebServer* server = context->getServer();
		dht = new DHT(THERM_PIN, DHT22);

		server->on("/therm.json", HTTP_GET, [=](){
			String s = "{\"h\":";
			s += _lastMeasure.h;
			s += ",\"hic\":";
			s += _lastMeasure.hic;
			s += ",\"t\":";
			s += _lastMeasure.t;
			s += ",\"millis\":";
			s += _lastMeasure.millis;
			s += "}";
			server->send(200, "text/json", s);
		});
		int delay = root["delay"];
		_interval = std::max(_interval, delay);
		_intervalmillis = millis();
		return true;
	}
	virtual void readData(ThremContext* context)
	{
		long milliz = millis();
		if (milliz > _intervalmillis + _interval) {
#ifdef DEBUG
			DEBUG << "Reading DHT" << endl;
#endif
			_intervalmillis = milliz;

			_lastMeasure.h = dht->readHumidity();
			_lastMeasure.t = dht->readTemperature();
			//float f = dht.readTemperature(true);

			if (isnan(_lastMeasure.h) || isnan(_lastMeasure.t)) {// || isnan(f)) {
#ifdef LOG
				LOG << "Failed to read from DHT sensor! pin:" << THERM_PIN << endl;
#endif
			}
			else
			{
				// Compute heat index in Fahrenheit (the default)
				//float hif = dht.computeHeatIndex(f, h);
				// Compute heat index in Celsius (isFahreheit = false)
				_lastMeasure.hic = dht->computeHeatIndex(_lastMeasure.t, _lastMeasure.h, false);
				_lastMeasure.millis = milliz;

				context->addNotification(getUniqueId(), 1, String(_lastMeasure.t));
				context->addNotification(getUniqueId(), 2, String(_lastMeasure.h));
				context->addNotification(getUniqueId(), 3, String(_lastMeasure.hic));
			}
		}
	}

	//virtual void writeData(ThremNotification* notification)
	//{
	//}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if (!jsonObject.containsKey("delay")) {
			jsonObject["delay"] = _interval;
		}
	}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
