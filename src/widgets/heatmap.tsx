import { usePlugin, renderWidget, useTracker, Card, CardNamespace, Rem, useRunAsync } from '@remnote/plugin-sdk';
import Chart from 'react-apexcharts';

const DEFAULT_heatmapColorLow = '#b3dff0';
const DEFAULT_heatmapColorNormal = '#3362f0';

function Heatmap () {
  const plugin = usePlugin();
  var heatmapColorLow = useTracker(() => plugin.settings.getSetting('HeatmapColorLow'));
  var heatmapColorNormal = useTracker(() => plugin.settings.getSetting('HeatmapColorNormal'));
  const heatmapLowUpperBound = useTracker(() => plugin.settings.getSetting('HeatmapLowUpperBound'));
  const allCards: Card[] | undefined = useTracker(
    async (reactivePlugin) => await reactivePlugin.card.getAll()
  );

  const repetitionsPerDay = getRepetitionsPerDayObject(allCards);
  const daysLearned = repetitionsPerDay.length;
  var data = getFullArrayRepetitionsPerDay(allCards);
  var dailyAverage = getDailyAverage(data);
  var longestStreak = getLongestStreak(data);

//check if heatmapColorLow and heatmapColorNormal are valid colors, if not set them to default values
  if (!/^#[0-9A-F]{6}$/i.test(heatmapColorLow)) {
    heatmapColorLow = DEFAULT_heatmapColorLow;
  }
  if (!/^#[0-9A-F]{6}$/i.test(heatmapColorNormal)) {
    heatmapColorNormal = DEFAULT_heatmapColorNormal;
  }


  //create an object where the keys are Monday to Sunday
  //this will be used for the series in the heatmap
  var WeekdaySeries = {"Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []};

  //iterate over the data, determine the weekday based on the Unix timestamp and push the value to the corresponding weekday
  for (var i = 0; i < data.length; i++) {
    var weekday = new Date(data[i][0]).getDay();
    switch (weekday) {
      case 0:
        WeekdaySeries.Sunday.push(data[i]);
        break;
      case 1:
        WeekdaySeries.Monday.push(data[i]);
        break;
      case 2:
        WeekdaySeries.Tuesday.push(data[i]);
        break;
      case 3:
        WeekdaySeries.Wednesday.push(data[i]);
        break;
      case 4:
        WeekdaySeries.Thursday.push(data[i]);
        break;
      case 5:
        WeekdaySeries.Friday.push(data[i]);
        break;
      case 6:
        WeekdaySeries.Saturday.push(data[i]);
        break;
    }
  }

  const Heatmap = {
    options: {
      xaxis: {
        type: 'datetime'
      },
      chart: {
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
        customLegendItems: ['Zero', 'Low', 'Normal'],
        markers: {
          fillColors: ['#FFF', heatmapColorLow, heatmapColorNormal]
        }
      },
      colors: [heatmapColorNormal],
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.8,
          colorScale: {
            ranges: [{
              from: 1,
              to: heatmapLowUpperBound,
              name: '< ' + heatmapLowUpperBound,
              color: heatmapColorLow
            },
            {
              from: 0,
              to: 0,
              name : 'White = Zero',
              color: '#ffffff'
            }]
          }
        }
      }
    },
    series: [
      {
        name: "Monday",
        data: WeekdaySeries.Monday
      },
      {
        name: "Tuesday",
        data: WeekdaySeries.Tuesday
      },
      {
        name: "Wednesday",
        data: WeekdaySeries.Wednesday
      },
      {
        name: "Thursday",
        data: WeekdaySeries.Thursday
      },
      {
        name: "Friday",
        data: WeekdaySeries.Friday
      },
      {
        name: "Saturday",
        data: WeekdaySeries.Saturday
      },
      {
        name: "Sunday",
        data: WeekdaySeries.Sunday
      }
    ]
  };

  return <div>
    
    <Chart
      options={Heatmap.options}
      series={Heatmap.series}
      type="heatmap"
      width="800"
      height="200"
    />
    <div>
      <div>Days Learned: {daysLearned}</div>
      <div>Longest Streak: {longestStreak}</div>
      <div>Daily average: {dailyAverage}</div>
    </div>
  </div>;
}

