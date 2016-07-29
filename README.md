# Herbert

Herbert is the server-side back-end for Petra and ProTube, which are both narrowcasting-related tools used by Study Association Proto.

**Herbert is not yet finished! A lot of functionality is still missing, including authentication-related functionality and basic communication with Petra. Herbert is not ready to be used in a production environment.**

## Configuration

Herbert requires a .env file with some basic environment configuration.

```
YOUTUBE_API_KEY=api key for YouTube
YOUTUBE_MAX_DURATION=maximum duration of Youtube videos to be added to Protube queue, in seconds.
REMOTE_TIMEOUT=maximum duration of Protube remote session, in seconds.
PIN_IP=0.0.0.0
```