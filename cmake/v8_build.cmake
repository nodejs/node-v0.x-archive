#
# v8 build stuff
#
include(ExternalProject)

string(TOLOWER ${CMAKE_BUILD_TYPE} v8mode)
set(v8arch ${node_arch})

if(${node_arch} MATCHES x86_64)
  set(v8arch x64)
elseif(${node_arch} MATCHES x86)
  set(v8arch ia32)
endif()


if(NOT SHARED_V8)
  if(V8_SNAPSHOT)
    set(v8snapshot snapshot=on)
  endif()
  
  if(${node_platform} MATCHES darwin)
    execute_process(COMMAND hwprefs cpu_count OUTPUT_VARIABLE cpu_count)
  elseif(${node_platform} MATCHES linux)
    execute_process(COMMAND sh -c "cat /proc/cpuinfo | grep processor | sort | uniq | wc -l"
      OUTPUT_VARIABLE cpu_count)
  endif()

  if(${cpu_count} GREATER 1 AND NOT _ignore_cpuc)
    math(EXPR parallel_jobs ${cpu_count}*2)
  else()
    set(parallel_jobs 1)
  endif()

  ExternalProject_Add(v8_extprj
    URL ${PROJECT_SOURCE_DIR}/deps/v8

    BUILD_IN_SOURCE True
    BUILD_COMMAND sh -c "${PROJECT_BINARY_DIR}/tools/scons/scons.py library=static visibility=default ${v8snapshot} mode=${v8mode} verbose=on arch=${v8arch} -j ${parallel_jobs}"

    SOURCE_DIR ${PROJECT_BINARY_DIR}/deps/v8
    # ignore this stuff, it's not needed for building v8 but ExternalProject
    # demands these steps

    CONFIGURE_COMMAND "true" # fake configure
    INSTALL_COMMAND "true" # fake install
    )

  add_library(v8 STATIC IMPORTED)
  add_dependencies(node v8_extprj)
  set_property(TARGET v8
    PROPERTY IMPORTED_LOCATION ${PROJECT_BINARY_DIR}/deps/v8/${v8_fn})
endif()
