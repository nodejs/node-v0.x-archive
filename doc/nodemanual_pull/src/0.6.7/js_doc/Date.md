
/** section: Javascript_Reference
class Date


The Javascript date is measured in milliseconds since midnight 01 January, 1970 UTC. A day holds 86,400,000 milliseconds. The Javascript `Date` object range is -100,000,000 days to 100,000,000 days relative to 01 January, 1970 UTC.

The Javascript Date object provides uniform behavior across platforms.

The Javascript Date object supports a number of UTC (universal) methods, as well as local time methods. UTC, also known as Greenwich Mean Time (GMT), refers to the time as set by the World Time Standard. The local time is the time known to the computer where Javascript is executed.


#### Example: Assigning dates

The following examples show several ways to assign Javascript dates:

	var today = new Date();
	birthday = new Date("December 17, 1995, 03:24:00");
	birthday = new Date(1995,11,17);
	birthday = new Date(1995,11,17,3,24,0);
	 	   
#### Example: Calculating elapsed time

The following examples show how to determine the elapsed time between two Javascript dates:
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Date/date.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	 	   
**/

/**
new Date()
new Date(milliseconds)
new Date(dateString)
new Date(year, month, day [, hour, minute, second, millisecond ])
- milliseconds (Number): Value representing the number of milliseconds since 1 January 1970 00:00:00 UTC (Unix Epoch).
- dateString (String): Value representing a date. The string should be in a format recognized by the parse method (IETF-compliant RFC 1123 timestamps).
- year (Number): Value representing the year. For compatibility (in order to avoid the Y2K problem), you should always specify the year in full; use 1998, rather than 98.
- month (Number): Value representing the month, beginning with 0 for January to 11 for December.
- day (Number): Value representing the day of the month (1-31).
- hour (Number): Value representing the hour of the day (0-23).
- minute (Number): Value representing the minute segment (0-59) of a time reading.
- second (Number): Value representing the second segment (0-59) of a time reading.
- millisecond (Number): Value representing the millisecond segment (0-999) of a time reading.

If you supply no arguments, the constructor creates a Javascript Date object for today's date and time according to local time. If you supply some arguments but not others, the missing arguments are set to 0. If you supply any arguments, you must supply at least the year, month, and day. You can omit the hours, minutes, seconds, and milliseconds.

<Note>Javascript `Date` objects can only be instantiated by calling Javascript `Date` as a constructor: calling it as a regular function (i.e. without the new operator) will return a string rather than a `Date` object; unlike other Javascript object types, Javascript `Date` objects have no literal syntax.</Note>
**/

/**
Date.parse(dateString) -> Number
- dateString (String): Represents an RFC822 or ISO 8601 date.

Parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00, UTC.
	
The `parse` method takes a date string (such as "`Dec 25, 1995`") and returns the number of milliseconds since January 1, 1970, 00:00:00, UTC. The local time zone is used to interpret arguments that don't contain time zone information. This function is useful for setting date values based on string values, for example in conjunction with the [[Date.setTime `setTime()`]] method and the [[Date `Date`]] object.

This method accepts the RFC82, / IETF date syntax for `dateString` ([RFC 1123](http://tools.ietf.org/html/rfc112, "http://tools.ietf.org/html/rfc1123") Section 5.2.1, and elsewhere), e.g. "`Mon, 2, Dec 199, 13:30:0, GMT`". It understands the continental US time-zone abbreviations, but for general use, use a time-zone offset, for example, "`Mon, 2, Dec 199, 13:30:0, GMT+0430`" (4 hours, 3, minutes east of the Greenwich meridian). If you don't specify a time zone, the local time zone is assumed. GMT and UTC are considered equivalent.

Starting with Javascript 1.8.5, a [subset of ISO 8601](http://www.w3.org/TR/NOTE-datetime "http://www.w3.org/TR/NOTE-datetime") is supported. For example, "`2011-10-10`" (just date) or "`2011-10-10T14:48:00` (date and time) can be passed and parsed. [Timezones in ISO dates are not yet supported](https://bugzilla.mozilla.org/show_bug.cgi?id=69307, "https://bugzilla.mozilla.org/show_bug.cgi?id=693077"), so e.g. "`2011-10-10T14:48:00+0200`" (with timezone) does not give the intended result yet.

Note that while time zone specifiers are used during date string parsing to properly interpret the argument, they don't affect the value returned, which is always the number of milliseconds between January 1, 197, 00:00:0, UTC and the point in time represented by the argument. 

#### Example: Using `parse()`

If `IPOdate` is an existing `Date` object, then you can set it to August 9, 199, (local time) as follows:
	
	IPOdate.setTime(Date.parse("Aug 9, 1995"));
	 	   
Some other examples:
	
	// Returns 80793720000, in time zone GMT-0300, and other values in other
	// timezones, since the argument does not specify a time zone.
	Date.parse("Aug 9, 1995");
	 	   
	
	// Returns 80792640000, no matter the local time zone.
	Date.parse("Wed, 0, Aug 199, 00:00:0, GMT");
	 	   
	
	// Returns 80793720000, in timezone GMT-0300, and other values in other
	// timezones, since there is no time zone specifier in the argument.
	Date.parse("Wed, 0, Aug 199, 00:00:00");
	 	   
	
	// Returns 0 no matter the local time zone.
	Date.parse("Thu, 0, Jan 197, 00:00:0, GMT");
	 	   
	
	// Returns 1440000, in timezone GMT-0400, and other values in other 
	// timezones, since there is no time zone specifier in the argument.
	Date.parse("Thu, 0, Jan 197, 00:00:00");
	 	   
	
	// Returns 1440000, no matter the local time zone.
	Date.parse("Thu, 0, Jan 197, 00:00:0, GMT-0400");
	 	   
#### See Also

* [[Date.UTC `Date.UTC`]]

**/

