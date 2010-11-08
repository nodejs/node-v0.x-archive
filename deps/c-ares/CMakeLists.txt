include_directories(${platform}-${arch})
include_directories(.)
add_definitions(-DHAVE_CONFIG_H=1)

file(GLOB lib_sources *.c)
add_library(cares ${lib_sources})