#ifndef PROCESS_H
#define PROCESS_H
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <TlHelp32.h>
#include <vector>

namespace nxx {

class Process {
public:
  struct Pair {
    HANDLE handle;
    PROCESSENTRY32 process;
  };

  Process();
  ~Process();

  static Pair openProcess(const char* processName, char** errorMessage);
  static Pair openProcess(DWORD processId, char** errorMessage);
  static std::vector<PROCESSENTRY32> getProcesses(char** errorMessage);
};

} // namepace nxx

#endif
