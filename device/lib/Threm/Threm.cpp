#include "Threm.h"
#include "ThremContext.h"
#include "IThremPlugin.h"
#include "LinkedList.h"

#include "ArduinoJson.h"

void Threm::addPlugin(IThremPlugin* pPlugin) {
	if (!_thremContext->isStarted) {
		_plugins->add(pPlugin);
		PluginMeta* meta = new PluginMeta();
		_pluginMeta->add(meta);
	}
}

void Threm::start() {
	_thremContext->isStarted = true;

#ifdef LOG
	LOG << "Threm::start" << endl;
	LOG << "Free heap " << ESP.getFreeHeap() << endl;
#endif

	if (!SPIFFS.begin()) {
#ifdef LOG
		LOG << "SPIFFS failed" << endl;
#endif
	}

	ESP8266WebServer* server = _thremContext->getServer();

	IThremPlugin* plugin;
	PluginMeta* meta;

	for (int i = 0; i < _plugins->size(); i++) {
		plugin = _plugins->get(i);
		bool canEnable = true;
		int pluginId = plugin->getUniqueId();
		{
			String state = getJsonStateFor(pluginId);
			yield();

			StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;
			JsonObject& root = jsonBuffer.parseObject(state);
			if (!root.success()) {
#ifdef LOG
				LOG << "Failed to parse config for " << String(plugin->getUniqueId()) << endl;
#endif
			}
			else {
				bool isDisabled = root["off"];
				if (isDisabled) {
					canEnable = false;
				}
			}

			if (canEnable) {
				canEnable = plugin->init(_thremContext, root);
			}
		}



		meta = _pluginMeta->get(i);
		meta->isEnabled = canEnable;
#ifdef LOG
		LOG << String(plugin->getName()) << " enabled=" << canEnable << endl;
#endif
		_pluginMeta->set(i, meta);

		yield();
	}
#ifdef DEBUG
	DEBUG << "Plugins declared: " << _plugins->size() << endl;
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

	server->begin();
#ifdef DEBUG
	DEBUG << "Web server started." << endl;
#endif
}


void Threm::loop() {

	// #ifdef DEBUG
	// DEBUG << "Threm::loop" << endl;
	// #endif

	_thremContext->beforeLoop();

	IThremPlugin*plugin;
	PluginMeta* meta;

	for (int i = 0; i < _plugins->size(); i++) {
		plugin = _plugins->get(i);
		meta = _pluginMeta->get(i);
		if (meta->isEnabled) {
			plugin->readData(_thremContext);
		}
	}
	yield();
	LinkedList < ThremNotification* >* notifications = _thremContext->getNotifications();

	for (int i = 0; i < _plugins->size(); i++) {
		plugin = _plugins->get(i);
		meta = _pluginMeta->get(i);
		if (meta->isEnabled) {
			for (int n = 0; n < notifications->size(); n++) {
				plugin->writeData(notifications->get(n));
			}
		}
	}
	yield();

	_thremContext->afterLoop();

	ESP8266WebServer* server = _thremContext->getServer();
	server->handleClient();
}

String Threm::getJsonStateFor(int id) {
#ifdef DEBUG
	DEBUG << "getJsonStateFor: " << id << "." << endl;
#endif
	String content = "{\"off\":0}";

	String configLocation = "/config/";
	configLocation += id;
	configLocation += ".json";

	if (SPIFFS.exists(configLocation)) {
		File file = SPIFFS.open(configLocation, "r");
		content = file.readString();
#ifdef LOG
	}
	else {
		LOG << "Config not found at " << configLocation << endl;
#endif
	}
	String result;

	{
#ifdef DEBUG
		DEBUG << "Start parsing" << endl;
#endif
		StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;
		JsonObject& root = jsonBuffer.parseObject(content);

		if (!root.success()) {
#ifdef LOG
			LOG << "Parse failure:  " << configLocation << endl;
			LOG << content << endl;
#endif
		}
		else {
			IThremPlugin* plugin = getPluginById(id);
#ifdef DEBUG
			DEBUG << "Finalizing config: " << plugin->getName() << endl;
#endif

			plugin->finalizeConfig(root);
		}
		root.prettyPrintTo(result);
	}
	return result;
}

void Threm::setJsonStateFor(int id, String data) {
	String filename = "/config/" + String(id) + ".json";
#ifdef LOG
	LOG << "store json state in: " << filename << endl;
#endif
	File configFile = SPIFFS.open(filename, "w");
	configFile.write((uint8_t*)data.c_str(), data.length());
	configFile.close();
}

String Threm::getJsonState() {
	String result = "[";

	IThremPlugin* plugin;
	PluginMeta* meta;
	for (int i = 0; i < _plugins->size(); i++) {
		plugin = _plugins->get(i);
		meta = _pluginMeta->get(i);
		if (i > 0) result += ",";
		result += "{\"id\":\"" + String(plugin->getUniqueId());
		result += "\",\"name\":\"" + String(plugin->getName());
		result += "\",\"running\":\"" + String(meta->isEnabled);
		result += "\",\"config\":" + getJsonStateFor(plugin->getUniqueId());
		result += "}";
	}

	result += "]";
	return result;
}

IThremPlugin* Threm::getPluginById(int id) {
#ifdef DEBUG
	DEBUG << "getPluginById: " << String(id) << endl;
#endif

	IThremPlugin* plugin;
	for (int i = 0; i < _plugins->size(); i++) {
		plugin = _plugins->get(i);
		if (plugin->getUniqueId() == id) {
#ifdef DEBUG
			DEBUG << "found: " << String(plugin->getName()) << endl;
#endif
			return plugin;
		}
	}

#ifdef LOG
	LOG << "plugin not found: " << String(id) << endl;
#endif
	return 0;
}