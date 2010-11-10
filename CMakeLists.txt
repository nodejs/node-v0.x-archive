cmake_minimum_required(VERSION 2.6)
project(node)
cmake_policy(SET CMP0009 NEW)


string(TOLOWER ${CMAKE_SYSTEM_NAME} platform)

string(COMPARE EQUAL $(PROJECT_BINARY_DIR) ${PROJECT_SOURCE_DIR} in_source_build)
if(NOT ${in_source_build})
  execute_process(COMMAND cmake -E copy_directory ${PROJECT_SOURCE_DIR}/tools ${PROJECT_BINARY_DIR}/tools)
endif()

if(NOT "v${CMAKE_BUILD_TYPE}" MATCHES vDebug)
  set(CMAKE_BUILD_TYPE "Release")
endif()

set(node_extra_src "src/platform_${platform}.cc")

if(NOT EXISTS ${CMAKE_SOURCE_DIR}/${node_extra_src})
  set(node_extra_src "src/platform_none.cc")
endif()

if(${CMAKE_SYSTEM_PROCESSOR} MATCHES i686*)
  set(arch x86)
elseif(${CMAKE_SYSTEM_PROCESSOR} MATCHES i386*)
  set(arch x86)
else()
  set(arch ${CMAKE_SYSTEM_PROCESSOR})
endif()

if(${arch} MATCHES unknown)
  set(arch x86)
endif()

set(v8arch ${arch})

if(${arch} MATCHES x86_64)
  set(v8arch x64)
elseif(${arch} MATCHES x86)
  set(v8arch ia32)
endif()

string(TOLOWER ${CMAKE_BUILD_TYPE} v8mode)

if(${platform} MATCHES sunos)
  add_definitions(-threads)
elseif(NOT ${platform} MATCHES cygwin*)
  add_definitions(-pthread)
  set(CMAKE_C_FLAGS -rdynamic)
  set(CMAKE_EXE_LINKER_FLAGS -pthread)
endif()

if(${platform} MATCHES darwin)
  set(CMAKE_EXE_LINKER_FLAGS "-framework Carbon")
endif()

## What is this for??
if(${CMAKE_BUILD_TYPE} MATCHES Debug)
else()
endif()

if(${CMAKE_BUILD_TYPE} MATCHES Debug)
  set(EXECUTABLE_OUTPUT_PATH ${CMAKE_BINARY_DIR}/debug/)
else()
  set(EXECUTABLE_OUTPUT_PATH ${CMAKE_BINARY_DIR}/default/)
endif()

set(CMAKE_C_FLAGS_DEBUG "-O0 -Wall -g -Wextra -DDEBUG $ENV{CFLAGS}")
set(CMAKE_CXX_FLAGS_DEBUG "-O0 -Wall -g -Wextra -DDEBUG $ENV{CXXFLAGS}")

set(CMAKE_C_FLAGS_RELEASE "-g -O3 -DNDEBUG $ENV{CFLAGS}")
set(CMAKE_CXX_FLAGS_RELEASE "-g -O3 -DNDEBUG $ENV{CXXFLAGS}")

include(CheckFunctionExists)
check_function_exists(fdatasync HAVE_FDATASYNC)

if(HAVE_FDATASYNC)
  add_definitions(-DHAVE_FDATASYNC=1)
else()
  add_definitions(-DHAVE_FDATASYNC=0)
endif()

add_definitions(
  -DPLATFORM=${platform}
  -DX_STACKSIZE=65536
  -D_LARGEFILE_SOURCE
  -D_FILE_OFFSET_BITS=64
  -DEV_MULTIPLICITY=0
  )

#
# options
#

option(SHARED_V8 "use system shared V8 library")
option(SHARED_LIBEV "use system shared libev library")
option(SHARED_CARES "use system shared c-ares library")
option(V8_SNAPSHOT "turn on snapshot when building stock v8")

#
# libraries
#
add_definitions(-DHAVE_CONFIG_H=1)
set(HAVE_CONFIG_H True)

find_package(OpenSSL QUIET)
find_package(Threads)

find_library(RT rt)
if(RT)
  set(extra_libs ${extra_libs} ${RT})
endif()

find_library(DL dl)
if(DL)
  set(extra_libs ${extra_libs} ${DL})
endif()

set(V8_INCLUDE_NAMES v8.h v8-debug.h v8-profiler.h)
set(V8_LIBRARY_NAMES v8)

