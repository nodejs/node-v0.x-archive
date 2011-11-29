all:
	@if [ -z "$(PREFIX_NODE)" ]; then \
    echo "Usage: " ; \
    echo "  PREFIX_NODE=<node-install-path> make" ; \
    exit 1 ; \
	fi
	
	@if $(PREFIX_NODE)/bin/node-waf configure build ; \
	then \
    $(PREFIX_NODE)/bin/node test.js ; \
  fi

