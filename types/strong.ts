export interface Strong {
  date: Date;
  trainingName: string;
  duration: string;
  exerciseName: string;
  seriesOrder: number;
  weight: number;
  reps: number;
  distance: number;
  seconds: number;
  notes: string;
  trainingNotes: string;
}

export interface DataSet {
  label: string;
  data: { x: number, y: number }[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  backgroundColor?: string;
  pointRadius?: number;
}