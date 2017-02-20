#include "ThremContext.h"

void ThremContext::beforeLoop() {
//#ifdef DEBUG
//	DEBUG << "ThremContext::beforeLoop " << _notifications->size() << " " << endl;
//#endif
}

void ThremContext::afterLoop() {
#ifdef DEBUG
	DEBUG << "ThremContext::afterLoop " << _notifications->size() << " " << endl;
	DEBUG << "Free heap " << ESP.getFreeHeap() << endl;
#endif

#ifdef LOG
	int32_t freeheap = ESP.getFreeHeap();
	if(freeheap<10*1000) {
		LOG << "Heap size " << freeheap << endl;
	}
#endif
	while (_notifications->size()>0)
	{
		ThremNotification* input = _notifications->pop();
		delete input;
	}
}
