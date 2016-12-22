
## class dgram

A datagram socket is a type of connectionless Internet socket, for the sending or receiving point for packet delivery services. Datagram sockets are available in Node.js by adding `require('dgram')` to your code.

#### Some Notes About UDP Datagram Size

The maximum size of an `IPv4/v6` datagram depends on the `MTU` (_Maximum Transmission Unit_) and on the `Payload Length` field size.

The `Payload Length` field is `16 bits` wide, which means that a normal payload can't be larger than 64K octets, including internet header and data: (65,507 bytes = 65,535 − 8 bytes UDP header − 20 bytes IP header). This is generally true for loopback interfaces, but such long datagrams are impractical for most hosts and networks.

The `MTU` is the largest size a given link layer technology can support for datagrams. For any link, IPv4 mandates a minimum `MTU` of `68` octets, while the recommended `MTU` for IPv4 is `576` (typically recommended as the `MTU` for dial-up type applications), whether they arrive whole or in fragments.

For `IPv6`, the minimum `MTU` is `1280` octets; however, the mandatory minimum fragment reassembly buffer size is `1500` octets. The value of `68` octets is very small, since most current link layer technologies have a minimum `MTU` of `1500` (like Ethernet).

<Note>It's impossible to know in advance the MTU of each link through which a packet might travel, and that generally sending a datagram greater than the (receiver) `MTU` won't work (the packet gets silently dropped, without informing the source that the data did not reach its intended recipient).</Note>

#### Example
		
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/dgram/dgram.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## dgram@message(msg, rinfo)
- msg (Buffer): A `Buffer` of information
- rinfo (Object): An object with the sender's address information and the number of bytes in the datagram. 

Emitted when a new datagram is available on a socket. 


 



## dgram@listening()

Emitted when a socket starts listening for datagrams. This happens as soon as UDP sockets are created.

 


## dgram@close()

Emitted when a socket is closed with [[dgram.close `dgramclose()`]].  No new `message` events are emitted on this socket.

 


## dgram@error(exception)
- exception (Error): The error that was encountered

Emitted when an error occurs.

 


## dgram.createSocket(type, [callback()]) -> dgram
- type (String):  The type of socket to create; valid types are `udp4` and `udp6`
- callback (Function): A callback that's added as a listener for `message` events

Creates a datagram socket of the specified types.

If you want to receive datagrams, call `socket.bind()`. `socket.bind()` binds to the "all interfaces" address on a random port (it does the right thing for both `udp4` and `udp6` sockets). You can then retrieve the address and port with `socket.address().address` and `socket.address().port`.


 


## dgram.send(buf, offset, length, port, address, [callback(err)]) -> Void
- buf (Buffer): The data buffer to send
- offset (Number):  Indicates where in the buffer to start at
- length (Number):  Indicates how much of the buffer to use
- port (Number):  The port to send to
- address (String):  The address to send to
- callback (Function): The callback to execute once the method completes that may be used to detect any DNS errors and when `buf` may be reused
- err (Error): The standard `Error` object 

Sends some information to a specified `address:port`. For UDP sockets, the destination port and IP address must be specified.  

A string may be supplied for the `address` parameter, and it will be resolved with DNS. Note that DNS lookups delay the time that a send takes place, at least until the next tick.  The only way to know for sure that a send has taken place
is to use the callback.

If the socket has not been previously bound with a call to [[dgram.bind `dgram.bind()`]], it's assigned a random port number and bound to the "all interfaces" address (0.0.0.0 for `udp4` sockets, ::0 for `udp6` sockets).

#### Example: Sending a UDP packet to a random port on `localhost`;

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/dgram/dgram.send.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## dgram.bind(port [, address]) -> Void
- port (Number): The port to bind to
- address (String): The address to attach to

For UDP sockets, listen for datagrams on a named `port` and optional `address`. If `address` isn't specified, the OS tries to listen on all addresses.

#### Example: A UDP server listening on port 41234:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/dgram/dgram.bind.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## dgram.close() -> Void

Close the underlying socket and stop listening for data on it.
 



## dgram.address() -> Object

Returns an object containing the address information for a socket.  For UDP sockets, this object contains the properties `address` and `port`.

 



## dgram.setBroadcast(flag) -> Void
- flag (Boolean): The value of `SO_BROADCAST`

Sets or clears the `SO_BROADCAST` socket option.  When this option is set to `true`, UDP packets may be sent to a local interface's broadcast address.



 



## dgram.setTTL(ttl) -> Void
- ttl (Number): The value of `IP_TTL`

Sets the `IP_TTL` socket option. TTL stands for "Time to Live," but in this context it specifies the number of IP hops that a packet is allowed to go through. Each router or gateway that forwards a packet decrements the TTL.  If the TTL is decremented to 0 by a router, it will not be forwarded.  Changing TTL values is typically done for network probes or when multicasting.

The argument to `setTTL()` is a number of hops between 1 and 255.  The default on most systems is 64.


 



## dgram.setMulticastTTL(ttl) -> Void
- ttl (Number): The value of `IP_MULTICAST_TTL` 

Sets the `IP_MULTICAST_TTL` socket option.  TTL stands for "Time to Live," but in this context it specifies the number of IP hops that a packet is allowed to go through, specifically for multicast traffic.  Each router or gateway that forwards a packet decrements the TTL. If the TTL is decremented to 0 by a router, it will not be forwarded.

The argument to `setMulticastTTL()` is a number of hops between 0 and 255.  The default on most systems is 64.


 



## dgram.setMulticastLoopback(flag) -> Void
- flag (Boolean):  The value of `IP_MULTICAST_LOOP`

Sets or clears the `IP_MULTICAST_LOOP` socket option.  When this option is `true`, multicast packets will also be received on the local interface.


 



## dgram.addMembership(multicastAddress [, multicastInterface]) -> Void
- multicastAddress (String): The address to add
- multicastInterface (String): The interface to use

Tells the kernel to join a multicast group with the `IP_ADD_MEMBERSHIP` socket option.

If `multicastInterface` is not specified, the OS will try to add membership to all valid interfaces.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/dgram/dgram.addMembership.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## dgram.dropMembership(multicastAddress [, multicastInterface])
- multicastAddress (String): The address to drop
- multicastInterface (String): The interface to use

The opposite of `addMembership`&mdash;this tells the kernel to leave a multicast group with `IP_DROP_MEMBERSHIP` socket option. This is automatically called by the kernel when the socket is closed or process terminates, so most apps will never need to call this.

If `multicastInterface` is not specified, the OS will try to drop membership to all valid interfaces.

 

