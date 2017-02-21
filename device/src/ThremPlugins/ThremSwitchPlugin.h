#ifndef FILE_SWITCH_PLUGIN_SEEN
#define FILE_SWITCH_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

int pinsToUse[] = {16,14,12,13,5,4};
int pinsToUseSize = (sizeof pinsToUse / sizeof *pinsToUse);

class ThremSwitchPlugin : public IThremPlugin {
	virtual int getUniqueId()
	{
		return 2;
	}
	virtual String getName()
	{
		return "Switch";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremSwitchPlugin init for pinsize " << pinsToUseSize << endl;
#endif

		//ESP8266WebServer* server = context->getServer();
		JsonArray& valuesArray = root["values"];
		JsonArray& pinsArray = root["pins"];
		int arrsSize = valuesArray.size();

		if(pinsArray.size()<arrsSize) {
			#ifdef LOG
					LOG << "key value count mismatch " << pinsArray.size();
					LOG << " keys to " << arrsSize << " values" << endl;
			#endif
			return false;
		}

    for(int i = 0; i < arrsSize; i++) {
			int pin = pinsArray[i];
			pinMode(pin, OUTPUT);
			#ifdef LOG
					LOG << "pinMode(" << pin <<", " << OUTPUT <<");" << endl;
			#endif
			int v = valuesArray[i];
			uint8_t hilo = v>0?HIGH:LOW; //hilo is a dup
			digitalWrite(pin, hilo);
			#ifdef LOG
					LOG << "digitalWrite(" << pin <<", "<< hilo <<");" << endl;
			#endif

		}

		return true;
	}
	//virtual void readData(ThremContext* context)
	//{
	//}

	virtual void writeData(ThremNotification* notification)
	{
		if(notification->senderId != getUniqueId()) {
			return;
		}
		for(int i=0; i < pinsToUseSize; i++) {
			int ledPin = pinsToUse[i];
			if(notification->type==ledPin) {
				long value = notification->value.toInt();
				int hilo = value>0?HIGH:LOW;
				digitalWrite(ledPin, hilo);
#ifdef LOG
		LOG << "switch set " << ledPin << " at " << value << " which is " << hilo << endl;
#endif
				return;
			}
    }
#ifdef LOG
		LOG << "switch skip " << notification->type << endl;
#endif
	}

	virtual void finalizeConfig(JsonObject& jsonObject) {
		if(!jsonObject.containsKey("pins")) {
				JsonArray& data = jsonObject.createNestedArray("pins");
				for(int i = 0; i < pinsToUseSize; i++) {
					data.add(pinsToUse[i]);

				}
		}
		if(!jsonObject.containsKey("values")) {
			JsonArray& data = jsonObject.createNestedArray("values");
			for(int i = 0; i < pinsToUseSize; i++) {
				data.add("42");
			}
		}
	}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_SWITCH_PLUGIN_SEEN */