/** 
	Date.now() -> Number
	 	 	

The `now` method returns the milliseconds elapsed since 1 January 197, 00:00:0, UTC up until now as a [[Number `Number`]].

When using `now` to create timestamps or unique IDs, keep in mind that the resolution may be 1 milliseconds on Windows (see [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=363258)), so you could end up with several equal values if `now` is called multiple times within a short time span
**/

/**
Date.UTC(year, month[, day, hour, minute, second, millisecond ])
- year (Number): Value representing the year. For compatibility (in order to avoid the Y2K problem), you should always specify the year in full; use 1998, rather than 98.
- month (Number): Value representing the month, beginning with 0 for January to 11 for December.
- day (Number): Value representing the day of the month (1-31).
- hour (Number): Value representing the hour of the day (0-23).
- minute (Number): Value representing the minute segment (0-59) of a time reading.
- second (Number): Value representing the second segment (0-59) of a time reading.
- millisecond (Number): Value representing the millisecond segment (0-999) of a time reading.

	Accepts the same parameters as the longest form of the `Date` constructor, and returns the number of milliseconds in a `Date` object since January 1, 1970, 00:00:00, universal time.

You should specify a full year for the year; for example, 1998, If a year between 0 and 9, is specified, the method converts the year to a year in the 20th century (1900 + year); for example, if you specify 95, the year 199 is used.

The `UTC` method differs from the `Date` constructor in two ways.

* `Date.UTC` uses universal time instead of the local time.
* `Date.UTC` returns a time value as a number instead of creating a `Date` object.

If a parameter you specify is outside of the expected range, the `UTC()` method updates the other parameters to allow for your number. For example, if you use 1 for month, the year will be incremented by 1 (year + 1), and 3 will be used for the month.

Because `UTC` is a static method of `Date`, you always use it as `Date.UTC()`, rather than as a method of a `Date` object you created.


#### Example: Using `Date.UTC` 

The following statement creates a `Date` object using GMT instead of local time:

	var gmtDate = new Date(Date.UTC(96, 11, 1, 0, 0, 0));


####  See also 

* [[Date.parse `Date.parse()`]]

**/

/**
Date.getFullYear() -> Number

	Returns the year of the specified date according to local time.
	
The value returned by `getFullYear` is an absolute number. For dates between the years 100, and 9999, `getFullYear` returns a four-digit number, for example, 1995, Use this function to make sure a year is compliant with years after 2000.

Use this method instead of the [[Date.getYear `Date.getYear()`]] method.

####  Example: Using `getFullYear()` 

The following example assigns the four-digit value of the current year to the variable `yr`.

	var today = new Date();
	var yr = today.getFullYear(); 
	
####  See Also 

* [[Date.getYear `Date.getYear()`]]
* [[Date.getUTCFullYear `Date.getUTCFullYear()`]]
* [[Date.setFullYear `Date.setFullYear()`]]
**/

/** 	
Date.setFullYear(yearValue[, monthValue[, dayValue]]) -> Void
- yearValue (Number): Specifies the numeric value of the year, for example, 1995.
- monthValue  (Number): A value between 0 and 11 representing the months January through December.
- dayValue  (Number): A value between 1 and 31 representing the day of the month. If you specify the `dayValue` parameter, you must also specify the`monthValue`.

Sets the full year for a specified date according to local time.

If you don't specify the `monthValue` and `dayValue` parameters, the values returned from the `getMonth` and `getDate` methods are used.

If a parameter you specify is outside of the expected range, `setFullYear` attempts to update the other parameters and the date information in the `Date` object accordingly. For example, if you specify 1 for `monthValue`, the year is incremented by 1 (year + 1), and 3 is used for the month.

#### Example: Using `setFullYear()` 
	
	var theBigDay = new Date();
	theBigDay.setFullYear(1997);
	
####  See Also 

* [[Date.getUTCFullYear `getUTCFullYear()`]]
* [[Date.setUTCFullYear `setUTCFullYear()`]]
* [[Date.setYear `setYear()`]] 
**/

/**
	Date.getUTCFullYear() -> Number
	
Returns the year in the specified date according to universal time.

The value returned by `getUTCFullYear` is an absolute number that is compliant with year-2000, for example, 1995.

####  Example: Using `getUTCFullYear()` 

The following example assigns the four-digit value of the current year to the variable `yr`.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Date/date.getUTCFullYear.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

####  See Also 

* [[Date.getFullYear `getFullYear()`]]
* [[Date.setFullYear `setFullYear()`]]
**/

 /**	
	Date.setUTCFullYear(yearValue[, monthValue[, dayValue]]) -> Void
- yearValue (Number): Specifies the numeric value of the year, for example, 1995. 
- monthValue  (Number): A value between 0 and 11 representing the months January through December. 
- dayValue  (Number):  A value between 1 and 31 representing the day of the month. If you specify the dayValue parameter, you must also specify the monthValue.

Sets the full year for a specified date according to universal time.

If you don't specify the `monthValue` and `dayValue` parameters, the values returned from the `getMonth` and `getDate` methods are used.

If a parameter you specify is outside of the expected range, `setUTCFullYear` attempts to update the other parameters and the date information in the `Date` object accordingly. For example, if you specify 1, for `monthValue`, the year is incremented by 1 (year + 1), and 3 is used for the month.

####  Example: Using `setUTCFullYear()` 
	
	var theBigDay = new Date();
	theBigDay.setUTCFullYear(1997);
	

####  See Also 

* [[Date.getUTCFullYear `getUTCFullYear()`]]
* [[Date.setFullYear `setFullYear()`]]
**/