if(SHARED_V8)
  find_path(V8_INCLUDE_DIR NAMES ${V8_INCLUDE_NAMES})
  find_library(V8_LIBRARY_PATH NAMES ${V8_LIBRARY_NAMES} NO_CMAKE_PATH)
else()
  set(V8_INCLUDE_DIR "${PROJECT_BINARY_DIR}/deps/v8/include")
  if(${CMAKE_BUILD_TYPE} MATCHES Debug)
    set(v8_fn "libv8_g.a")
  else()
    set(v8_fn "libv8.a")
  endif()
  set(V8_LIBRARY_PATH "${PROJECT_BINARY_DIR}/deps/v8/${v8_fn}")
endif()

if(SHARED_LIBEV)
  find_library(LIBEV_LIBRARY NAMES ev)
  find_path(LIBEV_INCLUDE_DIR ev.h
    PATH_SUFFIXES include/ev include
    ) # Find header
  include(FindPackageHandleStandardArgs)
  find_package_handle_standard_args(libev DEFAULT_MSG LIBEV_LIBRARY LIBEV_INCLUDE_DIR)
else()
  add_subdirectory(deps/libev)
  set(LIBEV_INCLUDE_DIR deps/libev)
endif()

if(SHARED_CARES)
  find_library(LIBCARES_LIBRARY NAMES cares)
  find_path(LIBCARES_INCLUDE_DIR ares.h
    PATH_SUFFIXES include
    ) # Find header
  include(FindPackageHandleStandardArgs)
  find_package_handle_standard_args(libcares DEFAULT_MSG LIBCARES_LIBRARY LIBCARES_INCLUDE_DIR)
else()
  add_subdirectory(deps/c-ares)
  set(LIBCARES_INCLUDE_DIR deps/c-ares deps/c-ares/${platform}-${arch})
endif()

if(${platform} MATCHES freebsd)
  find_library(KVM NAMES kvm)
  set(extra_libs ${extra_libs} KVM)
endif()

if(${OPENSSL_FOUND} MATCHES TRUE)
  add_definitions(-DHAVE_OPENSSL=1)
  set(HAVE_OPENSSL True)
  set(node_extra_src ${node_extra_src} src/node_crypto.cc)
  set(extra_libs ${extra_libs} ${OPENSSL_LIBRARIES})
endif()

