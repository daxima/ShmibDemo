@echo off
rem To download all log files, use the command below.
rem Or you can downloan individual file by giving a file name
rem
rem [List of log file names]
rem **Note: These files has rotating file number in the name and they can be large, 50+MB.
rem shmib-error-0.log
rem shmib-out-0.log

pscp shmib@10.1.10.7:/home/shmib/.pm2/logs/shmib*.log ./download