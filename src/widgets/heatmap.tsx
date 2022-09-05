import { usePlugin, renderWidget, useTracker, Card, CardNamespace, Rem, useRunAsync } from '@remnote/plugin-sdk';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import  { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { HeatMapGrid } from 'react-grid-heatmap'


function Heatmap() {
  const plugin = usePlugin();


  /*const allRems = async () => {
    const rems = (await plugin.rem.getAll());
    return rems;
  }*/

  //create array of type Rem 
  /*
  var allRems: Rem[] | undefined = useTracker(
    async (reactivePlugin) => await reactivePlugin.rem.getAll()
  );*/
  
  //create array of type Card
  var allCards: Card[] | undefined = useTracker(
    async (reactivePlugin) => await reactivePlugin.card.getAll()
  );

  var cardIds = allCards?.map((card) => card._id);

  var repetitionHistory = allCards?.map((card) => card.repetitionHistory);

  var repetitionHistoryDates = repetitionHistory?.map((repetition) => repetition?.map((repetition) => repetition.date));

  //flatten the repetitionHistoryDates array

  var repetitionHistoryDatesFlat = repetitionHistoryDates?.flat();

  //sort dates in ascending order
  var repetitionHistoryDatesFlatSorted = repetitionHistoryDatesFlat?.sort((a,b ) => a -b);;

  //convert repetitionHistoryDatesFlatSorted into an array of dates
  var repetitionHistoryDatesFlatSortedDates = repetitionHistoryDatesFlatSorted?.map((date) => new Date(date));

  //remove all NaN values from repetitionHistoryDatesFlatSortedDates
  var repetitionHistoryDatesFlatSortedDatesFiltered = repetitionHistoryDatesFlatSortedDates?.filter((date) => !isNaN(date.getTime()));

  //sort dates in ascending order
  var repetitionHistoryDatesFlatSortedDatesFiltered = repetitionHistoryDatesFlatSortedDatesFiltered?.sort((a,b ) => a -b); 

  //group dates by year and count the number of repetitions per year
  var repetitionHistoryDatesFlatSortedDatesGroupedByYear = repetitionHistoryDatesFlatSortedDatesFiltered?.reduce((r, a) => {
    r[a.getFullYear()] = ++r[a.getFullYear()] || 1;
    return r;
  }, Object.create(null));

  //group the dates by month and year and count the number of repetitions per month
  var repetitionHistoryDatesFlatSortedDatesGroupedByMonth = repetitionHistoryDatesFlatSortedDatesFiltered?.reduce((r, a) => {
    r[a.getFullYear() + '-' + a.getMonth()] = ++r[a.getFullYear() + '-' + a.getMonth()] || 1;
    return r;
  }, Object.create(null));

  //group the dates by day, month and year and count the number of repetitions per day
  var repetitionHistoryDatesFlatSortedDatesGroupedByDay = repetitionHistoryDatesFlatSortedDatesFiltered?.reduce((r, a) => {
    r[a.getFullYear() + '-' + String(a.getMonth()).padStart(2, '0') + '-' + String(a.getUTCDate()).padStart(2, '0')] = ++r[a.getFullYear() + '-' + String(a.getMonth()).padStart(2, '0') + '-' + String(a.getUTCDate()).padStart(2, '0')] || 1;
    return r;
  }, Object.create(Object));

  
  //get the first and last date in repetitionHistoryDatesFlatSortedDatesFiltered
  repetitionHistoryDatesFlatSortedDatesFiltered = repetitionHistoryDatesFlatSortedDatesFiltered?.sort((a,b ) => a -b);
  var firstDate = repetitionHistoryDatesFlatSortedDatesFiltered?.slice(0, 1);
  var lastDate = repetitionHistoryDatesFlatSortedDatesFiltered?.slice(-1);


  //create an array with all days between firstDate and lastDate in the format YYYY-MM-DD
  var allDays = [];
  for (var d = new Date(firstDate); d <= new Date(lastDate); d.setDate(d.getDate() + 1)) {
    allDays.push(new Date(d).toISOString().slice(0, 10));
  }

  //create an object with allDays as the key and set the value to 0
  var allDaysObject = allDays.reduce((r, a) => {
    r[a] = 0;
    return r;
  }, Object.create(Object));

  
  
  //iterate over allDaysObject and if the keys are the same as the keys in repetitionHistoryDatesFlatSortedDatesGroupedByDay, set the value of allDaysObject to the value of repetitionHistoryDatesFlatSortedDatesGroupedByDay
  for (var key in repetitionHistoryDatesFlatSortedDatesGroupedByDay) {
    if (allDaysObject.hasOwnProperty(key)) {
      allDaysObject[key] = repetitionHistoryDatesFlatSortedDatesGroupedByDay[key];
    }
  }

  //cumulative sum of allDaysObject
  var allDaysObjectCumulativeSum = Object.keys(allDaysObject).reduce((r, k, i) => {
    r[k] = (r[Object.keys(r)[i - 1]] || 0) + allDaysObject[k];
    return r;
  }, Object.create(Object));
  
  //extract the weeks from allDaysObject and save them in an array with the format YYYY-WW
  var allDaysObjectWeeks = Object.keys(allDaysObject).map((date) => {
    var d = new Date(date);
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return d.getUTCFullYear() + '-' + String(Math.ceil((((d - yearStart) / 86400000) + 1)/7)).padStart(2, '0');
  });

  //remove duplicates from allDaysObjectWeeks
  var allDaysObjectWeeks = allDaysObjectWeeks.filter((v, i, a) => a.indexOf(v) === i);


  //create an two 

  


  const RepetitionsPerDay_keys = Object.keys(allDaysObject || {});
  const RepetitionsPerDay_values = Object.values(allDaysObject || {});


  const CumulativeSumOfRepetitions_keys = Object.keys(allDaysObjectCumulativeSum || {});
  const CumulativeSumOfRepetitions_values = Object.values(allDaysObjectCumulativeSum || {});
  
  

  var numberCards = allCards?.length;

  

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  /**
   * 
   * ####  CHARTS  ####
   * 
   */

  const CumulativeSumOfRepetitions = () => {
    return (
      <div>
        <Line
          data={{
            labels: CumulativeSumOfRepetitions_keys,
            datasets: [
              {
                label: '# of votes',
                data: CumulativeSumOfRepetitions_values,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
              },
            ],
          }}
          height={400}
          width={600}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Chart.js Line Chart',
              },
            },
          }}
        />
      </div>
    )
  }

  const RepetitionsPerDay = () => {
    return (
      <div>
        <Line
          data={{
            labels: RepetitionsPerDay_keys,
            datasets: [
              {
                label: '# of votes',
                data: RepetitionsPerDay_values,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
              },
            ],
          }}
          height={400}
          width={600}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Chart.js Line Chart',
              },
            },
          }}
        />
      </div>
    )
  }

  const xLabels = allDaysObjectWeeks;
  const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dataHM = new Array(yLabels.length)
    .fill(0)
    .map(() =>
      new Array(xLabels.length)
        .fill(0)
        .map(() => Math.floor(Math.random() * 100))
    )

  

  

    //iterate over allDaysObject 
    var week = 0;

    var weekday = 0;
    var temp = [];
    for (var key in allDaysObject) {
      temp.push(key);
      dataHM[weekday][week] = allDaysObject[key];
      weekday++;
      if (weekday == 7) {
        weekday = 0;
        week++;
      }
    }
    

    //transform xLabels from the format YYYY-WW to the format WW-YY
    var xLabels2 = xLabels.map((x) => {
      var year = x.substring(0, 4);
      var week = x.substring(5, 7);
      return week + ' ' + year.substring(2, 4);
    });




  
  return <div><RepetitionsPerDay />
  <CumulativeSumOfRepetitions />
  <HeatMapGrid
            data={dataHM}
            xLabels={xLabels}
            yLabels={yLabels}
            // Reder cell with tooltip
            cellRender={(x, y, valueHM) => (
              <div title={`Pos(${x}, ${y}) = ${valueHM}`}>{valueHM}</div>
            )}
            xLabelsStyle={(index) => ({
              color: index % 2 ? 'transparent' : '#777',
              fontSize: '.8rem'
            })}
            yLabelsStyle={() => ({
              fontSize: '.7rem',
              textTransform: 'uppercase',
              color: '#777'
            })}
            cellStyle={(_x, _y, ratio) => ({
              background: `rgb(12, 160, 44, ${ratio})`,
              fontSize: '.8rem',
              color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`
            })}
            cellHeight='2rem'
            xLabelsPos='bottom'
            onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
            yLabelsPos='right'
            square
          />
  <div>FirstDay: {JSON.stringify(firstDate)}</div>
  <div>LastDay: {JSON.stringify(lastDate)}</div>
  <div>Weeks: {JSON.stringify(allDaysObjectWeeks)}</div>
  <div>Pro Jahr: {JSON.stringify(repetitionHistoryDatesFlatSortedDatesGroupedByYear)}</div>
  <div>Pro Monat: {JSON.stringify(repetitionHistoryDatesFlatSortedDatesGroupedByMonth)}</div>
  <div>Pro Tag: {JSON.stringify(allDaysObject)}</div>
  <div>AllDays: {JSON.stringify(allDays)}</div>
  </div>;

}
/*
return <div>
  <h2>History of Repetitions </h2>
  <HeatMapGrid
            data={dataHM}
            xLabels={xLabels2}
            yLabels={yLabels}
            // Reder cell with tooltip
            cellRender={(x, y, valueHM) => (
              <div title={`Pos(${x}, ${y}) = ${valueHM}`}>{valueHM}</div>
            )}
            xLabelsStyle={(index) => ({
              color: index % 2 ? 'transparent' : '#777',
              fontSize: '.8rem',
              transform: 'rotate(0deg)'
            })}
            yLabelsStyle={() => ({
              fontSize: '.7rem',
              textTransform: 'uppercase',
              color: '#777'
            })}
            cellStyle={(_x, _y, ratio) => ({
              background: `rgb(12, 160, 44, ${ratio})`,
              fontSize: '.5rem',
              color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`
            })}
            cellHeight='1rem'
            xLabelsPos='bottom'
            yLabelsPos='right'
            square
            onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
          />
  </div>;
}
*/

