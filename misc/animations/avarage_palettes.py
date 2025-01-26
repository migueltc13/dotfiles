palette1 = "#000000:#ed333b:#08ff00:#cdcd00:#3584e4:#cd00cd:#00cdcd:#e5e5e5:#7f7f7f:#e01b24:#29ff17:#ffff00:#1a5fb4:#ff00ff:#00ffff:#ffffff"
palette2 = "#51576d:#e78284:#a6d189:#e5c890:#8caaee:#f4b8e4:#81c8be:#b5bfe2:#626880:#e78284:#a6d189:#e5c890:#8caaee:#f4b8e4:#81c8be:#a5adce"
palettex = "#292c37:#ea5b60:#57e845:#d9cb48:#6197e9:#e15cd9:#41cbc6:#cdd2e4:#717480:#e44f54:#68e850:#f2e448:#5385d1:#fa5cf2:#41e4df:#d2d6e7"

def average_color(color1, color2):
    r1, g1, b1 = int(color1[1:3], 16), int(color1[3:5], 16), int(color1[5:], 16)
    r2, g2, b2 = int(color2[1:3], 16), int(color2[3:5], 16), int(color2[5:], 16)

    # avg_r = (r1 + r2) // 2
    # avg_g = (g1 + g2) // 2
    # avg_b = (b1 + b2) // 2

    # avg_r = max(r1, r2) - int(abs(r2 - r1) * 0.50)
    # avg_g = max(g1, g2) - int(abs(g2 - g1) * 0.50)
    # avg_b = max(b1, b2) - int(abs(b2 - b1) * 0.50)

    avg_r = int((r1 + r2) * 0.50)
    avg_g = int((g1 + g2) * 0.50)
    avg_b = int((b1 + b2) * 0.50)

    return "#{:02x}{:02x}{:02x}".format(avg_r, avg_g, avg_b)

# Convert the original palettes to lists of colors
palette1_list = palette1.split(':')
palette2_list = palette2.split(':')

# Find the average color for each pair of corresponding colors
middle_palette_list = [average_color(color1, color2) for color1, color2 in zip(palette1_list, palette2_list)]

# Convert the list back to the Xterm 256-color format
middle_palette = ':'.join(middle_palette_list)

print(f'palette = "{middle_palette}"')

