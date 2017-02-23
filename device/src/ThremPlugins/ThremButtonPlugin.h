#ifndef FILE_BUTTON_PLUGIN_SEEN
#define FILE_BUTTON_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

int buttonPinsToUse[] = {5};

class ThremButtonPlugin : public IThremPlugin {
  LinkedList<int> _pinsToUse = LinkedList<int>();
  LinkedList<int> _pinValues = LinkedList<int>();

	virtual int getUniqueId()
	{
		return 4;
	}
	virtual String getName()
	{
		return "Button";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
    JsonArray& pinsArray = root["pins"];
		int arrsSize = pinsArray.size();

#ifdef LOG
    LOG << "ThremButtonPlugin init for pinsize " << arrsSize << endl;
#endif

    for(int i = 0; i < arrsSize; i++) {
      int pin = pinsArray[i];
      _pinsToUse.add(pin);
      _pinValues.add(0);
      pinMode(pin, INPUT);
#ifdef LOG
      LOG << "pinMode(" << pin <<", " << INPUT <<");" << endl;
#endif
    }

		//ESP8266WebServer* server = context->getServer();
		return true;
	}
	virtual void readData(ThremContext* context)
	{
    int pinsToUseSize = _pinsToUse.size();
		for(int i=0; i < pinsToUseSize; i++) {
      int ledPin = _pinsToUse.get(i);
      int newValue = digitalRead(ledPin);
      int lastValue = _pinValues.get(i);

      if(newValue!=lastValue) {

#ifdef LOG
        LOG << "button at " << ledPin <<" new value " << newValue << endl;
#endif
        _pinValues.set(i, newValue);
        context->addNotification(getUniqueId(), ledPin, String(newValue));
      }
    }
	}

	//virtual void writeData(ThremNotification* notification)
	//{
	//}

	virtual void finalizeConfig(JsonObject& jsonObject) {
    int pinsToUseSize = (sizeof buttonPinsToUse / sizeof *buttonPinsToUse);

    if(!jsonObject.containsKey("pins")) {
        JsonArray& data = jsonObject.createNestedArray("pins");
        for(int i = 0; i < pinsToUseSize; i++) {
          data.add(buttonPinsToUse[i]);
        }
    }
	}

	//virtual bool handleNotFound(ThremContext* context, String uri) {
	//	return false;
	//}
};


#endif /* !FILE_BUTTON_PLUGIN_SEEN */
