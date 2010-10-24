include_directories(${platform})
add_definitions(-DHAVE_CONFIG_H=1)

add_library (ev ev.c)