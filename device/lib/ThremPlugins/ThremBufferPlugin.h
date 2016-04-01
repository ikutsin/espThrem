#ifndef FILE_BUFFER_PLUGIN_SEEN
#define FILE_BUFFER_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

class ThremBufferPlugin : public IThremPlugin {
	String _name;
	int _bufferIndex;
	ThremBufferPlugin(String name, int bufferIndex) {
		_name = name + "Buffer";
		_bufferIndex = bufferIndex;
	}

	virtual int getUniqueId()
	{
		return 100 + _bufferIndex;
	}
	virtual String getName()
	{
		return _name;
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremBufferPlugin init" << endl;
#endif

		
		//root[]


		return true;
	}
	//virtual void readData(ThremContext* context)
	//{
	//}

	//virtual void writeData(ThremNotification* notification)
	//{
	//}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if (!jsonObject.containsKey("size")) {
			jsonObject["size"] = 200;
		}
	}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
