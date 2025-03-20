#ifndef MEMORY_H
#define MEMORY_H
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <TlHelp32.h>

namespace nxx {

class Memory {
public:
  Memory();
  ~Memory();

  template <class dataType>
  static dataType readMemory(HANDLE hProcess, DWORD64 address);

  static BOOL readBuffer(HANDLE hProcess, DWORD64 address, SIZE_T size, char* dstBuffer);

  static char readChar(HANDLE hProcess, DWORD64 address);

  template <class dataType>
  static BOOL writeMemory(HANDLE hProcess, DWORD64 address, dataType value);

  // Write String, Method 2: get pointer and length from Utf8Value directly
  static BOOL writeMemory(HANDLE hProcess, DWORD64 address, char* value, SIZE_T size);
};

} // namespace nxx

#endif
