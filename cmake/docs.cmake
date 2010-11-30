#
# docs
#

file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/doc)

set(node_binary ${PROJECT_BINARY_DIR}/default/node)
set(doctool tools/ronnjs/bin/ronn.js)
set(changelog_html ${PROJECT_BINARY_DIR}/doc/changelog.html)
set(api_html ${PROJECT_BINARY_DIR}/doc/api.html)
set(man_page ${PROJECT_BINARY_DIR}/doc/node.1)

file(GLOB_RECURSE doc_sources RELATIVE ${PROJECT_SOURCE_DIR} doc/*)

foreach(FILE ${doc_sources})
  set(OUT_FILE ${FILE})
  add_custom_command(OUTPUT ${PROJECT_BINARY_DIR}/${OUT_FILE}
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${PROJECT_SOURCE_DIR}/${FILE} ${PROJECT_BINARY_DIR}/${OUT_FILE}
    DEPENDS ${PROJECT_SOURCE_DIR}/${FILE}
    )
  list(APPEND doc_sources_copy ${PROJECT_BINARY_DIR}/${OUT_FILE})
endforeach()

add_custom_target(
  doc
  DEPENDS node ${doc_sources_copy} ${api_html} ${changelog_html} ${man_page}
  WORKING_DIRECTORY ${PROJECT_BINARY_DIR}
  )

add_custom_command(
  OUTPUT ${api_html}
  COMMAND ${node_binary} ${doctool} --fragment doc/api.markdown
    | sed "s/<h2>\\\(.*\\\)<\\/h2>/<h2 id=\"\\1\">\\1<\\/h2>/g"
    | cat doc/api_header.html - doc/api_footer.html > ${api_html}
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS node ${doctool} ${doc_sources_copy}
  VERBATIM
  )

add_custom_command(
  OUTPUT ${changelog_html}
  COMMAND cat doc/changelog_header.html ChangeLog doc/changelog_footer.html > ${changelog_html} 
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS ChangeLog node ${doctool} ${doc_sources_copy}
  VERBATIM
  )

add_custom_command(
  OUTPUT ${man_page}
  COMMAND ${node_binary} ${doctool} --roff doc/api.markdown > ${man_page}
  WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
  DEPENDS node ${doctool} ${doc_sources_copy}
  VERBATIM
  )
