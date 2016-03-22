#include "Threm.h"
#include "ThremContext.h"
#include "IThremPlugin.h"
#include "LinkedList.h"

void Threm::addPlugin(IThremPlugin* pPlugin) {
        if(!_thremContext->isStarted) {
                _plugins->add(pPlugin);
                PluginMeta* meta = new PluginMeta();
                _pluginMeta->add(meta);
        }
}

void Threm::start() {
        _thremContext->isStarted = true;

        #ifdef DEBUG
        DEBUG << "Threm::start" << endl;
        #endif

        ESP8266WebServer* server = _thremContext->getServer();

        IThremPlugin* plugin;
        PluginMeta* meta;

        for(int i = 0; i < _plugins->size(); i++) {
                plugin = _plugins->get(i);
                bool canEnable = plugin->init(_thremContext);

                meta = _pluginMeta->get(i);
                meta->isEnabled = canEnable;
                _pluginMeta->set(i, meta);

                yield();
        }
        #ifdef DEBUG
        DEBUG << "Plugins declared: " <<  _plugins->size() << endl;
        #endif

        server->begin();
        #ifdef DEBUG
        DEBUG << "Web server started: " <<  _plugins->size() << endl;
        #endif
}


void Threm::loop() {

        // #ifdef DEBUG
        // DEBUG << "Threm::loop" << endl;
        // #endif

        _thremContext->beforeLoop();

        IThremPlugin*plugin;
        PluginMeta* meta;

        for(int i = 0; i < _plugins->size(); i++) {
                plugin = _plugins->get(i);
                meta = _pluginMeta->get(i);
                if(meta->isEnabled) {
                        plugin->readData(_thremContext);
                }
        }
        yield();
        LinkedList < ThremNotification* >* notifications = _thremContext->getNotifications();

        for(int i = 0; i < _plugins->size(); i++) {
                plugin = _plugins->get(i);
                meta = _pluginMeta->get(i);
                if(meta->isEnabled) {
                        for(int n = 0; n < notifications->size(); n++) {
                                plugin->writeData(notifications->get(n));
                        }
                }
        }
        yield();

        _thremContext->afterLoop();

        ESP8266WebServer* server = _thremContext->getServer();
        server->handleClient();
}