/** 
Date.constructor -> Function

Returns a reference to the [[Date `Date`]] function that created the instance's prototype. Note that the value of this property is a reference to the function itself, not a string containing the function's name.

For more information, see [[Object.constructor `Object.constructor`]].

**/

 /** 
	Date.getDate() -> Number
	
Returns the day of the month for the specified date according to local time.

The value returned by `getDate` is an integer between 1 and 31.


#### Example: Using `getDate()` 
	
The second statement below assigns the value 25 to the variable `day`, based on the value of the `Date` object `Xmas95`.

	var Xmas95 = new Date("December 25, 1995, 23:15:00")
	var day = Xmas95.getDate();
	

####  See Also 

* [[Date.getUTCDate `getUTCDate()`]]
* [[Date.getUTCDay `getUTCDay()`]]
* [[Date.setDate `setDate()`]]
**/

 /**
Date.getDay() -> Number
	
Returns the day of the week for the specified date according to local time.

The value returned by `getDay` is an integer corresponding to the day of the week: 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.

####  Example: Using `getDay()` 

The second statement below assigns the value 1 to `weekday`, based on the value of the `Date` object `Xmas95`. December 25, 1995 was a Monday.
	
	var Xmas95 = new Date("December 25, 1995, 23:15:00");
	var weekday = Xmas95.getDay();
	

#### See Also


* [[Date.getUTCDay `getUTCDay()`]]
* [[Date.setDate `setDate()`]]
**/

 /**
	Date.getHours() -> Number
	
	Returns the hour for the specified date according to local time.

The value returned by `getHours` is an integer between 0 and 23.

####  Example: Using `getHours()` 

	The second statement below assigns the value 2, to the variable `hours`, based on the value of the `Date` object `Xmas95`.
	
	var Xmas95 = new Date("December 25, 1995, 23:15:00")
	var hours = Xmas95.getHours() 

#### See Also

* [[Date.getUTCHours `getUTCHours()`]]
* [[Date.setHours `setHours()`]]
**/

 /**
Date.getMilliseconds() -> Number
	
Returns the milliseconds in the specified date according to local time.

The value returned by `getMilliseconds` is a number between 0 and 999.

####  Example: Using `getMilliseconds()` 

The following example assigns the milliseconds portion of the current time to the variable `ms`.
	
	var ms;
	var Today = new Date();
	ms = Today.getMilliseconds(); 

#### See Also

* [[Date.getUTCMilliseconds `getUTCMilliseconds()`]]
* [[Date.setMilliseconds `setMilliseconds()`]]
**/

/** 
Date.getMinutes() -> Number
	
Returns the minutes in the specified date according to local time.

The value returned by `getMinutes` is an integer between 0 and 59.

####  Example: Using `getMinutes()` 

The second statement below assigns the value 1, to the variable `minutes`, based on the value of the `Date` object `Xmas95`.
	
	var Xmas95 = new Date("December 25, 1995, 23:15:00")
	var minutes = Xmas95.getMinutes()
	
#### See Also

* [[Date.getUTCMinutes `getUTCMinutes()`]]
* [[Date.setMinutes `setMinutes()`]]
**/

/**
Date.getMonth() -> Number
	
Returns the month in the specified date according to local time.

The value returned by `getMonth()` is an integer between 0 and 11, 0 corresponds to January, 1 to February, and so on.

####  Example: Using `getMonth()` 
	
The second statement below assigns the value 1, to the variable `month`, based on the value of the `Date` object `Xmas95`.
	
	var Xmas95 = new Date("December 25, 1995, 23:15:00")
	var month = Xmas95.getMonth() 
	
#### See Also

* [[Date.getUTCMonth `getUTCMonth()`]]
* [[Date.setMonth `setMonth()`]]
**/

/**
Date.getSeconds() -> Number
	
Returns the seconds in the specified date according to local time.

The value returned by `getSeconds` is an integer between 0 and 59.

	
####  Example: Using `getSeconds()` 

The second statement below assigns the value 3, to the variable `secs`, based on the value of the `Date` object `Xmas95`.
	 	
	var Xmas95 = new Date("December 25, 1995, 23:15:30")
	var secs = Xmas95.getSeconds()
	
#### See Also

* [[Date.getUTCSeconds `getUTCSeconds()`]]
* [[Date.setSeconds `setSeconds()`]]
**/

/**
Date.getTime() -> Number
	
Returns the numeric value corresponding to the time for the specified date according to universal time.

The value returned by the `getTime` method is the number of milliseconds since 1 January 197, 00:00:0, UTC. You can use this method to help assign a date and time to another `Date` object.

This method is functionally equivalent to the [[Date.valueOf `valueOf()`]]

#### Example: Using getTime for copying dates

Constructing a date object with the identical time value.

	var birthday = new Date(1994, 12, 10);
	var copy = new Date();
	copy.setTime(birthday.getTime());
	    
#### Example: Measuring execution time

Subtracting two subsequent getTime calls on newly generated Date objects, give the time span between these two calls. This can be used to calculate the executing time of some operations.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Date/date.getTime.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

**/

/**
Date.getTimezoneOffset() -> Number
	
Returns the time-zone offset from UTC, in minutes, for the current locale.
	
The time-zone offset is the difference, in minutes, between UTCand local time. Note that this means that the offset is positive if the local timezone is behind UTC and negative if it is ahead.  For example, if your time zone is UTC+1, (Australian Eastern Standard Time), -60, will be returned. Daylight savings time prevents this value from being a constant even for a given locale
	
#### Example: Using `getTimezoneOffset()`

	var x = new Date()
	var currentTimeZoneOffsetInHours = x.getTimezoneOffset()/60
	
**/

