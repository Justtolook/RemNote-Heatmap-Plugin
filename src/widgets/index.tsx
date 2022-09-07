import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

async function onActivate(plugin: ReactRNPlugin) {
  //Register heatmap widget
  await plugin.app.registerWidget(
    'heatmapv2',
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

  // A command that opens the heatmap widget in a new pane 
  await plugin.app.registerCommand({
    id: 'open-heatmap',
    name: 'Open Heatmap',
    action: async () => {
      plugin.window.openWidgetInPane('heatmapv2');
    },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
