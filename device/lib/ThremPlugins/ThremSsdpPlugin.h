#ifndef FILE_SSDPPLUGIN_SEEN
#define FILE_SSDPPLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266SSDP.h>

class ThremSsdpPlugin : public IThremPlugin {

	virtual int getUniqueId()
	{
		return 21;
	}
	virtual char* getName()
	{
		return "SSDP";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremSsdpPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		server->on("/description.xml", HTTP_GET, [=](){
#ifdef LOG
			LOG << "SSDP handle descr" << endl;
#endif

			SSDP.schema(server->client());
		});

		String chipid = String(ESP.getChipId(), HEX);
		String flashchipid = String(ESP.getFlashChipId(), HEX);
		String name = "Sensor_" + chipid;

		SSDP.setSchemaURL("description.xml");
		SSDP.setHTTPPort(80);
		SSDP.setName(name.c_str());
		SSDP.setSerialNumber(chipid.c_str());
		SSDP.setURL("index.html");
		SSDP.setModelName(name.c_str());
		SSDP.setModelNumber(flashchipid.c_str());
		SSDP.setModelURL("http://usanov.net/");
		SSDP.setManufacturer("Ikutsin");
		SSDP.setManufacturerURL("http://usanov.net/");
		SSDP.begin();

#ifdef LOG
		LOG << "SSDP: " << name.c_str() << " " << chipid.c_str() << " " << flashchipid.c_str() << endl;
#endif

		return true;
	}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
