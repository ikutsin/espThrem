call path.bat
:: pio -f -c atom serialports monitor --port COM19 --baud 115200 --parity N --filter default --eol CRLF > out.txt
pio -f -c atom serialports monitor --port COM19 --baud 115200 --parity N --filter default > out.txt
