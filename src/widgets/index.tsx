import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

async function onActivate(plugin: ReactRNPlugin) {
  //Register text dictionary widget
  await plugin.app.registerWidget(
    'heatmap',
    WidgetLocation.Pane,
    {
      dimensions: { height: 'auto', width: 'auto'},
    },
  );
  //await plugin.window.openWidgetInPane('heatmap');
  // Register settings
  await plugin.settings.registerStringSetting({
    id: 'HeatmapColorLow',
    title: 'Color for low values',
    defaultValue: '#b3dff0',
  });
  await plugin.settings.registerStringSetting({
    id: 'HeatmapColorNormal',
    title: 'Color for normal values',
    defaultValue: '#3362f0',
  });
  await plugin.settings.registerNumberSetting({
    id: 'HeatmapLowUpperBound',
    title: 'Upper bound for low number of repetitions',
    defaultValue: 30,
  });

  // A command that inserts text into the editor if focused.
  await plugin.app.registerCommand({
    id: 'open-heatmap',
    name: 'Open Heatmap',
    action: async () => {
      plugin.window.openWidgetInPane('heatmap');
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
