
## class timer

The timer functions are useful for scheduling functions to run after a defined amount of time. All of the objects in this class are global; the method calls don't need to be prepended with an object name.

It's important to note that your callback probably *won't* be called in exactly `delay` milliseconds. Node.js makes no guarantees about the exact timing of when the callback is fired, nor of the ordering things will fire in. The callback is called as close as possible to the time specified.

The difference between ``setInterval()` and `setTimeout()` is simple: `setTimeout()` executes a function after a certain period of time, while `setInterval()` executes a function, then after a set period of time, executes the function again, then waits again, and executes again. This continues until `clearInterval()` is called.


#### Example: The Wrong Way to use Timers

		for (var i = 0; i < 5; i++) {
		   setTimeout(function () {
		     console.log(i);
		   }, i);
		 }

The code above prints the number `5` five times. This happens because the loop fills up before the first `setTimeout()` is called.

#### Example: The Right Way to use Timers

The solution to the above problem is to create a [closure](http://stackoverflow.com/questions/1801957/what-exactly-does-closure-refer-to-in-javascript) so that the current value of `i` is stored:

     for (var i = 0; i < 5; i++) {
       (
           function(i) {
               setTimeout(function () {
                   console.log(i);
                }, i);
            }
        )(i)};






## timer.clearInterval(intervalId) -> Void
- intervalId (Number):  The id of the interval

Stops a interval from triggering. 


 



## timer.clearTimeout(timeoutId) -> Void
- timeoutId (Number):  The id of the timeout

Prevents a timeout from triggering.

 



## timer.setInterval(callback(), delay [, arg...]) -> Void
- callback (Function):  The callback function to execute
- delay (Number):  The delay (in milliseconds) before executing the callback
- arg (Object): Any optional arguments to pass the to callback

This schedules the repeated execution of a callback function after a defined delay. It returns an `intervalId` for possible use with `clearInterval()`. Optionally, you can also pass arguments to the callback.


#### Example
		var interval_count = 0;

		// Set an interval for one second, twice;
		// on the third second, break out
		setInterval(function(param) {
		  ++interval_count;

		  if (interval_count == 3)
		    clearInterval(this);
		}, 1000, 'test param');

 



##  timer.setTimeout(callback(), delay [, arg...]) -> Void
- callback (Function):  The callback function to execute
- delay (Number):  The delay (in milliseconds) before executing the callback
- arg (Object): Any optional arguments to pass the to callback

This function schedules the execution of a one-time callback function after a defined delay, It returns a `timeoutId`, which can be used later with `clearTimeout()`. Optionally, you can also pass arguments to the callback. 


 