file(GLOB js2c_files ${PROJECT_SOURCE_DIR}/lib/*.js)
set(js2c_files ${PROJECT_SOURCE_DIR}/src/node.js ${js2c_files})
file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/src)

set(PREFIX ${CMAKE_INSTALL_PREFIX})
if(${CMAKE_BUILD_TYPE} MATCHES Debug)
  set(CCFLAGS "${CMAKE_C_FLAGS_DEBUG} ${CMAKE_C_FLAGS}")
else()
  set(CCFLAGS "${CMAKE_C_FLAGS_RELEASE} ${CMAKE_C_FLAGS}")
endif()
get_directory_property(compile_defs COMPILE_DEFINITIONS)
foreach(def ${compile_defs})
  set(CPPFLAGS "${CPPFLAGS} -D${def}")
endforeach()

add_custom_command(
  OUTPUT ${PROJECT_BINARY_DIR}/src/node_natives.h
  COMMAND tools/js2c.py ${PROJECT_BINARY_DIR}/src/node_natives.h ${js2c_files}
  DEPENDS ${js2c_files})

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
  src/node_natives.h
  ${node_extra_src})

add_subdirectory(deps/libeio)
add_subdirectory(deps/http_parser)


configure_file(src/node_config.h.in ${PROJECT_BINARY_DIR}/src/node_config.h)
configure_file(config.h.cmake ${PROJECT_BINARY_DIR}/config.h)

include_directories(
  src
  deps/libeio
  deps/http_parser
  ${V8_INCLUDE_DIR}
  ${LIBEV_INCLUDE_DIR}
  ${LIBCARES_INCLUDE_DIR}

  ${PROJECT_BINARY_DIR}
  ${PROJECT_BINARY_DIR}/src
)


add_executable(node ${node_sources})
set_target_properties(node PROPERTIES DEBUG_POSTFIX "_g")

target_link_libraries(node
  ev
  eio
  cares
  http_parser
  ${V8_LIBRARY_PATH}
  ${CMAKE_THREAD_LIBS_INIT}
  ${extra_libs})


install(TARGETS node RUNTIME DESTINATION bin)
install(FILES     
  ${PROJECT_BINARY_DIR}/config.h
  src/node.h
  src/node_object_wrap.h
  src/node_buffer.h
  src/node_events.h
  src/node_version.h
  ${PROJECT_BINARY_DIR}/src/node_config.h

  DESTINATION include/node
)

#
# v8 specific
#

if(NOT SHARED_V8)
  file(GLOB_RECURSE v8_sources RELATIVE ${PROJECT_SOURCE_DIR} deps/v8/*)

  if(NOT ${in_source_build})
    file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/deps/v8)

    foreach(FILE ${v8_sources})
      add_custom_command(OUTPUT ${PROJECT_BINARY_DIR}/${FILE}
        COMMAND ${CMAKE_COMMAND} -E copy_if_different ${PROJECT_SOURCE_DIR}/${FILE} ${PROJECT_BINARY_DIR}/${FILE}
        DEPENDS ${PROJECT_SOURCE_DIR}/${FILE}
        )
      list(APPEND v8_sources_dest ${PROJECT_BINARY_DIR}/${FILE})
    endforeach()
  else()
    set(v8_sources_dest ${v8_sources})
  endif()

  if(V8_SNAPSHOT)
    set(v8snapshot snapshot=on)
  endif()

  if(${platform} MATCHES darwin)
    execute_process(COMMAND hwprefs cpu_count OUTPUT_VARIABLE cpu_count)
  elseif(${platform} MATCHES linux)
    execute_process(COMMAND cat /proc/cpuinfo
      COMMAND grep processor
      COMMAND sort
      COMMAND uniq
      COMMAND wc -l
      OUTPUT_VARIABLE cpu_count)
  endif()

  if(${cpu_count} GREATER 1)
    math(EXPR parallel_jobs ${cpu_count}*2)
  else()
    set(parallel_jobs 1)
  endif()

  add_custom_command(
    OUTPUT ${PROJECT_BINARY_DIR}/deps/v8/${v8_fn}
    COMMAND ${PROJECT_BINARY_DIR}/tools/scons/scons.py library=static visibility=default ${v8snapshot} mode=${v8mode} verbose=on arch=${v8arch} -j ${parallel_jobs}
    WORKING_DIRECTORY ${PROJECT_BINARY_DIR}/deps/v8/
    DEPENDS ${v8_sources_dest}
    )

  add_custom_target(v8_stock ALL DEPENDS ${PROJECT_BINARY_DIR}/deps/v8/${v8_fn})


  add_library(v8 STATIC IMPORTED)

  set_property(TARGET v8 PROPERTY
    IMPORTED_LOCATION ${PROJECT_BINARY_DIR}/deps/v8/${v8_fn})
endif()

if(NOT SHARED_V8)
  add_dependencies(node v8_stock)
endif()

#
# docs
#

file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/doc)

add_custom_target(
  doc
  DEPENDS doc/node.1 doc/api.html ${PROJECT_SOURCE_DIR}/doc/index.html doc/changelog.html
  WORKING_DIRECTORY ${PROJECT_BINARY_DIR}
  )

add_custom_command(
  OUTPUT ${PROJECT_BINARY_DIR}/doc/api.html
  COMMAND ${PROJECT_BINARY_DIR}/default/node tools/ronnjs/bin/ronn.js --fragment doc/api.markdown
    | sed "s/<h2>\\\(.*\\\)<\\/h2>/<h2 id=\"\\1\">\\1<\\/h2>/g"
    | cat doc/api_header.html - doc/api_footer.html > ${PROJECT_BINARY_DIR}/doc/api.html
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS node doc/api.markdown doc/api_header.html doc/api_footer.html
  VERBATIM
  )

add_custom_command(
  OUTPUT ${PROJECT_BINARY_DIR}/doc/changelog.html
  COMMAND cat doc/changelog_header.html ChangeLog doc/changelog_footer.html > ${PROJECT_BINARY_DIR}/doc/changelog.html
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS ChangeLog doc/changelog_header.html doc/changelog_footer.html
  VERBATIM
  )

add_custom_command(
  OUTPUT ${PROJECT_BINARY_DIR}/doc/node.1
  COMMAND ${PROJECT_BINARY_DIR}/default/node tools/ronnjs/bin/ronn.js --roff doc/api.markdown > ${PROJECT_BINARY_DIR}/doc/node.1
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS node doc/api.markdown tools/ronnjs/bin/ronn.js
  VERBATIM
  )

#
# tests
#


if(${CMAKE_BUILD_TYPE} MATCHES Debug)
  set(test_bin_dir debug)
  get_target_property(node_bin node DEBUG_LOCATION)
else()
  set(test_bin_dir default)
  get_target_property(node_bin node LOCATION)
endif()

enable_testing()

file(GLOB_RECURSE node_tests ${CMAKE_SOURCE_DIR}/test/*)

set(ARGS "-Q -N")

foreach(test ${node_tests})
  if(test MATCHES ".*/test-[^./\ ]*.\\.js" AND NOT test MATCHES ".*disabled.*"
      AND NOT test MATCHES ".*pummel.*")

    # build a fancy name for each test
    string(REPLACE ${CMAKE_SOURCE_DIR}/test/ "" test_name ${test})
    string(REPLACE test- "" test_name ${test_name})
    string(REPLACE ".js" "" test_name ${test_name})
    string(REPLACE "/" "-" test_name ${test_name})

    add_test(${test_name} ${node_bin} ${test})
  endif()

