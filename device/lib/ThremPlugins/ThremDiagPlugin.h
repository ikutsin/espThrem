#ifndef FILE_DIAGPLUGIN_SEEN
#define FILE_DIAGPLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

class ThremDiagPlugin : public IThremPlugin {
	int lastMillis = 0;
	int lastHeapSize = 0;

	virtual int getUniqueId()
	{
		return 12;
	}
	virtual char* getName()
	{
		return "Serial diagnostics";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremDiagPlugin init" << endl;
#endif
		return true;
	}
	virtual void readData(ThremContext* context)
	{
#ifdef DEBUG
		if ((lastMillis + 5000) < millis())
		{
			DEBUG << "ThremDiagPlugin readdata add notifications" << endl;
			context->addNotification(getUniqueId(), 1, String(millis()));
			lastMillis = millis();
		}
#endif
#ifdef LOG
		int heapSize = ESP.getFreeHeap();
		if (lastHeapSize != heapSize) {
			context->addNotification(getUniqueId(), 2, String(heapSize));
			lastHeapSize = heapSize;
		}
#endif
	}
	virtual void writeData(ThremNotification* notification)
	{
#ifdef LOG
		LOG << "writeData: " << notification->senderId << " " << notification->type << " " << notification->value << endl;
#endif
	}

};


#endif /* !FILE_DIAGPLUGIN_SEEN */
