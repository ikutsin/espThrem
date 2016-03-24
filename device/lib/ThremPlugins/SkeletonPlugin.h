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
	virtual char* getName()
	{
		return "NamePlugin";
	}

	virtual bool init(ThremContext* context)
	{
#ifdef LOG
		LOG << "ThremNamePluginPlugin init" << endl;
#endif

		ESP8266WebServer* server = context->getServer();

		return true;
	}
	virtual void readData(ThremContext* context)
	{

	}
	virtual void writeData(ThremNotification* notification)
	{

	}

	virtual bool handleNotFound(ThremContext* context, String uri) {
		return false;
	}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
