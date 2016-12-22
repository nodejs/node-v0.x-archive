

## class https.Agent


An `Agent` object for HTTPS, similar to [[http.Agent `http.Agent`]]. For more information, see [[https.request `https.request()`]].


 


## https.Agent.maxSockets -> Number

Determines how many concurrent sockets the agent can have open per host. By default, this is set to 5. 




## https.Agent.sockets -> Array

An object which contains arrays of sockets currently in use by the Agent. **Don't modify this!**

 