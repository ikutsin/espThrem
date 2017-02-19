call path.bat

xtensa-lx106-elf-addr2line.exe -aipfC -e device\.pioenvs\esp12e\firmware.elf 
::xtensa-lx106-elf-addr2line.exe -aipfC -e device\.pioenvs\esp01_1m\firmware.elf 

::xtensa-lx106-elf-addr2line.exe -e device\.pioenvs\esp01_1m\firmware.elf 
::xtensa-lx106-elf-objdump.exe -S device\.pioenvs\esp01_1m\firmware.elf 