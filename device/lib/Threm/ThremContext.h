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
  float value;
};

class ThremContext {
private:
  LinkedList < ThremNotification* >* _notifications = new LinkedList < ThremNotification* > ();
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

  void addNotification(int senderId, int type, int value)
  {
     #ifdef DEBUG
     DEBUG << "Add notification " << notification->senderId << " " << notification->type << " "  << notification->value << " "  << endl;
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
