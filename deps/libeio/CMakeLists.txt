include_directories(${platform})
add_definitions(-DHAVE_CONFIG_H=1 -D_GNU_SOURCE)
add_library (eio eio.c)