cmake_minimum_required (VERSION 2.6)
project (NODE)

STRING(TOLOWER ${CMAKE_SYSTEM_NAME} platform)

if(NOT "v${CMAKE_BUILD_TYPE}" MATCHES vDebug)
  set (CMAKE_BUILD_TYPE "Release")
endif()
message ("CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

set (node_extra_src "src/platform_${platform}.cc")

if (NOT EXISTS ${node_extra_src})
  set (node_extra_src "src/platform_none.cc")
endif()

message ("CMAKE_SYSTEM_PROCESSOR: ${CMAKE_SYSTEM_PROCESSOR}")

if (${CMAKE_SYSTEM_PROCESSOR} MATCHES i686*)
  set(arch x86)
elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES i386*)
  set(arch x86)
else()
  set(arch ${CMAKE_SYSTEM_PROCESSOR})
endif()

if (${arch} MATCHES unknown)
  set(arch x86)
endif()

set(v8arch ${arch})

if (${arch} MATCHES x86_64)
  set(v8arch x64)
elseif (${arch} MATCHES x86)
  set(v8arch ia32)
endif()

STRING(TOLOWER ${CMAKE_BUILD_TYPE} v8mode)

if (${platform} MATCHES sunos)
  add_definitions (-threads)
elseif (NOT ${platform} MATCHES cygwin*)
  add_definitions (-pthread)
  set (CMAKE_C_FLAGS -rdynamic)
  set (CMAKE_EXE_LINKER_FLAGS -pthread)
endif()

if (${platform} MATCHES darwin)
  set (CMAKE_EXE_LINKER_FLAGS -framework Carbon)
endif()

if (${CMAKE_BUILD_TYPE} MATCHES Debug)
else()
endif()


set(CMAKE_C_FLAGS_DEBUG "-O0 -Wall -g -Wextra -DDEBUG $ENV{CFLAGS}")
set(CMAKE_CXX_FLAGS_DEBUG "-O0 -Wall -g -Wextra -DDEBUG $ENV{CXXFLAGS}")

set(CMAKE_C_FLAGS_RELEASE "-g -O3 -DNDEBUG $ENV{CFLAGS}")
set(CMAKE_CXX_FLAGS_RELEASE "-g -O3 -DNDEBUG $ENV{CXXFLAGS}")

INCLUDE(CheckFunctionExists)
CHECK_FUNCTION_EXISTS(fdatasync HAVE_FDATASYNC)

if (HAVE_FDATASYNC)
  add_definitions(-DHAVE_FDATASYNC=1)
endif()

add_definitions(-DPLATFORM="${platform}"
  -DX_STACKSIZE=65536 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DEV_MULTIPLICITY=0
)

#
# options
#

option (SHARED_V8 "use system shared V8 library")
option (SHARED_LIBEV "use system shared libev library")
option (SHARED_CARES "use system shared c-ares library")
option (V8_SNAPSHOT "turn on snapshot when building stock v8")

#
# libraries
#
add_definitions(-DHAVE_CONFIG_H=1)
set (HAVE_CONFIG_H True)

find_package (OpenSSL QUIET)
find_package (Threads)

find_library (RT rt)
find_library (DL dl)

set(V8_INCLUDE_NAMES v8.h v8-debug.h v8-profiler.h)
set(V8_LIBRARY_NAMES v8)

if (SHARED_V8)
  find_path(V8_INCLUDE_DIR NAMES ${V8_INCLUDE_NAMES})
  find_library(V8_LIBRARY_PATH NAMES ${V8_LIBRARY_NAMES} NO_CMAKE_PATH)
  message("V8 library: ${V8_LIBRARY_PATH}")
else()
  set(V8_INCLUDE_DIR "deps/v8/include")
  if (${CMAKE_BUILD_TYPE} MATCHES Debug)
    set(v8_fn "libv8_g.a")
  else()
    set(v8_fn "libv8.a")
  endif()
  set(V8_LIBRARY_PATH "${PROJECT_SOURCE_DIR}/deps/v8/${v8_fn}")
endif()

if (SHARED_LIBEV)
  FIND_LIBRARY (LIBEV_LIBRARY NAMES ev)
  FIND_PATH (LIBEV_INCLUDE_DIR ev.h
    PATH_SUFFIXES include/ev include
    ) # Find header
  INCLUDE(FindPackageHandleStandardArgs)
  FIND_PACKAGE_HANDLE_STANDARD_ARGS(libev DEFAULT_MSG LIBEV_LIBRARY LIBEV_INCLUDE_DIR)
  message("libev library: ${LIBEV_LIBRARY}")
else()
  add_subdirectory (deps/libev)
  set (LIBEV_INCLUDE_DIR deps/libev)
endif()