/**
 * 
 * @param data (FullArrayRepetitionsPerDay)
 * @returns number (longest streak in days)
 */
function getLongestStreak(data) {
  var streak = 0;
  var longestStreak = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i][1] > 0) {
      streak++;
    } else {
      if (streak > longestStreak) {
        longestStreak = streak;
      }
      streak = 0;
    }
  }
  return longestStreak;
  
}

/**
 * 
 * @param data (FullArrayRepetitionsPerDay)
 * @returns number (daily average)
 */
function getDailyAverage(data) {
  var sum = 0;
  for (var i = 0; i < data.length; i++) {
    sum += data[i][1];
  }
  return Math.round(sum / data.length);
}

/**
 * 
 * @param allCards 
 * @returns an object with the number of repetitions per day
 */
function getRepetitionsPerDayObject (allCards) {
  

  const repetitionHistory = allCards?.map((card) => card.repetitionHistory);

  var repetitionHistoryDates = repetitionHistory?.map((repetition) => repetition?.map((repetition) => repetition.date));

  //flatten the repetitionHistoryDates array
  repetitionHistoryDates = repetitionHistoryDates?.flat();

  //sort dates in ascending order
  repetitionHistoryDates = repetitionHistoryDates?.sort((a,b ) => a -b);;

  //convert repetitionHistoryDatesFlatSorted into an array of dates
  repetitionHistoryDates = repetitionHistoryDates?.map((date) => new Date(date));

  //remove all NaN values from repetitionHistoryDatesFlatSortedDates
  repetitionHistoryDates = repetitionHistoryDates?.filter((date) => !isNaN(date.getTime()));


  //group dates by day and count the number of repetitions per day
  const repetitionHistoryDatesFlatSortedDatesGroupedByDay = repetitionHistoryDates?.reduce((r, a) => {
    r[a.toDateString()] = ++r[a.toDateString()] || 1;
    return r;
  }, Object.create(Object));

  //convert repetitionHistoryDatesFlatSortedDatesGroupedByDay's keys into Unix timestamps and store them in an object
  const repetitionHistoryDatesFlatSortedDatesGroupedByDayUnix = Object.keys(repetitionHistoryDatesFlatSortedDatesGroupedByDay ||{}).map((key) => {
    return {
      date: new Date(key).getTime(),
      repetitions: repetitionHistoryDatesFlatSortedDatesGroupedByDay[key]
    }
  });
 
  //return Object.entries(repetitionHistoryDatesFlatSortedDatesGroupedByDay || {});
  return repetitionHistoryDatesFlatSortedDatesGroupedByDayUnix;
} 

/**
 * 
 * @returns Array[][]
 * Format: [UnixTimespamp,nRepetitions] 
 */
function getFullArrayRepetitionsPerDay(allCards) {
  var data = getRepetitionsPerDayObject(allCards);

  
  //sort data by date in ascending order
  var dataSorted = data?.sort((a,b) => a.date - b.date);

  //get the first and last date
  var firstDate = dataSorted.at(0)?.date;
  var lastDate = dataSorted.at(-1)?.date;

  //create an object with with all days between firstDate and lastDate in the format of Unix timestamps
  var allDays = {};
  for (var d = new Date(firstDate); d <= new Date(lastDate); d.setDate(d.getDate() + 1)) {
    allDays[d.getTime()] = 0;
  }

  //iterate over dataSorted and add the repetitions to allDays
  dataSorted?.forEach((item) => {
    allDays[item.date] = item.repetitions;
  });

  

  return Object.keys(allDays).map((key) => [Number(key), allDays[key]]);
}





renderWidget(Heatmap);