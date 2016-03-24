#ifndef FILE_COREAPI_PLUGIN_SEEN
#define FILE_COREAPI_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266WiFi.h>

class ThremCoreApiPlugin : public IThremPlugin {
	bool isResetRequest = false;
	bool isRestartRequest = false;

	Threm* threm;
public:
	ThremCoreApiPlugin(Threm* thremm) {
		threm = thremm;
	}

	virtual int getUniqueId()
	{
		return 31;
	}
	virtual char* getName()
	{
		return "Core API";
	}

	virtual bool init(ThremContext* context)
	{
#ifdef LOG
		LOG << "ThremCoreApiPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		server->on("/restart", [=](){
#ifdef LOG
			LOG << "CORE API handle restart" << endl;
#endif
			isRestartRequest = true;
			server->send(200, "text/plain", "OK (restart)");
		});

		server->on("/reset", [=](){
#ifdef LOG
			LOG << "CORE API handle reset" << endl;
#endif
			isResetRequest = true;
			isRestartRequest = true;
			server->send(200, "text/plain", "OK (reset)");
		});

		server->on("/info/threm.json", [=](){
			if (!server->hasArg("id")) {
				String json = threm->getJsonState();
				server->send(200, "text/json", json);
			}
			else {
#ifdef LOG
				LOG << "Respond config for " << server->arg("id") << endl;
#endif
				String json = threm->getJsonStateFor(server->arg("id").toInt());
				server->send(200, "text/json", json);
			}
		});

		server->on("/configure", HTTP_POST, [=](){

			if (!server->hasArg("id") || !server->hasArg("data")) {
				server->send(500, "text/plain", "BAD ARGS");
				return;
			}

			String filename = "/config/" + server->arg("id") + ".json";
#ifdef LOG
			LOG << "handleFileUpload Name: " << filename << endl;
#endif
			File configFile = SPIFFS.open(filename, "w");

			String data = server->arg("data");
			configFile.write((uint8_t*)data.c_str(), data.length());
			configFile.close();

			server->send(200, "text/plain", "(OK) " + filename);
		});

		return true;
	}
	virtual void readData(ThremContext* context)
	{
		if (isResetRequest)
		{
			context->addNotification(getUniqueId(), 1, 25);
			isResetRequest = false;
		}

		if (isRestartRequest)
		{
			context->addNotification(getUniqueId(), 1, 10);
			isRestartRequest = false;
		}
	}
	virtual void writeData(ThremNotification* notification)
	{
		if (notification->senderId == getUniqueId())
		{
			if (notification->type == 1)
			{
				int ntype = notification->value;
				switch (ntype)
				{
				case 25:
					//reset
					ESP.eraseConfig();
					//as in wifimanager
					WiFi.disconnect(true);
					//what does it do?
					ESP.reset();
					break;

				case 10:
					ESP.restart();
					//ESP.reset();
					break;
				}
			}
		}
	}

	virtual bool handleNotFound(ThremContext* context, String uri) {
		return false;
	}

};


#endif /* !FILE_DIAGPLUGIN_SEEN */