if (SHARED_CARES)
  FIND_LIBRARY (LIBCARES_LIBRARY NAMES cares)
  FIND_PATH (LIBCARES_INCLUDE_DIR ares.h
    PATH_SUFFIXES include
    ) # Find header
  INCLUDE(FindPackageHandleStandardArgs)
  FIND_PACKAGE_HANDLE_STANDARD_ARGS(libcares DEFAULT_MSG LIBCARES_LIBRARY LIBCARES_INCLUDE_DIR)
  message("libc-ares library: ${LIBCARES_LIBRARY}")
else()
  add_subdirectory (deps/c-ares)
  set (LIBCARES_INCLUDE_DIR deps/c-ares deps/c-ares/${platform}-${arch})
endif()

if (${platform} MATCHES freebsd)
  find_library (KVM NAMES kvm)
  set (extra_libs KVM)
endif()

message("RT library: ${RT}")
message("DL library: ${DL}")

if (${OPENSSL_FOUND} MATCHES TRUE)
  message("openssl found!")
  add_definitions(-DHAVE_OPENSSL=1)
  set (HAVE_OPENSSL True)
  set (node_extra_src ${node_extra_src} src/node_crypto.cc)
  set (extra_libs ${extra_libs} ${OPENSSL_LIBRARIES})
endif()

FILE(GLOB js2c_files lib/*.js)
set(js2c_files src/node.js ${js2c_files})

if (NOT EXISTS src/node_natives.h)
  EXECUTE_PROCESS(COMMAND tools/js2c.py src/node_natives.h ${js2c_files})
endif()

set(node_sources
    src/node_main.cc
    src/node.cc
    src/node_buffer.cc
    src/node_javascript.cc
    src/node_extensions.cc
    src/node_http_parser.cc
    src/node_net.cc
    src/node_io_watcher.cc
    src/node_child_process.cc
    src/node_constants.cc
    src/node_cares.cc
    src/node_events.cc
    src/node_file.cc
    src/node_signal_watcher.cc
    src/node_stat_watcher.cc
    src/node_stdio.cc
    src/node_timer.cc
    src/node_script.cc
    ${node_extra_src}
)

add_subdirectory (deps/libeio)
add_subdirectory (deps/http_parser)


configure_file (src/node_config.h.in src/node_config.h)
configure_file (config.h.cmake config.h)

include_directories (src ${LIBEV_INCLUDE_DIR} deps/libeio ${V8_INCLUDE_DIR} ${LIBCARES_INCLUDE_DIR} deps/http_parser)
add_executable (node ${node_sources})
target_link_libraries (node ev eio cares http_parser v8 ${CMAKE_THREAD_LIBS_INIT} ${DL} ${RT} ${extra_libs})
set_target_properties(node PROPERTIES DEBUG_POSTFIX "_g")

install (TARGETS node RUNTIME DESTINATION bin)
install (FILES     
  config.h
  src/node.h
  src/node_object_wrap.h
  src/node_buffer.h
  src/node_events.h
  src/node_version.h
  src/node_config.h
  DESTINATION include/node)

#
# v8 specific
#

if (NOT SHARED_V8)
  if (V8_SNAPSHOT)
    set(v8snapshot snapshot=on)
  endif()

  add_custom_command (
    OUTPUT ${PROJECT_SOURCE_DIR}/deps/v8/${v8_fn}
    COMMAND ../../tools/scons/scons.py library=static visibility=default ${v8snapshot} mode=${v8mode} verbose=on arch=${v8arch}
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}/deps/v8/
    )
  ADD_CUSTOM_TARGET(v8_stock ALL DEPENDS ${PROJECT_SOURCE_DIR}/deps/v8/${v8_fn})


  add_library(v8 STATIC IMPORTED)

  set_property(TARGET v8 PROPERTY
               IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/deps/v8/${v8_fn})
endif()

if (NOT SHARED_V8)
  add_dependencies (node v8_stock)
endif()

#
# tests
#


if (${CMAKE_BUILD_TYPE} MATCHES Debug)
  set (test_bin_dir debug)
  get_target_property(node_bin node DEBUG_LOCATION)
else()
  set (test_bin_dir default)
  get_target_property(node_bin node LOCATION)
endif()

add_custom_command (
  TARGET node POST_BUILD
  COMMAND /bin/mkdir -p build/${test_bin_dir}
  COMMAND /bin/cp -n ${node_bin} build/${test_bin_dir} || true
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
)

add_custom_target (
  test
  COMMAND python tools/test.py --mode=release simple message
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target (test-all
  COMMAND python tools/test.py --mode=debug,release
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target (test-release
  COMMAND python tools/test.py --mode=release
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target (test-debug
  COMMAND python tools/test.py --mode=debug
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target (test-message
  COMMAND python tools/test.py message
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target (test-simple
  COMMAND python tools/test.py simple
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )
     
add_custom_target (test-pummel
  COMMAND python tools/test.py pummel
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )
	
add_custom_target (test-internet
  COMMAND python tools/test.py internet
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )
