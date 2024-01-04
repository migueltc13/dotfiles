#!/bin/bash

WALLPAPER_ROOT="${HOME}/Pictures/Wallpapers"
WALLPAPER_DIR="${WALLPAPER_ROOT}/wallpapers"

NUMBER_OF_WALLPAPERS=$( ls ${WALLPAPER_DIR} | wc -w )
RANDON_NUMBER=$(( ${RANDOM} % ${NUMBER_OF_WALLPAPERS} + 1 ))
ln -fs ${WALLPAPER_DIR}/wallpaper${RANDON_NUMBER}.png ${WALLPAPER_ROOT}/wallpaper.png
echo $(ls -l ${WALLPAPER_ROOT}/wallpaper.png)
exit 0
