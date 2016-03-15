#ifndef FILE_CAPTIVEPORTAL_PLUGIN_SEEN
#define FILE_CAPTIVEPORTAL_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <DNSServer.h>

class ThremCaptivePortalPlugin: public IThremPlugin {
  DNSServer* dnsServer;
  ESP8266WebServer* server;

  void handleNotFound();
  void handle204();
  bool captivePortal();

  //helpers
  boolean isIp(String str);
  String toStringIp(IPAddress ip);

  virtual int getUniqueId()
  {
    return 3;
  }
  virtual char* getName()
  {
    return "CaptivePortal";
  }

  virtual bool init(ThremContext* context)
  {
    #ifdef LOG
    LOG << "ThremCaptivePortalPlugin init" << endl;
    #endif

    if (WiFi.status() == WL_CONNECTED)
      {
        return false;
      }
      #ifdef LOG
    LOG << "Switching to captive portal" << endl;
      #endif

    WiFi.mode(WIFI_AP);

    dnsServer = new DNSServer();
    dnsServer->setErrorReplyCode(DNSReplyCode::NoError);
    dnsServer->start(53, "*", WiFi.softAPIP());

    server = context->getServer();
    return true;
  }
  virtual void readData(ThremContext* context)
  {
    dnsServer->processNextRequest();
  }
  virtual void writeData(ThremNotification* notification)
  {
  }
};
#endif /* !FILE_DIAGPLUGIN_SEEN */