endforeach()

add_custom_command(
  TARGET node POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E make_directory ${PROJECT_BINARY_DIR}/${test_bin_dir}
  COMMAND ${CMAKE_COMMAND} -E copy_if_different ${node_bin} ${PROJECT_BINARY_DIR}/${test_bin_dir}
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR})

add_custom_target(
  test
  COMMAND python tools/test.py --mode=release simple message
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-all
  COMMAND python tools/test.py --mode=debug,release
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-release
  COMMAND python tools/test.py --mode=release
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-debug
  COMMAND python tools/test.py --mode=debug
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-message
  COMMAND python tools/test.py message
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-simple
  COMMAND python tools/test.py simple
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-pummel
  COMMAND python tools/test.py pummel
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

add_custom_target(test-internet
  COMMAND python tools/test.py internet
  DEPENDS node
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  )

#
# package
#

set(CPACK_GENERATOR "TGZ;DEB;RPM")
set(CPACK_DEBIAN_PACKAGE_MAINTAINER "Tom Hughes <tom.hughes@palm.com>")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Evented I/O for V8 JavaScript.")
set(CPACK_PACKAGE_DESCRIPTION "Node's goal is to provide an easy way to
  build scalable network programs.

  Node is similar in design to and influenced by systems like Ruby's Event
  Machine or Python's Twisted. Node takes the event model a bit further—it
  presents the event loop as a language construct instead of as a library.")
set(CPACK_DEBIAN_PACKAGE_SECTION "web")
file(READ ${PROJECT_SOURCE_DIR}/src/node_version.h node_version_h LIMIT 1024 OFFSET 0)
string(REGEX REPLACE ".*NODE_MAJOR_VERSION[ ]*([0-9]+).*" "\\1" CPACK_PACKAGE_VERSION_MAJOR "${node_version_h}")
string(REGEX REPLACE ".*NODE_MINOR_VERSION[ ]*([0-9]+).*" "\\1" CPACK_PACKAGE_VERSION_MINOR "${node_version_h}")
string(REGEX REPLACE ".*NODE_PATCH_VERSION[ ]*([0-9]+).*" "\\1" CPACK_PACKAGE_VERSION_PATCH "${node_version_h}")
set(node_version_string "${CPACK_PACKAGE_VERSION_MAJOR}.${CPACK_PACKAGE_VERSION_MINOR}.${CPACK_PACKAGE_VERSION_PATCH}")
include(CPack)


#
# Final build configuration output
#

message("** Build Summary **")
message("  Version:            ${node_version_string}")
message("  Prefix:             ${PREFIX}")
message("  Build Type:         ${CMAKE_BUILD_TYPE}")
message("  Architecture:       ${CMAKE_SYSTEM_PROCESSOR}")

if(SHARED_V8)
message("  V8:                 ${V8_LIBRARY_PATH}")
#else()
#message(" V8 jobs:            ${parallel_jobs}")
endif()

if(SHARED_libev)
  message("  libev:              ${LIBEV_LIBRARY}")
endif()

if(SHARED_CARES)
  message("  libc-ares:          ${LIBCARES_LIBRARY}")
endif()

message("  RT library:         ${RT}")
message("  DL library:         ${DL}")

if(${OPENSSL_FOUND} MATCHES TRUE)
  message("  OpenSSL:            Found!")
endif()

# message("  CCFLAGS:            ${CCFLAGS}")
# message("  CPPFLAGS:           ${CPPFLAGS}")
