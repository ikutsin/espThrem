#ifndef FILE_THREM_SEEN
#define FILE_THREM_SEEN

#include "ThremContext.h"
#include "IThremPlugin.h"
#include "LinkedList.h"

#include "ThremConfig.h"


struct PluginMeta {
  bool isEnabled;
};

class Threm {
private:
  ThremContext *_thremContext = new ThremContext();
  LinkedList<IThremPlugin*> *_plugins = new LinkedList<IThremPlugin*> ();
  LinkedList<PluginMeta*>* _pluginMeta = new LinkedList<PluginMeta*> ();
public:

  void addPlugin(IThremPlugin* pPlugin);
  void start();
  void loop();
};

#endif /* !FILE_THREM_SEEN */
