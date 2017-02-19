#ifndef FILE_WEBSOCKET_PLUGIN_SEEN
#define FILE_WEBSOCKET_PLUGIN_SEEN

#include "IThremPlugin.h"
#include "Streaming.h"

#include "WebSocketsServer.h"

WebSocketsServer webSocket = WebSocketsServer(81);
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght)
{
	switch (type)
	{
	case WStype_DISCONNECTED:
#ifdef LOG
		LOG.printf("[%u] Disconnected!\n", num);
#endif
		break;

	case WStype_CONNECTED:
	{
		IPAddress ip = webSocket.remoteIP(num);
#ifdef LOG
		LOG.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
#endif
		// send message to client
		webSocket.sendTXT(num, "Connected");
	}
	break;

	case WStype_TEXT:
#ifdef LOG
		LOG.printf("[%u] get Text: %s\n", num, payload);
#endif
		// send message to client
		// webSocket.sendTXT(num, "message here");

		// send data to all connected clients
		// webSocket.broadcastTXT("message here");
		break;

	case WStype_BIN:
#ifdef LOG
		LOG.printf("[%u] get binary lenght: %u\n", num, lenght);
#endif
		hexdump(payload, lenght);

		// send message to client
		// webSocket.sendBIN(num, payload, lenght);
		break;
	}
}

class ThremWebSocketPlugin : public IThremPlugin {
	virtual bool init(ThremContext* context, JsonObject& root)
	{
#ifdef LOG
		LOG << "ThremWebSocketPlugin init" << endl;
#endif

		if (WiFi.getMode() != WIFI_STA || !WiFi.status() == WL_CONNECTED)
		{
			return false;
		}

		webSocket.begin();
		webSocket.onEvent(webSocketEvent);

		return true;
	}

	virtual int getUniqueId()
	{
		return 13;
	}
	virtual String getName()
	{
		return "WebSocket";
	}

	virtual void readData(ThremContext* context)
	{
		yield();
		webSocket.loop();
	}
	virtual void writeData(ThremNotification* notification)
	{
		yield();
		String data = notification->toJson();
		webSocket.broadcastTXT(data);
	}
};


#endif /* !FILE_WEBSOCKET_PLUGIN_SEEN */
