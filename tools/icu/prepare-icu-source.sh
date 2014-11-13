#!/bin/bash
#
# Call this to regenerate <node>/deps/icu-small
#

if [ -d `dirname "$0"` ];
then
    cd `dirname "$0"`
fi

# now we are in <node>/tools/icu
cd ../..
# now we are in <node>, hopefully
if [ ! -d 'tools/icu/' ];
then
    echo "$0: error: cannot find tools/icu in" `pwd`
    exit 1
fi

echo "Preparing ICU source in" `pwd`
if [ -d 'deps/icu/' ];
then
    echo "Deleting" 'deps/icu'
    rm -rf deps/icu || exit 1
fi

# clean
echo 'Delete ./out'
rm -rf ./out
# delete old ICU tgz
echo 'Delete deps/icu-small'
rm -rf ./deps/icu-small

echo "Configuring node.. hopefully with ninja"
./configure --with-intl=small-icu --ninja || ./configure --with-intl=small-icu || exit 1
echo "Building node.."
make || ( ./configure --with-intl=small-icu && make ) || exit 1

echo "Leaving our mark"
echo "# Generated. This is the SMALL ICU dir. Don't commit changes against it." > deps/icu/is-small-icu.txt
echo "Great. trimming stuff.."
rm -rfv deps/icu/[Aap]*
rm -rfv deps/icu/source/allinone deps/icu/source/config deps/icu/source/test
rm -rfv deps/icu/source/layout* deps/icu/source/samples deps/icu/source/tools/ctestfw
rm -rfv deps/icu/source/tools/gen[bdns]* deps/icu/source/tools/icuinfo
rm -rfv deps/icu/source/tools/m* deps/icu/source/tools/tzcode
rm -rfv deps/icu/source/data/{curr,lang,misc,region,sprep,unidata,unit,zone}
find deps/icu \( -name 'Makefile*' -o -name '*\.vcx*' \) -print0 | xargs -0 rm -fv
# now, the harsh part. Prove you are compiled!
sh tools/icu/trim-uncompiled-source.sh

# move data
cp ./out/Release/gen/icutmp/icudt*l.dat deps/icu/source/data/in/

mv -v deps/icu deps/icu-small

du -sh deps/icu-small
