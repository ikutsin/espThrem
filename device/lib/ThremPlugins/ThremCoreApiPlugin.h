#ifndef FILE_COREAPI_PLUGIN_SEEN
#define FILE_COREAPI_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266WiFi.h>
#include <FS.h>

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
	virtual String getName()
	{
		return "Core API";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremCoreApiPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		server->on("/restart", HTTP_POST, [=](){
#ifdef LOG
			LOG << "CORE API handle restart" << endl;
#endif
			isRestartRequest = true;
			server->send(200, "text/plain", "OK (restart)");
		});

		server->on("/reset", HTTP_POST, [=](){
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
				server->send(500, "text/plain", "BAD ARGS (id, data)");
				return;
			}
			int pluginid = server->arg("id").toInt();
			threm->setJsonStateFor(pluginid, server->arg("data"));
			server->send(200, "text/plain", "(OK) " + server->arg("id"));
		});

		return true;
	}
	virtual void readData(ThremContext* context)
	{
		if (isResetRequest)
		{
			context->addNotification(getUniqueId(), 1, "reset");
			isResetRequest = false;
		}

		if (isRestartRequest)
		{
			context->addNotification(getUniqueId(), 1, "restart");
			isRestartRequest = false;
		}
	}
	virtual void writeData(ThremNotification* notification)
	{
		if (notification->senderId == getUniqueId())
		{
			if (notification->type == 1)
			{
				String ntype = notification->value;
				if (ntype == "reset") {
					//delete config
					Dir dir = SPIFFS.openDir("/config");
					while (dir.next()) {
						SPIFFS.remove(dir.fileName());
					}
					//reset
					ESP.eraseConfig();
					//as in wifimanager
					WiFi.disconnect(true);
					//what does it do?
					ESP.reset();
				}
				else if (ntype == "restart")
				{
					ESP.restart();
				}
			}
		}
	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		//never off
		jsonObject["off"] = 0;
	}

};


#endif /* !FILE_DIAGPLUGIN_SEEN */