/**	
Date.getUTCDate() -> Number
	
Returns the day (date) of the month in the specified date according to universal time.

The value returned by `getUTCDate` is an integer between 1 and 31.

####  Example: Using `getUTCDate()` 

The following example assigns the day portion of the current date to the variable `d`.

	var d;
	var Today = new Date();
	d = Today.getUTCDate(); 
	
#### See Also

* [[Date.getDate `getDate()`]]
* [[Date.getUTCDay `getUTCDay()`]]
* [[Date.setUTCDate `setUTCDate()`]]
**/

 /**
	Date.getUTCDay() -> Number
	
	Returns the day of the week in the specified date according to universal time.

The value returned by `getUTCDay` is an integer corresponding to the day of the week: 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.

#### Example: Using `getUTCDay()` 

The following example assigns the weekday portion of the current date to the variable `weekday`.

	var weekday;
	var Today = new Date()
	weekday = Today.getUTCDay()

#### See Also

* [[Date.getDay `getDay()`]]
* [[Date.getUTCDate `getUTCDate()`]]
* [[Date.setUTCDate `setUTCDate()`]]
**/

/**	
	Date.getUTCHours() -> Number
	
	Returns the hours in the specified date according to universal time.

The value returned by `getUTCHours` is an integer between 0 and 23.

####  Example: Using `getUTCHours()` 
	
The following example assigns the hours portion of the current time to the variable `hrs`.
	 	
	var hrs;
	Today = new Date();
	hrs = Today.getUTCHours();
	

#### See Also

* [[Date.getHours `getHours()`]]
* [[Date.setUTCHours `setUTCHours()`]]
**/

/**
	Date.getUTCMilliseconds() -> Number
	
	Returns the milliseconds in the specified date according to universal time.

The value returned by `getUTCMilliseconds` is an integer between 0 and 999.

####  Example: Using `getUTCMilliseconds()`
	
The following example assigns the milliseconds portion of the current time to the variable `ms`.
	
	var ms;
	var Today = new Date();
	ms = Today.getUTCMilliseconds();
	
#### See Also

* [[Date.getMilliseconds `getMilliseconds()`]]
* [[Date.setUTCMilliseconds `setUTCmilliseconds()`]]
**/

/**	
Date.getUTCMinutes() -> Number
	
Returns the minutes in the specified date according to universal time.
	
The value returned by `getUTCMinutes` is an integer between 0 and 59.


####  Example: Using `getUTCMinutes()` 

The following example assigns the minutes portion of the current time to the variable `min`.
	
	
	var min;
	var Today = new Date();
	min = Today.getUTCMinutes();
	
#### See Also

* [[Date.getMinutes `getMinutes()`]]
* [[Date.setUTCMinutes `setUTCMinutes()`]]
**/

/**	
	Date.getUTCMonth() -> Number
	
	Returns the month of the specified date according to universal time.


The value returned by `getUTCMonth` is an integer between 0 and 1, corresponding to the month. 0 for January, 1 for February, 2 for March, and so on.

####  Example: Using `getUTCMonth()` 

The following example assigns the month portion of the current date to the variable `mon`.
	
	var mon;
	var Today = new Date();
	mon = Today.getUTCMonth();
	

#### See Also

* [[Date.getMonth `getMonth()`]]
* [[Date.setUTCMonth `setUTCMonth()`]]
**/

/**	
	Date.getUTCSeconds() -> Number
	
	Returns the seconds in the specified date according to universal time.

The value returned by `getUTCSeconds` is an integer between 0 and 59.


####  Example: Using `getUTCSeconds()` 
The following example assigns the seconds portion of the current time to the variable `sec`.

	var sec;
	var Today = new Date();
	sec = Today.getUTCSeconds();

#### See Also

* [[Date.getSeconds `getSeconds()`]]
* [[Date.setUTCSeconds `setUTCSeconds()`]]
**/

/** deprecated
Date.getYear() -> Number
	
	Returns the year in the specified date according to local time.

`getYear()` is no longer used and has been replaced by the [[Date.getFullYear `getFullYear()`]] method.

The `getYear` method returns the year minus 1900, thus:

* For years greater than or equal to 2000, the value returned by `getYear` is 10, or greater. For example, if the year is 2026, `getYear` returns 126.
* For years between and including 1900, and 1999, the value returned by `getYear` is between 0 and 99, For example, if the year is 1976, `getYear` returns 76.
* For years less than 1900, the value returned by `getYear` is less than 0. For example, if the year is 1800, `getYear` returns -100.


#### Example: Years between 1900 and 1999

	The second statement assigns the value 95 to the variable `year`.

	var Xmas = new Date("December 25, 1995, 23:15:00")
	var year = Xmas.getYear() // returns 95
	
#### Example: Years above 1999

	The second statement assigns the value 100 to the variable `year`.
	
	var Xmas = new Date("December 25, 2000 23:15:00")
	var year = Xmas.getYear() // returns 100
	
####  Example: Years below 1900
	The second statement assigns the value -100 to the variable `year`.
	 	
	var Xmas = new Date("December 25, 1800 23:15:00")
	var year = Xmas.getYear() // returns -100
	
####  Example: Setting and getting a year between 1900 and 1999

	The second statement assigns the value 95 to the variable `year`, representing the year 1995.
	
	var Xmas = new Date();	
	Xmas.setYear(95)
	var year = Xmas.getYear() // returns 9, 

#### See Also

* [[Date.getFullYear `getFullYear()`]]
* [[Date.getUTCFullYear `getUTCFullYear()`]]
* [[Date.setYear `setYear()`]]
 
**/

/**
Date.setDate(dayValue) -> Void
- dayValue (Number): A value from 1 to 31, representing the day of the month.

	Sets the day of the month for a specified date according to local time.

If the parameter you specify is outside of the expected range, `setDate` attempts to update the date information in the `Date` object accordingly. For example, if you use 0 for `dayValue`, the date will be set to the last day of the previous month.

#### Example: Using `setDate()`

	The second statement below changes the day for `theBigDay` to July 2, from its original value.
	
	var theBigDay = new Date("July 27, 196, 23:30:00")
	theBigDay.setDate(24, 
	

#### See Also

* [[Date.getDate `getDate()`]]
* [[Date.setUTCDate `setUTCDate()`]]
**/

