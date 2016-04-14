#ifndef FILE_THREM_SEEN
#define FILE_THREM_SEEN

#include "ThremContext.h"
#include "IThremPlugin.h"
#include "LinkedList.h"
#include "ArduinoJson.h"
#include <FS.h>

#include "ThremConfig.h"

struct PluginMeta {
	bool isEnabled;
};

class Threm {
private:
	ThremContext *_thremContext = new ThremContext();
	LinkedList<IThremPlugin*> *_plugins = new LinkedList<IThremPlugin*>();
	LinkedList<PluginMeta*>* _pluginMeta = new LinkedList<PluginMeta*>();
	bool spiffsOk = false;
public:

	void addPlugin(IThremPlugin* pPlugin);
	void start();
	void loop();

	String getJsonState();
	String getJsonStateFor(int id);
	void setJsonStateFor(int id, String data);

	IThremPlugin* getPluginById(int id);
};

#endif /* !FILE_THREM_SEEN */
