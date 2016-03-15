#include "ThremContext.h"

void ThremContext::beforeLoop() {
  #ifdef DEBUG
  DEBUG << "ThremContext::beforeLoop " << _notifications->size() << " " << endl;
  #endif
}

void ThremContext::afterLoop() {
  #ifdef DEBUG
  DEBUG << "ThremContext::afterLoop " << _notifications->size() << " " << endl;
  DEBUG << "Free heap" << ESP.getFreeHeap() << endl;
  #endif

  _notifications->clear();
  
  #ifdef DEBUG
  DEBUG << "Freed heap" << ESP.getFreeHeap() << endl;
  #endif
}
