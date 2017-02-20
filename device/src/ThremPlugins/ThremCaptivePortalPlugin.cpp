#include "ThremCaptivePortalPlugin.h"

void ThremCaptivePortalPlugin::handle204() {
#ifdef LOG
	LOG << "204 No Response" << endl;
#endif
	server->sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	server->sendHeader("Pragma", "no-cache");
	server->sendHeader("Expires", "-1");
	server->send(204, "text/plain", "");
}

void ThremCaptivePortalPlugin::handleRedirect() {
#ifdef LOG
	LOG << "301 redirect" << endl;
#endif
	//TODO: add ap adress
	server->sendHeader("Location", "/");
	server->send(301, "text/plain", "");
}

/** Redirect to captive portal if we got a request for another domain. Return true in that case so the page handler do not try to handle the request again. */
bool ThremCaptivePortalPlugin::captivePortal() {
	if (!isIp(server->hostHeader())) {
#ifdef LOG
		LOG << "Request redirected to captive portal " << server->hostHeader() << endl;
#endif
		server->sendHeader("Location", String("http://") + toStringIp(server->client().localIP()), true);
		server->send(302, "text/plain", ""); // Empty content inhibits Content-length header so we have to close the socket ourselves.
		server->client().stop(); // Stop is needed because we sent no content length
		return true;
	}
	return false;
}

/** Is this an IP? */
boolean ThremCaptivePortalPlugin::isIp(String str) {
	for (int i = 0; i < str.length(); i++) {
		int c = str.charAt(i);
		if (c != '.' && (c < '0' || c > '9')) {
			return false;
		}
	}
	return true;
}

/** IP to String? */
String ThremCaptivePortalPlugin::toStringIp(IPAddress ip) {
	String res = "";
	for (int i = 0; i < 3; i++) {
		res += String((ip >> (8 * i)) & 0xFF) + ".";
	}
	res += String(((ip >> 8 * 3)) & 0xFF);
	return res;
}
