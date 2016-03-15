#ifndef FILE_COREAPI_PLUGIN_SEEN
#define FILE_COREAPI_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266WiFi.h>

class ThremCoreApiPlugin: public IThremPlugin {
  bool isResetRequest = false;
  bool isRestartRequest = false;

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

    server->on("/restart", [ = ](){
      #ifdef LOG
      LOG << "CORE API handle restart" << endl;
      #endif
      isRestartRequest = true;
      server->send(200, "text/plain", "OK (restart)");
    });

    server->on("/reset", [ = ](){
      #ifdef LOG
      LOG << "CORE API handle reset" << endl;
      #endif
      isResetRequest = true;
      isRestartRequest = true;
      server->send(200, "text/plain", "OK (reset)");
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
                //ESP.eraseConfig();
                // WiFi.disconnect(true);
                //as in wifimanager
                break;

              case 10:
                ESP.restart();
                //ESP.reset();
                break;
              }
          }
      }
  }

};


#endif /* !FILE_DIAGPLUGIN_SEEN */
