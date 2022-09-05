# RemNote Heatmap Plugin

## Features
This Plugin will display a heatmap of the number of repetitions per day you have done in total.

## How to Use
The heatmap can be opened with a slash command. Just type `/heatmap` anywhere in RemNote and the heatmap will open in a new pane.

## Settings
 - Color for low values: With this setting, you can set a different color for lower values. This can be useful if you want to see the days with fewer repetitions more clearly. (Expects a hex color code. E.g. `#ff0000` for red)
 - Color for normal values: With this setting, you can set a different color for normal values. (Expects a hex color code. E.g. `#ff0000` for red)
Note: If you insert a color code that is not valid, a default color will be used.
 - Upper bound for low number of repetitions: All days with fewer repetitions than this number will be colored with the color for low values. Use '0' if you just want to use the normal color. (Expects a number)