function HeatmapV2 () {

  var data = getFullArrayRepetitionsPerDay();

  //create an object where the keys are Monday to Sunday
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

  const HeatmapV2 = {
    options: {
      xaxis: {
        type: 'datetime'
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#3362f0'],
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.8,
          colorScale: {
            ranges: [{
              from: 1,
              to: 30,
              name: '< 30',
              color: '#b3dff0'
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
      options={HeatmapV2.options}
      series={HeatmapV2.series}
      type="heatmap"
      width="800"
      height="200"
    />
  </div>;
}

function getRepetitionsPerDayArray() {
  return Object.entries(getRepetitionsPerDayObject() || {});
}

function getRepetitionsPerDayObject () {
  const plugin = usePlugin();

  var allCards: Card[] | undefined = useTracker(
    async (reactivePlugin) => await reactivePlugin.card.getAll()
  );

  var repetitionHistory = allCards?.map((card) => card.repetitionHistory);

  var repetitionHistoryDates = repetitionHistory?.map((repetition) => repetition?.map((repetition) => repetition.date));

  //flatten the repetitionHistoryDates array

  var repetitionHistoryDatesFlat = repetitionHistoryDates?.flat();

  //sort dates in ascending order
  var repetitionHistoryDatesFlatSorted = repetitionHistoryDatesFlat?.sort((a,b ) => a -b);;

  //convert repetitionHistoryDatesFlatSorted into an array of dates
  var repetitionHistoryDatesFlatSortedDates = repetitionHistoryDatesFlatSorted?.map((date) => new Date(date));

  //remove all NaN values from repetitionHistoryDatesFlatSortedDates
  var repetitionHistoryDatesFlatSortedDatesFiltered = repetitionHistoryDatesFlatSortedDates?.filter((date) => !isNaN(date.getTime()));

  //

  //group dates by day and count the number of repetitions per day
  var repetitionHistoryDatesFlatSortedDatesGroupedByDay = repetitionHistoryDatesFlatSortedDatesFiltered?.reduce((r, a) => {
    r[a.toDateString()] = ++r[a.toDateString()] || 1;
    return r;
  }, Object.create(Object));

  //convert repetitionHistoryDatesFlatSortedDatesGroupedByDay's keys into Unix timestamps and store them in an object
  var repetitionHistoryDatesFlatSortedDatesGroupedByDayUnix = Object.keys(repetitionHistoryDatesFlatSortedDatesGroupedByDay ||{}).map((key) => {
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
function getFullArrayRepetitionsPerDay() {
  var data = getRepetitionsPerDayObject();

  
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

function HistoryRepetitionsLineChart() {
  const LineChart = {
    options: {
      xaxis: {
        type: 'datetime'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "spline",
        width: 1
      }
    },
    series: [
      {
        name: "series-1",
        data: getFullArrayRepetitionsPerDay()
      }
      ]
  };

  return <div> 
    <Chart
      options={LineChart.options}
      series={LineChart.series}
      type="bar"
      width="1000"
    />
  </div>;
}





renderWidget(HeatmapV2);