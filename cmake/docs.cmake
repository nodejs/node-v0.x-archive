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
