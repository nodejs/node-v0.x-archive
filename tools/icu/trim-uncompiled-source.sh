#!/bin/sh
#
# Don't call this directly. Called by prepare-icu-source.sh
#

#./out/Release/obj/deps/icu/source/i18n/icui18n.collationsets.o
#./out/Release/obj/deps/icu/source/i18n/icutools.collationsets.o
for file in `find deps/icu/source -name '*.c' -o -name '*.cpp'`;
do
    #echo "# ${file}"
    base=`basename ${file} .c`
    base=`basename ${base} .cpp`
    dir=`dirname ${file}`
    #echo ${dir}/${base}
    if ls "out/Release/obj/${dir}/"*".${base}.o" 2>/dev/null >/dev/null;
    then
        true
    else
        rm -fv ${file}
    fi
done