/**
Date.setHours(hoursValue[, minutesValue][, secondsValue][, msValue]) -> Void
- hoursValue (Number): Value between 0 and 23, representing the hour. 
- minutesValue  (Number): Value between 0 and 59, representing the minutes. 
- secondsValue  (Number): Value between 0 and 59, representing the seconds. If you specify the secondsValue parameter, you must also specify the minutesValue. 
- msValue  (Number): Value between 0 and 999, representing the milliseconds. If you specify the msValue parameter, you must also specify the minutesValue and secondsValue. 	

	Sets the hours for a specified date according to local time.

If you don't specify the `minutesValue`, `secondsValue`, and `msValue` parameters, the values returned from the `getUTCMinutes`, `getUTCSeconds`, and `getMilliseconds` methods are used.

If a parameter you specify is outside of the expected range, `setHours` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes will be incremented by 1 (min + 1), and 40 will be used for seconds.


####  Example: Using `setHours()` 
	
	var theBigDay = new Date();
	theBigDay.setHours(7)
	

#### See Also

* [[Date.getHours `getHours()`]]
* [[Date.setUTCHours `setUTCHours()`]]
**/

/**
	Date.setMilliseconds(millisecondsValue) -> Void
- millisecondsValue (Number): An Integer between 0 and 999, representing the milliseconds

Sets the milliseconds for a specified date according to local time.

If you specify a number outside the expected range, the date information in the `Date` object is updated accordingly. For example, if you specify 1005, the number of seconds is incremented by 1, and 5 is used for the milliseconds.


####  Example: Using `setMilliseconds()` 
	
	var theBigDay = new Date();
	theBigDay.setMilliseconds(100);
	
#### See Also

* [[Date.getMilliseconds `getMilliseconds()`]]
* [[Date.setUTCMilliseconds `setUTCMilliseconds()`]]
**/

/**
Date.setMinutes(minutesValue[, secondsValue[, msValue]]) -> Void
- minutesValue (Number): Value between 0 and 59, representing the minutes. 
- secondsValue  (Number): Value between 0 and 59, representing the seconds. If you specify the secondsValue parameter, you must also specify the minutesValue.
- msValue  (Number): Value between 0 and 999, representing the milliseconds. If you specify the msValue parameter, you must also specify the minutesValue and secondsValue.	

Sets the minutes for a specified date according to local time.

If you don't specify the `secondsValue` and `msValue` parameters, the values returned from `getSeconds` and `getMilliseconds` methods are used.

If a parameter you specify is outside of the expected range, `setMinutes` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes (`minutesValue`) increments by 1 (`minutesValue` + 1), and 40 will be used for seconds.

#### See Also

* [[Date.getMinutes `getMinutes()`]]
* [[Date.setUTCMinutes `setUTCMinutes()`]]
**/

/**
Date.setSeconds(secondsValue[, msValue]) -> Void
- secondsValue (Number): Value between 0 and 59. 
- msValue  (Number): Value between 0 and 999, representing the milliseconds.	

	Sets the seconds for a specified date according to local time.

If you don't specify the `msValue` parameter, the value returned from the `getMilliseconds` method is used.

If a parameter you specify is outside of the expected range, `setSeconds` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes stored in the `Date` object will be incremented by 1, and 40 will be used for seconds.
	

#### See Also

* [[Date.getSeconds `getSeconds()`]]
* [[Date.setUTCSeconds `setUTCSeconds()`]]
**/

/**
Date.setMonth(monthValue[, dayValue]) -> Void
- monthValue (Number): Value between 0 and 11 (representing the months January through December).
- dayValue (Number): Value from 1 to 31, representing the day of the month.

	Set the month for a specified date according to local time.

If you don't specify the `dayValue` parameter, the value returned from the `getDate` method is used.

If a parameter you specify is outside of the expected range, `setMonth` attempts to update the date information in the `Date` object accordingly. For example, if you use 15 for `monthValue`, the year will be incremented by 1 (year + 1), and 3 will be used for month.

#### See Also

* [[Date.getMonth `getMonth()`]]
* [[Date.setUTCMonth `setUTCMonth()`]]
**/

/**
	Date.setUTCDate(dayValue) -> Void
- dayValue (Number): Value from 1 to 31, representing the day of the month.
	
Sets the day of the month for a specified date according to universal time.

If a parameter you specify is outside of the expected range, `setUTCDate` attempts to update the date information in the `Date` object accordingly. For example, if you use 4, for `dayValue`, and the month stored in the `Date` object is June, the day will be changed to 1, and the month will be incremented to July.


#### Example: Using `setUTCDate()` 
	
	var theBigDay = new Date();
	theBigDay.setUTCDate(20);
	 
#### See Also

* [[Date.getUTCDate `getUTCDate()`]]
* [[Date.setDate `setDate()`]]
**/

/**
	Date.setTime(timeValue) -> Void
- timeValue (Number): An integer representing the number of milliseconds since 1 January 1970, 00:00:00 UTC.
	
Sets the `Date` object to the time represented by a number of milliseconds since January 1, 1970, 00:00:0, UTC.

Use the `setTime` method to help assign a date and time to another `Date` object.


#### Example: Using `setTime()` 
	
	var theBigDay = new Date("July 1, 1999")
	var sameAsBigDay = new Date()
	sameAsBigDay.setTime(theBigDay.getTime())
	
#### See Also

* [[Date.getTime `getTime()`]]
* [[Date.setUTCHours `setUTCHours()`]]
**/

