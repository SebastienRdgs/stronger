<template>
  <div>
    <div class="flex flex-1 justify-center items-center">
    </div>
    <div class="flex flex-1 justify-center items-center">
      <c-input-autocomplete
        v-if="exerciseNames.length"
        :openItemsWhenBlank="true"
        class="mx-1 mt-1 p-1 font-bold"
        :list="exerciseNames"
        attributeName="label"
        placeholder="Rechercher un exercice"
        @input="selectExercice"
      />
      <div class="ml-6 flex items-center" v-if="selectedExercice">
        <c-input :type="'checkbox'" @click="lastSets()" />
        <label class="ml-2">3 lasts sets</label>
      </div>
    </div>
    <div class="flex flex-1 justify-center mt-2" v-if="selectedExercice">
      <Line :height="600" :width="width" v-if="loaded" :data="data" :options="options" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { storeToRefs } from "pinia";
import { useStrongStore } from "../../stores/strong.store";
import { computed, ref } from 'vue';
import { DataSet } from '../../types/strong';
import { generateColorGradient, useIsMobile } from '../../helpers/chart';
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
const isMobile = useIsMobile();

const {
  strongDatas,
} = storeToRefs(strongStore);

const data = ref(null as any);
const loaded = ref(false);
const selectedExercice = ref('');
const checked = ref(false);
const width = ref(isMobile ? 350 : 600);

const lastSets = () => {
  data.value = {
    datasets: !checked.value ? strongStore.currentDataSet!.slice((strongStore.currentDataSet?.length! - 6), strongStore.currentDataSet?.length!) : strongStore.currentDataSet
  }
  checked.value = !checked.value;
}

const selectExercice = (exercise: any) => {
  if (!strongDatas.value) return;

  const exerciseData = strongDatas.value.filter((item) => item.exerciseName === exercise.name);
  const result: DataSet[] = [];
  const dates = exerciseData.map((item) => item.date);

  const uniqueDates = [...new Set(dates.map(dateString => (new Date(dateString)).toISOString()))];

  const numberOfColors = uniqueDates.length;
  const gradientColors = generateColorGradient(numberOfColors);

  uniqueDates.forEach((date, i) => {
    const dateData = exerciseData.filter((item) => (new Date(item.date)).toISOString() === date);
    const weightAndReps = dateData.map((item) => ({ x: item.seriesOrder, y: item.weight, reps: item.reps }));
    
    result.push({
      label: `${date.slice(0, 10)}`,
      data: weightAndReps,
      backgroundColor: gradientColors[i],
      borderColor: gradientColors[i],
      pointRadius: 6,
    });
  });
  loaded.value = true;
  strongStore.currentDataSet = result;
  data.value = {
    datasets: checked.value ? strongStore.currentDataSet.slice((strongStore.currentDataSet?.length! - 6), strongStore.currentDataSet?.length!) : strongStore.currentDataSet
  }
  selectedExercice.value = exercise;
}

const exerciseNames = computed(() => {
  const exerciseData = strongDatas.value;
  const exerciseCount = {};

  if (exerciseData) {
    exerciseData.forEach((item) => {
      const { date, exerciseName } = item;
      const formattedDate = new Date(date).toISOString().split('T')[0];

      if (!exerciseCount[exerciseName]) {
        exerciseCount[exerciseName] = new Set();
      }

      exerciseCount[exerciseName].add(formattedDate);
    });
  }

  const result = Object.keys(exerciseCount).map((exerciseName) => {
    const uniqueDays = exerciseCount[exerciseName].size;
    return { label: `${exerciseName} x ${uniqueDays}`, name: exerciseName };
  });

  return result;
});

const options = {
  responsive: false,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: false,
        text: 'Series Number',
      },
    },
    y: {
      type: 'linear',
      title: {
        display: false,
        text: 'Weight',
      },
    },
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem: any) {
          return tooltipItem.dataset.label + ": " + tooltipItem.raw.y + 'kg x ' + tooltipItem.dataset.data[tooltipItem.dataIndex].reps;
        },
      },
    },
  },
};

</script>
