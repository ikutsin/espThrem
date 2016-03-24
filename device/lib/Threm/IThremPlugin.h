#ifndef FILE_THREMPLUGIN_SEEN
#define FILE_THREMPLUGIN_SEEN

#include "ThremContext.h"
#include "ThremConfig.h"

class IThremPlugin {
public:
    virtual bool init(ThremContext* context);
    virtual void readData(ThremContext* context);
    virtual void writeData(ThremNotification* notification);

    virtual int getUniqueId();
    virtual char* getName();

	virtual bool handleNotFound(ThremContext* context, String uri);
};

#endif /* !FILE_THREMPLUGIN_SEEN */