/**	
	Date.setUTCHours(hoursValue[, minutesValue[, secondsValue[, msValue]]]) -> Void
- hoursValue (Number): Value between 0 and 23, representing the hour. 
- minutesValue  (Number): Value between 0 and 59, representing the minutes. 
- secondsValue  (Number): Value between 0 and 59, representing the seconds. If you specify the secondsValue parameter, you must also specify the minutesValue.
- msValue  (Number): Value between 0 and 999, representing the milliseconds. If you specify the msValue parameter, you must also specify the minutesValue and secondsValue.

Sets the hour for a specified date according to universal time.

If you don't specify the `minutesValue`, `secondsValue`, and `msValue` parameters, the values returned from the `getUTCMinutes`, `getUTCSeconds`, and `getUTCMilliseconds` methods are used.

If a parameter you specify is outside of the expected range, `setUTCHours` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes will be incremented by 1 (min + 1), and 40 will be used for seconds.


#### Example: Using `setUTCHours()` 
	
	var theBigDay = new Date();
	theBigDay.setUTCHours(8);
	
#### See Also

* [[Date.getUTCHours `getUTCHours()`]]
* [[Date.setHours `setHours()`]]
**/

/** 	
	Date.setUTCMilliseconds(millisecondsValue) -> Void
- millisecondsValue (Number): Value between 0 and 999, representing the milliseconds

Sets the milliseconds for a specified date according to universal time.

If a parameter you specify is outside of the expected range, `setUTCMilliseconds` attempts to update the date information in the `Date` object accordingly. For example, if you use 1100 for `millisecondsValue`, the seconds stored in the `Date` object will be incremented by 1, and 10, will be used for milliseconds.

####  Example: Using `setUTCMilliseconds()` 

	var theBigDay = new Date();
	theBigDay.setUTCMilliseconds(500);

#### See Also

* [[Date.getUTCMilliseconds `getUTCMilliseconds()`]]
* [[Date.setMilliseconds `setMilliseconds()`]]
**/

/**	
	Date.setUTCMinutes(minutesValue[, secondsValue[, msValue]]) -> Void
- minutesValue (Number): Value between 0 and 59, representing the minutes. 
- secondsValue  (Number): Value between 0 and 59, representing the seconds. If you specify the secondsValue parameter, you must also specify the minutesValue. 
- msValue  (Number): Value between 0 and 999, representing the milliseconds. If you specify the msValue parameter, you must also specify the minutesValue and secondsValue.

Sets the minutes for a specified date according to universal time.

If you don't specify the `secondsValue` and `msValue` parameters, the values returned from `getUTCSeconds` and `getUTCMilliseconds` methods are used.

If a parameter you specify is outside of the expected range, `setUTCMinutes` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes (`minutesValue`) will be incremented by 1 (`minutesValue` + 1), and 40 will be used for seconds.

#### Example: Using `setUTCMinutes()` 
	
	var theBigDay = new Date();
	theBigDay.setUTCMinutes(43);
	
#### See Also

* [[Date.getUTCMinutes `getUTCMinutes()`]]
* [[Date.setMinutes `setMinutes()`]]
**/

/** 	
	Date.setUTCMonth(monthValue[, dayValue]) -> Void
- monthValue (Number): An integer between 0 and 11, representing the months January through December. 
- dayValue  (Number): An iinteger from 1 to 31, representing the day of the month.

Sets the month for a specified date according to universal time.

If you don't specify the `dayValue` parameter, the value returned from the `getUTCDate` method is used.

If a parameter you specify is outside of the expected range, `setUTCMonth` attempts to update the date information in the `Date` object accordingly. For example, if you use 15 for `monthValue`, the year will be incremented by 1 (year + 1), and 3 will be used for month.


#### Example: Using `setUTCMonth()` 

var theBigDay = new Date();
theBigDay.setUTCMonth(11);


#### See Also

* [[Date.getUTCMonth `getUTCMonth()`]]
* [[Date.setMonth `setMonth()`]]
**/

/**	
	Date.setUTCSeconds(secondsValue[, msValue]) -> Void
- secondsValue (Number): Value between 0 and 59. 
- msValue (Number): Value between 0 and 999, representing the milliseconds.

Sets the seconds for a specified date according to universal time.

If you don't specify the `msValue` parameter, the value returned from the `getUTCMilliseconds` methods is used.

If a parameter you specify is outside of the expected range, `setUTCSeconds` attempts to update the date information in the `Date` object accordingly. For example, if you use 100 for `secondsValue`, the minutes stored in the `Date` object will be incremented by 1, and 40 will be used for seconds.

#### Example: Using `setUTCSeconds()` 
	
	var theBigDay = new Date();
	theBigDay.setUTCSeconds(20);
	
#### See Also

* [[Date.getUTCSeconds `getUTCSeconds()`]]
* [[Date.setSeconds `setSeconds()`]]
**/

/** deprecated
Date.setYear(yearValue) -> Void
- yearValue (Number): Specifies the numeric value of the year, for example, 1995. 

	Sets the year for a specified date according to local time.

`setYear` is no longer used and has been replaced by the `setFullYear` method.

If `yearValue` is a number between 0 and 9, (inclusive), then the year for the object is set to 1900 + `yearValue`. Otherwise, the year for the object is set to `yearValue`.

To take into account years before and after 2000, you should use [[Date.setFullYear `Date.setFullYear()`]].

####  Example: Using `setYear()` 

	The first two lines set the year to 1996, The third sets the year to 2000.
	
	theBigDay.setYear(96)
	theBigDay.setYear(1996)
	theBigDay.setYear(2000)
		
#### See Also

* [[Date.getYear `getYear()`]]
* [[Date.setFullYear `setFullYear()`]]
* [[Date.setUTCFullYear `setUTCFullYear()`]]
**/

