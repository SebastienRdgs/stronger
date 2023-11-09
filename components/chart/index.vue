<template>
  <div>
    <div class="flex flex-1 justify-center items-center"></div>
    <div class="flex flex-1 justify-center items-center">
      <c-input-autocomplete v-if="exerciseNames.length" :openItemsWhenBlank="true" class="mx-1 mt-1 p-1 font-bold"
        :list="exerciseNames" attributeName="label" placeholder="Rechercher un exercice" @input="selectExercice" />
      <div v-if="selectedExercice" class="ml-6 flex items-center">
        <c-input :type="'checkbox'" @click="select('lastSets')" />
        <label class="ml-2">5 lasts sets</label>
      </div>
      <div v-if="selectedExercice" class="ml-6 flex items-center">
        <c-input :type="'checkbox'" @click="select('volume')" />
        <label class="ml-2">By volume</label>
      </div>
    </div>
    <div v-if="selectedExercice" class="flex flex-1 justify-center mt-2">
      <Line v-if="loaded" :height="600" :width="width" :data="data" :options="optionsSets" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
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
import { useStrongStore } from '../../stores/strong.store';
import { DataSet } from '../../types/strong';
import { generateColorGradient, useIsMobile } from '../../helpers/chart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const strongStore = useStrongStore();
const isMobile = useIsMobile();

const { strongDatas } = storeToRefs(strongStore);

const data = ref(null as any);
const loaded = ref(false);
const selectedExercice = ref('');
const checkedLastSets = ref(false);
const checkedVolume = ref(false);
const width = ref(isMobile ? 350 : 600);

const select = (mode: string) => {
  if (mode === 'lastSets') {
    checkedLastSets.value = !checkedLastSets.value;
  } else if (mode === 'volume') {
    checkedVolume.value = !checkedVolume.value;
  }
  data.value = {
    datasets: checkedLastSets.value
      ? checkedVolume.value
        ? strongStore.currentDataSetVolume!.slice(
          strongStore.currentDataSetVolume?.length! - 5,
          strongStore.currentDataSetVolume?.length!,
        )
        : strongStore.currentDataSet!.slice(
          strongStore.currentDataSet?.length! - 5,
          strongStore.currentDataSet?.length!,
        )
      : !checkedVolume.value
        ? strongStore.currentDataSet
        : strongStore.currentDataSetVolume,
  };
};

const selectExercice = (exercise: any) => {
  if (!strongDatas.value) return;

  const exerciseData = strongDatas.value.filter((item) => item.exerciseName === exercise.name);
  const resultDefault: DataSet[] = [];
  const resultVolume: DataSet[] = [];
  const dates = exerciseData.map((item) => item.date);

  const uniqueDates = [...new Set(dates.map((dateString) => new Date(dateString).toISOString()))];

  const numberOfColors = uniqueDates.length;
  const gradientColors = generateColorGradient(numberOfColors);

  uniqueDates.forEach((date, i) => {
    const dateData = exerciseData.filter((item) => new Date(item.date).toISOString() === date);
    const weightAndReps = dateData.map((item) => ({
      x: item.seriesOrder,
      y: item.weight,
      reps: item.reps,
      weight: item.weight,
    }));
    let accumulatedVolume = 0;

    const volume = weightAndReps.map((set) => {
      accumulatedVolume += set.weight * set.reps;
      return { ...set, y: accumulatedVolume };
    });
    resultDefault.push({
      label: `${date.slice(0, 10)}`,
      data: weightAndReps,
      backgroundColor: gradientColors[i],
      borderColor: gradientColors[i],
      pointRadius: 6,
    });
    resultVolume.push({
      label: `${date.slice(0, 10)}`,
      data: volume,
      backgroundColor: gradientColors[i],
      borderColor: gradientColors[i],
      pointRadius: 6,
    });
  });
  loaded.value = true;
  strongStore.currentDataSet = resultDefault;
  strongStore.currentDataSetVolume = resultVolume;
  data.value = {
    datasets: checkedLastSets.value
      ? checkedVolume.value
        ? strongStore.currentDataSetVolume!.slice(
          strongStore.currentDataSetVolume?.length! - 5,
          strongStore.currentDataSetVolume?.length!,
        )
        : strongStore.currentDataSet!.slice(
          strongStore.currentDataSet?.length! - 5,
          strongStore.currentDataSet?.length!,
        )
      : !checkedVolume.value
        ? strongStore.currentDataSet
        : strongStore.currentDataSetVolume,
  };
  selectedExercice.value = exercise;
};

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
    return {
      label: `${exerciseName} x ${uniqueDays}`,
      name: exerciseName,
      uniqueDays,
    };
  });

  result.sort((a, b) => b.uniqueDays - a.uniqueDays);

  return result;
});

const optionsSets = {
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
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem: any) {
          return (
            tooltipItem.dataset.label +
            ': ' +
            tooltipItem.raw.y +
            'kg x ' +
            tooltipItem.dataset.data[tooltipItem.dataIndex].reps
          );
        },
      },
    },
  },
};
</script>
