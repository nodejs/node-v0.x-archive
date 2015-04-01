Localization bundle for Node.

This is pretty straightforward... if ICU is present, then ICU's resource
bundle mechanism is used, the resources are compiled statically into the
library, which can then be used within Node. If ICU is not present, a simple
sprintf fallback is used. Everything is macro-driven and keyed off the
--with-intl configuration flag, just like the Intl.

```
./configure --with-intl={any value}
make
```
When the --with-intl switch is on, the resources are compiled into a static
library that is statically linked into Node. The next step will be to make
it so that additional bundles can be specified at runtime.

Resource bundles are located in the resources directory. Standard ICU bundle
format but keep it simple, we currently only support top level resources.

Within the C/C++ code, use the macros:

```cc
#include "node_l10n.h"
#include <stdio.h>

L10N_PRINTF("TEST", "This is the fallback");
L10N_PRINTFV("TEST2", "Testing %s %d", "a", 1);

// L10N_ASPRINTFV returns an allocated string expanded using ASPRINTF...
// You have to free it when done.
char * target;
if (L10N_ASPRINTFV("TEST2", target, "Testing %s %d", "a", 1) > -1) {
  printf("%s", target);
  free(target);
}

// You can use L10N directly but you have to free when done
// (only if fallback isn't used)
const char * fallback = "This is the fallback";
const char * msg = L10N("TEST",fallback);
if (msg != fallback) { delete[] msg; }
```

In the JS code, use the _bundle.js
```javascript
var bundle = require('_bundle');
console.log(bundle("TEST", "This is the fallback"));
console.log(bundle("TEST2", "Fallback %s %d", "a", 1));
```

Use the `--icu-data-dir` switch to specify a location containing alternative
node.dat files containing alternative translations. Note that this is the
same switch used to specify alternative ICU common data files.

One approach that ought to work here is publishing translation node.dat files
to npm. Then, the developer does a `npm install node_dat_de` (for instance)
to grab the appropriate translations. Then, then can start node like:

`node --icu-data-dir=node_modules/node_dat_de` and have things just work.