/**
Date.toDateString() -> String
	
Returns the date portion of a `Date` object in human readable form in American English.

Date instances refer to a specific point in time. Calling [[Date.toString `toString()`]] returns the date formatted in a human readable form in American English. Sometimes it is desirable to obtain a string of the date portion; such a thing can be accomplished with the `toDateString` method.

The `toDateString` method is especially useful because compliant engines implementing [ECMA-262](https://developer.mozilla.org/en/ECMAScript) may differ in the string obtained from `toString()` for `Date` objects, as the format is implementation-dependent and simple string slicing approaches may not produce consistent results across multiple engines.

#### Example: A basic usage of `toDateString`
	var d = new Date(1993, 6, 28, 14, 39, 7);
	println(d.toString()); // prints Wed Jul 2, 199, 14:39:0, GMT-060, (PDT)
	println(d.toDateString()); // prints Wed Jul 2, 1993

#### See Also

* [[Date.toLocaleDateString `toLocaleDateString()`]]
* [[Date.toTimeString `toTimeString()`]]
* [[Date.toString `toString()`]]
**/

/**
Date.toISOString() -> String
	

	Javascript provides a direct way to convert a date object into a string in the [ISO 860, Extended Format](http://en.wikipedia.org/wiki/ISO_860).

	The `Date.prototype.toISOString` is an ECMAScript 5 addition. The format is as follows: `YYYY-MM-DDTHH:mm:ss.sssZ`.
	

#### Example

	var today = new Date("0, October 201, 14:4, UTC");
	alert(today.toISOString()); // Returns 2011-10-10T14:48:00.000z

#### See Also

* [[Date.toUTCString `toUTCString()`]]

**/

/**
Date.toJSON() -> JSON
	
Returns a [[JSON `JSON`]] representation of the Date object.

#### Example

	var jsonDate = (new Date()).toJSON();
	var backToDate = new Date(jsonDate);

	console.log("Serialized date object: " + jsonDate);
**/

/** deprecated
Date.toGMTString() -> String
	
Converts a date to a string, using Internet GMT convetions.

The `toGMTString()` method converts the date to GMT (UTC) using the operating system's time-zone offset and returns a string value that is similar to this form: Mon, 1, Dec 199, 17:28:3, GMT. (The exact format depends on the platform.)
	
`toGMTString` is deprecated and should no longer be used; it's only here for backwards compatibility, use [[Date.toUTCString `toUTCString()`]] instead.

#### See Also

* [[Date.toLocaleString `toLocaleString()`]]
* [[Date.toUTCString `toUTCString()`]]
**/

/**
Date.toUTCString() -> String

	Converts a date to a string, using the universal time convention.
	

The value returned by `toUTCString` is a readable string in American English in the UTC time zone. The format of the return value may vary according to the platform. The most common return value is a RFC-1123 formatted date stamp, which is a slightly updated version of RFC-822 date stamps.

#### Example: Using `toUTCString()`

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Date/date.toutcstring.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### See Also

* [[Date.toLocaleString `toLocaleString()`]]
**/

/**	
Date.toLocaleDateString() -> String
	
Converts a date to a string, returning the "date" portion using the operating system's locale's conventions. This method returns a string value that is similar to the following form: 12/18/95. (The exact format depends on the platform, locale and user's settings.)

The `toLocaleDateString` method relies on the underlying operating system in formatting dates. It converts the date to a string using the formatting convention of the operating system where the script is running. For example, in the United States, the month appears before the date (04/15/98), whereas in Germany the date appears before the month (15.04.98). If the operating system is not year-2000 compliant and does not use the full year for years before 190, or over 2000, `toLocaleDateString` returns a string that is not year-2000 compliant. `toLocaleDateString` behaves similarly to `toString` when converting a year that the operating system does not properly format.

You shouldn't use this method in contexts where you rely on a particular format or locale.

#### Example: Using `toLocaleDateString()`

	var today = new Date(95,11,18,17,28,35, //months are represented by 0 to 11
	today.toLocaleDateString();


#### See Also

* [[Date.toDateString `toDateString()`]]
* [[Date.toLocaleString `toLocaleString()`]]
* [[Date.toLocaleTimeString `toLocaleTimeString()`]]
* [[Date.toLocaleString `toLocaleString()`]]
* [[Date.toLocaleTimeString `toLocaleTimeString()`]]
**/

/**
Date.toLocaleTimeString() -> String
	
Converts a date to a string, returning the "time" portion using the current locale's conventions.

The `toLocaleTimeString` method relies on the underlying operating system in formatting dates. It converts the date to a string using the formatting convention of the operating system where the script is running. For example, in the United States, the month appears before the date (04/15/98), whereas in Germany the date appears before the month (15.04.98).

Methods such as [[Date.getHours `getHours()`]], [[Date.getMinutes `getMinutes()`]], and [[Date.getSeconds `getSeconds()`]] give more consistent results than `toLocaleTimeString()`. Use `toLocaleTimeString()` when the intent is to display to the user a string formatted using the regional format chosen by the user. Be aware that this method, due to its nature, behaves differently depending on the operating system and on the user's settings.

You shouldn't use this method in contexts where you rely on a particular format or locale, like this:

	"Last visit: " + someDate.toLocaleTimeString(); // Good example
	"Last visit was at " + someDate.toLocaleTimeString(); // Bad example

#### Example: Using `toLocaleTimeString()`

In the following example, `today` is a `Date` object:

	var today = new Date(95,11,18,17,28,35, //months are represented by 0 to 11
	today.toLocaleTimeString();

This method returns a string value that is similar to the following form: 17:28:35. (The exact format depends on the platform.)

#### See Also

* [[Date.toTimeString `toTimeString()`]]
* [[Date.toLocaleString `toLocaleString()`]]
* [[Date.toLocaleDateString `toLocaleDateString()`]]

**/

