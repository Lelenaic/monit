## Environment variables

- PROJECT_NAME : The docker-compose project name
- COMPOSE_FILE_NAME : The docker-compose.yml file name if different from default
- SOCKET_URL : The master server Websocket url, optional if serverless
- SLACK_WEBHOOK : The slack webhook to be notified from downtimes
- SLACK_CHANEL : The slack chanel name where you want the info
- SERVICE_AUTORESTART : If set to "true", monitoring agent will start the service if it is stopped