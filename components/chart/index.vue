<template>
  <div>
    <div class="flex flex-1 justify-center items-center">
    </div>
    <div v-if="selectedExercice" class="flex flex-1 justify-center items-center">
      <div class="ml-2 font-bold" @click="unselectExercice()">{{ selectedExercice }} X</div>
      <div class="ml-6 flex items-center">
        <c-input :type="'checkbox'" @click="lastSets()" />
        <label class="ml-2">3 lasts sets</label>
      </div>
    </div>
    <div class="flex-1">
      <Line v-if="loaded" :data="data" :options="options" />
    </div>
    <ul>
      <li v-for="exercise in exerciseNames">
        <c-button @click="selectExercice(exercise)">{{ exercise }}</c-button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { storeToRefs } from "pinia";
import { useStrongStore } from "../../stores/strong.store";
import { computed, ref } from 'vue';
import { DataSet } from '../../types/strong';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const strongStore = useStrongStore();

const {
  strongDatas,
} = storeToRefs(strongStore);

const data = ref(null as any);
const loaded = ref(false);
const selectedExercice = ref('');
const checked = ref(false);

const lastSets = () => {
  data.value = {
    datasets: !checked.value ? strongStore.currentDataSet!.slice(0, 6) : strongStore.currentDataSet
  }
  checked.value = !checked.value;
}

const unselectExercice = () => {
  selectedExercice.value = '';
  loaded.value = false;
}

const selectExercice = (exercise: string) => {
  if (!strongDatas.value) return;

  const exerciseData = strongDatas.value.filter((item) => item.exerciseName === exercise);
  const result: DataSet[] = [];
  const dates = exerciseData.map((item) => item.date);

  const uniqueDates = [...new Set(dates.map(dateString => (new Date(dateString)).toISOString()))];

  const numberOfColors = uniqueDates.length;
  const gradientColors = generateColorGradient(numberOfColors);

  uniqueDates.forEach((date, i) => {
    const dateData = exerciseData.filter((item) => (new Date(item.date)).toISOString() === date);
    const weightAndReps = dateData.map((item) => ({ x: item.seriesOrder, y: item.weight }));
    const seriesNumber = dateData.map((item) => ({ x: item.seriesOrder, y: item.reps }));
    
    result.push({
      label: `${date.slice(0, 10)} (Weight and Reps)`,
      data: weightAndReps,
      backgroundColor: gradientColors[i],
      borderColor: gradientColors[i],
      pointRadius: 6,
    });
    result.push({
      label: `${date.slice(0, 10)} (Series Number)`,
      data: seriesNumber,
      backgroundColor: gradientColors[i],
      borderColor: gradientColors[i],
      fill: false,
    });
  });
  loaded.value = true;
  strongStore.currentDataSet = result;
  data.value = {
    datasets: checked.value ? strongStore.currentDataSet.slice(0, 6) : strongStore.currentDataSet
  }
  selectedExercice.value = exercise;
}
const exerciseNames = computed(() => {
  const exerciseName = strongDatas.value?.map((item) => item.exerciseName);
  const uniqueexerciseNames = [...new Set(exerciseName)];
  uniqueexerciseNames.sort();
  return uniqueexerciseNames;
});

// Configure the chart options
const options = {
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Series Number',
      },
    },
    y: {
      type: 'linear',
      title: {
        display: true,
        text: 'Weight',
      },
    },
  },
  legend: {
    labels: {
      filter: function (legendItem, chartData) {
        console.log(legendItem)
        // Filter the legend items to group them
        return !legendItem.text.includes('(Series Number)'); // Modify as needed
      },
    },
  }
};

function generateColorGradient(steps: number): string[] {
  const colors = [
    "#00ff00",   // Green
    "#90ee90",   // Light Green
    "#add8e6",   // Light Blue
    "#0000ff",   // Blue
    "#800080",   // Purple
    "#ff69b4",   // Pink
    "#ff0000"    // Red
  ];

  const colorGradient: string[] = [];

  // Calculate the number of steps between each color
  const stepsBetweenColors = steps / (colors.length - 1);

  for (let i = 0; i < steps; i++) {
    const colorIndex = Math.floor(i / stepsBetweenColors);
    const lowerColor = colors[colorIndex];
    const upperColor = colors[colorIndex + 1];

    // Calculate the interpolation factor
    const interpolationFactor = (i % stepsBetweenColors) / stepsBetweenColors;

    // Interpolate between the lower and upper colors
    const interpolatedColor = interpolateColors(lowerColor, upperColor, interpolationFactor);
    colorGradient.push(interpolatedColor);
  }

  return colorGradient;
}

function interpolateColors(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}


</script>
