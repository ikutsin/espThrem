#ifndef FILE_CAPTIVEPORTAL_PLUGIN_SEEN
#define FILE_CAPTIVEPORTAL_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include <DNSServer.h>

class ThremCaptivePortalPlugin : public IThremPlugin {
	DNSServer* dnsServer;
	ESP8266WebServer* server;

	void handle204();
	void handleRedirect();
	bool captivePortal();

	//helpers
	boolean isIp(String str);
	String toStringIp(IPAddress ip);

	virtual int getUniqueId()
	{
		return 3;
	}
	virtual char* getName()
	{
		return "CaptivePortal";
	}

	virtual bool init(ThremContext* context)
	{
#ifdef LOG
		LOG << "ThremCaptivePortalPlugin init" << endl;
#endif

		if (WiFi.status() == WL_CONNECTED)
		{
			return false;
		}
#ifdef LOG
		LOG << "Switching to captive portal" << endl;
#endif

		WiFi.mode(WIFI_AP);

		dnsServer = new DNSServer();
		dnsServer->setErrorReplyCode(DNSReplyCode::NoError);
		dnsServer->start(53, "*", WiFi.softAPIP());

		server = context->getServer();

		server->on("/generate_204", std::bind(&ThremCaptivePortalPlugin::handle204, this));  //Android/Chrome OS captive portal check.
		server->on("/fwlink", std::bind(&ThremCaptivePortalPlugin::handleRedirect, this));  //Android/Chrome OS captive portal check.

#ifdef LOG
		LOG << "Root and notfound are bound to captive portal" << endl;
#endif
		return true;
	}
	virtual void readData(ThremContext* context)
	{
		dnsServer->processNextRequest();
	}
	virtual void writeData(ThremNotification* notification)
	{
	}

	virtual bool handleNotFound(ThremContext* context, String uri) {
		if (captivePortal()) { // If caprive portal redirect instead of displaying the page.
			return true;
		}
		return false;
	}
};
#endif /* !FILE_DIAGPLUGIN_SEEN */
