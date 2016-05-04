replace NAMEPLUGIN
replace NamePlugin
set uniqueid


#ifndef FILE_NAMEPLUGIN_PLUGIN_SEEN
#define FILE_NAMEPLUGIN_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

class ThremNamePluginPlugin : public IThremPlugin {
	virtual int getUniqueId()
	{
		return uniqueid;
	}
	virtual String getName()
	{
		return "NamePlugin";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremNamePluginPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		return true;
	}
	//virtual void readData(ThremContext* context)
	//{
	//}

	//virtual void writeData(ThremNotification* notification)
	//{
	//}

	//virtual void finalizeConfig(JsonObject& jsonObject) {
	//}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_NAMEPLUGIN_PLUGIN_SEEN */
