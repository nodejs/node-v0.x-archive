if(SHARED_CARES)
  find_library(LIBCARES_LIBRARY NAMES cares)
  find_path(LIBCARES_INCLUDE_DIR ares.h
    PATH_SUFFIXES include
    ) # Find header
  find_package_handle_standard_args(libcares DEFAULT_MSG LIBCARES_LIBRARY LIBCARES_INCLUDE_DIR)
else()
  add_subdirectory(deps/c-ares)
  set(LIBCARES_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/deps/c-ares ${CMAKE_SOURCE_DIR}/deps/c-ares/${node_platform}-${node_arch})
endif()
