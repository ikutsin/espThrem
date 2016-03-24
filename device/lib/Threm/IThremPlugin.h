#ifndef FILE_THREMPLUGIN_SEEN
#define FILE_THREMPLUGIN_SEEN

#include "ThremContext.h"
#include "ThremConfig.h"

#include "ArduinoJson.h"

class IThremPlugin {
public:
	virtual bool init(ThremContext* context, JsonObject& root);

    virtual int getUniqueId();
    virtual char* getName();
	
	virtual void readData(ThremContext* context) {

	}
	virtual void writeData(ThremNotification* notification) {

	}
	virtual bool handleNotFound(ThremContext* context, String uri){
		return false;
	}
	virtual void finalizeConfig(JsonObject& jsonObject) {

	}
};

#endif /* !FILE_THREMPLUGIN_SEEN */
