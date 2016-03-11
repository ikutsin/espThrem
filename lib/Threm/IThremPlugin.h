#ifndef FILE_THREMPLUGIN_SEEN
#define FILE_THREMPLUGIN_SEEN

#include <ESP8266WebServer.h>
#include "Threm.h"

class IThermPlugin {
public:
    IThermPlugin() {};
    virtual ~IThermPlugin() {};
    virtual bool initialize(ESP8266WebServer* server, );
}


#endif /* !FILE_THREMPLUGIN_SEEN */
