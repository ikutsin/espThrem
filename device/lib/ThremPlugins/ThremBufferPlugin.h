#ifndef FILE_BUFFER_PLUGIN_SEEN
#define FILE_BUFFER_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

typedef bool(* bufferFilter)(int,int);

class ThremBufferPlugin : public IThremPlugin {
	String _name;
	int _bufferIndex;
	bufferFilter _filterFunc;
	LinkedList<ThremNotification*> *_notifications = new LinkedList<ThremNotification*>();
	ESP8266WebServer* server;
	int size = 50;


	ThremBufferPlugin(String name, int bufferIndex, bufferFilter filterFunc) {
		this->_name = name + "Buffer";
		_bufferIndex = bufferIndex;
		_filterFunc = filterFunc;
	}

	virtual int getUniqueId()
	{
		return 100 + _bufferIndex;
	}
	virtual String getName()
	{
		return _name;
	}

	void handleBufferConent() {
		String result = "[";

		for (int i = 0; i < _notifications->size(); i++) {
			result += _notifications->get(i)->toJson();
			if (i + 1 != _notifications->size()) {
				result += ", ";
			}
		}

		result += "]";
		server->send(200, "text/json", result);
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremBufferPlugin (" << getUniqueId() << ") init" << endl;
#endif
		size = max(root["size"], size);

		server = context->getServer();
		server->on(String("/buffer/") + String(getUniqueId()), std::bind(&ThremBufferPlugin::handleBufferConent, this));
		server->on(String("/buffer/") + getName(), std::bind(&ThremBufferPlugin::handleBufferConent, this));

		return true;
	}
	//virtual void readData(ThremContext* context)
	//{
	//}

	virtual void writeData(ThremNotification* notification)
	{
		//TODO: http://www.cplusplus.com/forum/articles/18757/
		if (_filterFunc(notification->senderId, notification->type) {
			ThremNotification nn = new ThremNotification();
			nn->senderId = notification->senderId;
			nn->type = notification->type;
			nn->value = notification->value;
			_notifications->add(nn);

#ifdef DEBUG
			DEBUG << "ThremBuffer new size" << _notifications->size() << endl;
#endif
		}

		while (_notifications->size()>size)
		{
			_notifications->shift();
		}

	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if (!jsonObject.containsKey("size")) {
			jsonObject["size"] = size;
		}
	}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