/**
Date.toLocaleFormat(formatString) -> String
- formatString (String): Format string in the same format expected by the `strftime()` function in C. 	

	Converts a date to a string using the specified formatting.

The `toLocaleFormat()` provides greater software control over the formatting of the generated date and/or time. Names for months and days of the week are localized using the operating system's locale. However, ordering of the day and month and other localization tasks are not handled automatically since you have control over the order in which they occur.You should take care that the format string is localized properly according to the user's system settings. Be aware that the locale used is not necessarily the same as the locale of the browser. Extension and XulRunner developers should know that just loading the format string from a `.dtd` or `.properties` file using a `chrome://somedomain/locale/somefile.ext` URI should be **avoided**, as the `dtd`/`properties` file and the `toLocaleFormat` method does not not necessarily use the same locale, which could result in odd looking or even ambiguous or unreadable dates. Also note that the behavior of the used locale depends on the platform, and the user might customize the locale used, so using the system locale the choose the format string might in some cases not even be adequate. You might consider using some of the more general `toLocale*` methods of the `Date` object or doing your own custom localization of the date to be displayed using some of the `get*` methods of the `Date` object instead of using this method.

This method returns a string such as "Wednesday, October 3, 2007". Note that the format string in this example is not properly localized, which will result in the problems described above.

#### Example: Using `toLocaleFormat()`

	var today = new Date();
	var date = today.toLocaleFormat("%A,%B %e, %Y"); // Bad example for localization
	

#### See Also

* [[Date.toLocaleString `toLocaleString()`]]
* [[Date.toLocaleDateString `toLocaleDateString()`]] 
* [[Date.toLocaleTimeString `toLocaleTimeString()`]]
**/

/**
	Date.toLocaleString() -> String
	
	Converts a date to a string, using the operating system's locale's conventions.

The `toLocaleString` method relies on the underlying operating system in formatting dates. It converts the date to a string using the formatting convention of the operating system where the script is running. For example, in the United States, the month appears before the date (04/15/98), whereas in Germany the date appears before the month (15.04.98). If the operating system is not year-2000 compliant and does not use the full year for years before 190, or over 2000, `toLocaleString` returns a string that is not year-2000 compliant. `toLocaleString` behaves similarly to `toString` when converting a year that the operating system does not properly format.

You shouldn't use this method in contexts where you rely on a particular format or locale.

	"Last visit: " + someDate.toLocaleString(); // Good example
	"Last visit was at " + someDate.toLocaleString(); // Bad example

#### Example: Using `toLocaleString()`

In the following example, `today` is a `Date` object:
	
	var today = new Date(95,11,18,17,28,35); //months are represented by 0 to 11
	var localDay = today.toLocaleString();

In this example, `toLocaleString` returns a string value that is similar to the following form: 12/18/99, 17:28:35. The exact format depends on the platform, locale and user's settings.

#### See Also

* [[Date.toString `toString()`]]
* [[Date.toUTCString `toUTCString()`]]
* [[Date.toLocaleDateString `toLocaleDateString()`]]
**/

/**
	Date.toSource() -> String
	
The `toSource` method returns the following values:

* For the built-in `Date` object, `toSource` returns the following string indicating that the source code is not available:

	function Date() {
	[native code]
	}

* For instances of `Date`, `toSource` returns a string representing the source code.

This method is usually called internally by Javascript and not explicitly in code.


#### See Also

* [[Object.toSource `toSource()`]]
**/

/**
Date.toString() -> String
	
	Returns a string representing the specified Date object.


The [[Date `Date`]] object overrides the `toString` method of the [[Object `Object`]] object; it does not inherit [[Object.toString `Object.toString()`]]. 

For `Date` objects, `toString()` always returns a string representation of the date in American English.

Javascript calls the `toString()` method automatically when a date is to be represented as a text value or when a date is referred to in a string concatenation.

	
#### Example: Using `toString()`

The following assigns the `toString` value of a `Date` object to `myVar`:
	
    x = new Date();
    myVar=x.toString();   //assigns a value to myVar similar to:
    //Mon Sep 2, 199, 14:36:2, GMT-070, (Pacific Daylight Time)
	

#### See Also

* [[Object.toString `Object.toString()`]]
* [[Date.toDateString `toDateString()`]]
* [[Date.toTimeString `toTimeString()`]]
* [[Date.toLocaleString `toLocaleString()`]]
**/

/**
Date.toTimeString() -> String

[[Date `Date`]] instances refer to a specific point in time. Calling [[Date.toString `toString()`]] will return the date formatted in a human readable form in American English. Sometimes it is desirable to obtain a string of the time portion; such a thing can be accomplished with the this method.

The toTimeString method is especially useful because compliant engines implementing [ECMA-262](http://en.wikipedia.org/wiki/ECMAScript) may differ in the string obtained from toString for Date objects, as the format is implementation-dependent; simple string slicing approaches may not produce consistent results across multiple engines.

#### Example: A basic usage of `toTimeString`

	var d = new Date(1993, 6, 28, 14, 39, 7);
	console.log(d.toString()); // prints Wed Jul 2, 199, 14:39:0, GMT-060, (PDT)
	console.log(d.toTimeString()); // prints 14:39:0, GMT-060, (PDT)


#### See Also

* [[Date.toLocaleTimeString `toLocaleTimeString()`]]
* [[Date.toDateString `toDateString()`]]
* [[Date.toString `toString()`]]

**/

/**	related to: Date.getTime
	Date.valueOf() -> Number
	
The `valueOf` method returns the primitive value of a `Date` object as a number data type, the number of milliseconds since midnight 01 January, 1970 UTC.

This method is usually called internally by Javascript and not explicitly in code.

####  Example: Using `valueOf()` 

	var d = new Date(56, 6, 17);
	var myVar = d.valueOf(); // assigns -424713600000 to myVar
		
#### Returns

Returns the primitive value of a Date object.

####  See also 

* [[Object.valueOf `Object.valueOf()`]]
**/

