import { defineStore } from 'pinia';
import { DataSet, Strong } from '../types/strong';

export const useStrongStore = defineStore('strong', {
  state: () => ({
    strongDatas: null as Strong[] | null,
    strongHeaders: null as string[] | null,
    currentDataSet: null as DataSet[] | null
  }),
  actions: {
    importDatas(csv: string) {
      const csvToArray = (csv: string) => {
        const lines = csv.split('\n');
        this.strongHeaders = lines[0].split(',').map((header: string) => header.replace(/^"(.*)"$/, '$1').trim());
        
        return lines.slice(1, lines.length - 1).map((line: string) => {
          const values = line.split(',').map((value: string) => value.replace(/^"(.*)"$/, '$1').trim());

          const strongLine = {} as Strong;
          strongLine.date = new Date(values[0]);
          strongLine.trainingName = values[1];
          strongLine.duration = values[2];
          strongLine.exerciseName = values[3];
          strongLine.seriesOrder = parseInt(values[4]);
          strongLine.weight = parseFloat(values[5]);
          strongLine.reps = parseInt(values[6]);
          strongLine.distance = parseFloat(values[7]);
          strongLine.seconds = parseFloat(values[8]);
          strongLine.notes = values[9];
          strongLine.trainingNotes = values[10];
          
          return strongLine;
        });
      };
      this.strongDatas = csvToArray(csv);
    }
  }
})