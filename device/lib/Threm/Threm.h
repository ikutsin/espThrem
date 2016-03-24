#ifndef FILE_THREM_SEEN
#define FILE_THREM_SEEN

#include "ThremContext.h"
#include "IThremPlugin.h"
#include "LinkedList.h"

#include "ThremConfig.h"
#include <FS.h>


struct PluginMeta {
	bool isEnabled;
};

class Threm {
private:
	ThremContext *_thremContext = new ThremContext();
	LinkedList<IThremPlugin*> *_plugins = new LinkedList<IThremPlugin*>();
	LinkedList<PluginMeta*>* _pluginMeta = new LinkedList<PluginMeta*>();
public:

	void addPlugin(IThremPlugin* pPlugin);
	void start();
	void loop();

	String getJsonStateFor(int id) {
		String configLocation = "/config/" + String(id) + ".json";
		if (SPIFFS.exists(configLocation)) {
			File file = SPIFFS.open(configLocation, "r");
			String content = file.readString();
			return content;
		}
#ifdef LOG
		LOG << "Config not found at " << configLocation << endl;
#endif
		return "{}";
	}

	String getJsonState() {
		String result = "[";

		IThremPlugin* plugin;
		PluginMeta* meta;
		for (int i = 0; i < _plugins->size(); i++) {
			plugin = _plugins->get(i);
			meta = _pluginMeta->get(i);

			result += "{\"id\":\"" + String(plugin->getUniqueId());
			result += "\",\"name\":\"" + String(plugin->getName());
			result += "\",\"running\":\"" + String(meta->isEnabled);

			result += "\",\"config\":" + getJsonStateFor(plugin->getUniqueId());

			result += "}";
		}

		result += "]";
		return result;
	}
};

#endif /* !FILE_THREM_SEEN */
