#ifndef FILE_THREMCONTEXT_SEEN
#define FILE_THREMCONTEXT_SEEN

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include "LinkedList.h"
#include "Streaming.h"
#include "ThremConfig.h"

class ThremNotification {
public:
	int senderId;
	int type;
	String value;
	long milliss;

	ThremNotification() {
		milliss = millis();
	}

	String toJson() {
		String output = "{";

		output += "\"senderId\":";
		output += senderId;
		output += ",\"type\":";
		output += type;
		output += ",\"value\":\"";
		output += value;
		output += "\",\"time\":";
		output += milliss;
		output += "}";

		return output;
	}
};

class ThremContext {
private:
	LinkedList<ThremNotification*>* _notifications = new LinkedList<ThremNotification*>();
	ESP8266WebServer* _server = new ESP8266WebServer(80);
public:
	bool isStarted = false;
	void beforeLoop();
	void afterLoop();

	~ThremContext() {
		delete _server;
		_notifications->clear();
		delete _notifications;
	}

	ESP8266WebServer* getServer() {
		return _server;
	}

	void addNotification(int senderId, int type, String value)
	{
#ifdef DEBUG
		DEBUG << "Add notification " << senderId << " " << type << " "  << value << " "  << endl;
#endif
		ThremNotification* notif = new ThremNotification();
		notif->type = type;
		notif->value = value;
		notif->senderId = senderId;
		_notifications->add(notif);
	}

	LinkedList<ThremNotification*>* getNotifications()
	{
		return _notifications;
	}
};

#endif /* !FILE_THREMPLUGIN_SEEN */
