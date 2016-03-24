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

		server->onNotFound([=](){
			IThremPlugin*plugin;
			PluginMeta* meta;

			String uri = server->uri();
			for (int i = 0; i < _plugins->size(); i++) {
				plugin = _plugins->get(i);
				meta = _pluginMeta->get(i);
				if (meta->isEnabled) {
					if (plugin->handleNotFound(_thremContext, uri)) {
#ifdef LOG
						LOG << "NotFound handled by: " << plugin->getName() << endl;
#endif
						return;
					}
				}
			}

			String message = "File Not Found\n\n";
			message += "URI: ";
			message += server->uri();
			message += "\nMethod: ";
			message += (server->method() == HTTP_GET) ? "GET" : "POST";
			message += "\nArguments: ";
			message += server->args();
			message += "\n";

			for (uint8_t i = 0; i < server->args(); i++) {
				message += " " + server->argName(i) + ": " + server->arg(i) + "\n";
			}
			server->sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			server->sendHeader("Pragma", "no-cache");
			server->sendHeader("Expires", "-1");
			server->send(404, "text/plain", message);
		});
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
