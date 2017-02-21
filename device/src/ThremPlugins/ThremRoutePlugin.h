#ifndef FILE_ROUTE_PLUGIN_SEEN
#define FILE_ROUTE_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

typedef ThremNotification*(*routeFunc)(ThremNotification* inNotification);

class ThremRoutePlugin : public IThremPlugin {
	int _routeIndex;
	String _name;
	routeFunc _func;

	LinkedList<ThremNotification*> *_notifications = new LinkedList<ThremNotification*>();

public:
	ThremRoutePlugin(String name, int routeIndex, routeFunc func) {
		this->_name = name;
		_routeIndex = routeIndex;
		_func = func;
	}
	virtual int getUniqueId()
	{
		return 200+_routeIndex;
	}
	virtual String getName()
	{
		return _name+"Route";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremRoutePlugin init" << endl;
#endif

		//ESP8266WebServer* server = context->getServer();

		return true;
	}
	virtual void readData(ThremContext* context)
	{
		while (_notifications->size()>0)
		{
			ThremNotification* input = _notifications->pop();
			context->addNotification(input->senderId, input->type, String(input->value));
			delete input;
		}
	}

	virtual void writeData(ThremNotification* notification)
	{
		if (ThremNotification* notif = _func(notification)) {
			_notifications->add(notif);
#ifdef DEBUG
			DEBUG << "Routed " << getName() << endl;
		}
		else
		{
			DEBUG << "Route " << getName() << " skip" << endl;
#endif
		}
	}

	//virtual void finalizeConfig(JsonObject& jsonObject) {
	//}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_ROUTE_PLUGIN_SEEN */
