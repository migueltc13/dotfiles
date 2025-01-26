#!/bin/bash

WALLPAPER_ROOT="${HOME}/Pictures/Wallpapers"

WALLPAPER_DIR="${WALLPAPER_ROOT}/catppuccin"
# WALLPAPER_DIR="${WALLPAPER_ROOT}/defcon"

NUMBER_OF_WALLPAPERS=$( ls ${WALLPAPER_DIR} | wc -w )
RANDON_NUMBER=$(( ${RANDOM} % ${NUMBER_OF_WALLPAPERS} ))
ln -fs ${WALLPAPER_DIR}/wallpaper${RANDON_NUMBER}.png ${WALLPAPER_ROOT}/wallpaper.png
echo $(ls -l ${WALLPAPER_ROOT}/wallpaper.png)
exit 0
