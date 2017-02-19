#ifndef FILE_SPIFFS_PLUGIN_SEEN
#define FILE_SPIFFS_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <ESP8266WiFi.h>
#include <FS.h>

class ThremSpiffsPlugin : public IThremPlugin {

	String getContentType(String filename);

	virtual int getUniqueId()
	{
		return 6;
	}
	virtual String getName()
	{
		return "Spiffs";
	}

	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremSpiffsPlugin init" << endl;
#endif

		if (!SPIFFS.begin()) {
#ifdef LOG
			LOG << "SPIFFS failed to begin" << endl;
			return false;
#endif
		}

		ESP8266WebServer* server = context->getServer();

		server->on("/list", HTTP_GET, [=]() {
			if (!server->hasArg("dir")) {
				server->send(500, "text/plain", "BAD ARGS (dir)");
				return;
			}

			String path = server->arg("dir");
#ifdef LOG
			LOG << "handleFileList: " << path << endl;
#endif

			Dir dir = SPIFFS.openDir(path);
			path = String();

			String output = "[";
			while (dir.next()) {
				File entry = dir.openFile("r");
				if (output != "[") output += ',';
				bool isDir = false;
				output += "{\"type\":\"";
				output += (isDir) ? "dir" : "file";
				output += "\",\"name\":\"";
				output += String(entry.name());
				output += "\",\"size\":";
				output += entry.size();
				output += "}";
				entry.close();
			}

			output += "]";
			server->send(200, "text/json", output);
		});

		return true;
	}

	virtual bool handleNotFound(ThremContext* context, String uri) {
#ifdef LOG
		LOG << "handleFileRead: " << uri << endl;
#endif
		ESP8266WebServer* server = context->getServer();

		if (uri.endsWith("/")) uri += "index.html";
		String contentType = getContentType(uri);
		String pathWithGz = uri + ".gz";
		if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(uri)) {
			if (SPIFFS.exists(pathWithGz))
				uri += ".gz";
			File file = SPIFFS.open(uri, "r");
			size_t sent = server->streamFile(file, contentType);
			file.close();
			return true;
		}
		return false;
	}
};


#endif /* !FILE_DIAGPLUGIN_SEEN */
