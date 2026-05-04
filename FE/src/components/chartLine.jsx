import React, { useState, useEffect, memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RealtimeChart = ({temp, humiditi,lights,timestamp}) => {
  const [labels, setLabels] = useState([]);
  const [temps, setTemps] = useState([]);   // nhiệt độ
  const [humidity, setHumidity] = useState([]); // độ ẩm
  const [light, setLight] = useState([]); // ánh sáng
  useEffect(() => {
    
  setTemps(pre=>{
    let tmp= [...pre,temp];
    if(tmp.length >5) tmp.shift();
    return tmp;
  }
  )
  setHumidity(pre=>{
    let hum= [...pre,humiditi];
    if(hum.length >5) hum.shift();
    return hum;
  }
  )
  setLight(pre=>{
    let li= [...pre,lights];
    if(li.length >5) li.shift();
    return li;
  }
  )
  setLabels(pre=>{
    let lab= [...pre,new Date().toLocaleTimeString()];
    if (lab.length>5) lab.shift();
    return lab;
  })

  }, [temp, humiditi, lights, timestamp]);

  const data = {
    labels,
    datasets: [
      {
        label: "Nhiệt độ (°C)",
        data: temps,
        
        borderColor: "red",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Độ ẩm (%)",
        data: humidity,
        
        borderColor: "blue",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Ánh sáng (lux)",
        data: light, // Giả sử dữ liệu ánh sáng
        borderColor: "yellow",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        // yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Thời gian" } },
      y: { title: { display: true, text: "Nhiệt độ & Độ ẩm" } },
      // y1: {
      //   type: 'linear',
      //   display: true,
      //   position: 'right',
      //   title: {
      //     display: true,
      //     text: 'Ánh sáng',
      //   },
      //   // grid line settings
        // grid: {
        //   drawOnChartArea: false, // only want the grid lines for one axis to show up
        // },
      // },
    },
  };

  return <Line data={data} options={options} />;
};

export default RealtimeChart;
