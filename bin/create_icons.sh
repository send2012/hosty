#!/bin/bash

SIZES="16 32 64 128 256 512"
ORG_SIZE="1024"
ORG_FILE="icon_${ORG_SIZE}x${ORG_SIZE}.png"

cd $(dirname $0)
cd ../public/assets/img/hosty.iconset

for SIZE in $SIZES
do
  FILE="icon_${SIZE}x${SIZE}.png"
  sips -Z ${SIZE} ${ORG_FILE} --out ${FILE}
  echo "${FILE} is created"
done

for SIZE in $SIZES
do
  FILE="icon_${SIZE}x${SIZE}@2x.png"
  sips -Z $((${SIZE} * 2)) ${ORG_FILE} --out ${FILE}
  echo "${FILE} is created"
done

cd ..

iconutil -c icns hosty.iconset
echo "icns file is created"

ARGS=""
SIZES="${SIZES} ${ORG_SIZE}"
for SIZE in $SIZES
do
  FILE="icon_${SIZE}x${SIZE}.png"
  ARGS="${ARGS} hosty.iconset/${FILE}"
done

convert ${ARGS} hosty.ico
echo "ico file is created"
